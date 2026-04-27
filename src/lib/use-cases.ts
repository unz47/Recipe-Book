/**
 * Web版の Application Use Cases
 * モバイル版と同じロジックだが、Web用のインフラ (localStorage, @supabase/ssr) を使用
 */

import type { Recipe } from "@/domain/entities/recipe";
import type {
  ShoppingItem,
  ShoppingGroup,
} from "@/domain/entities/shopping-item";
import { createClient } from "./supabase/client";
import {
  getStoredRecipes,
  setStoredRecipes,
  getStoredShoppingList,
  setStoredShoppingList,
} from "./storage";
import {
  getSupabaseRecipes,
  saveSupabaseRecipe,
  deleteSupabaseRecipe,
} from "./supabase-storage";

// --- Recipe CRUD ---

async function isLoggedIn(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session;
}

export async function listRecipes(): Promise<Recipe[]> {
  if (await isLoggedIn()) {
    return getSupabaseRecipes();
  }
  return getStoredRecipes<Recipe>();
}

export async function getRecipeById(
  id: string
): Promise<Recipe | undefined> {
  const recipes = await listRecipes();
  return recipes.find((r) => r.id === id);
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const recipes = await listRecipes();
  const lowerQuery = query.toLowerCase();
  return recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(lowerQuery) ||
      r.description?.toLowerCase().includes(lowerQuery) ||
      r.ingredients.some((i) => i.name.toLowerCase().includes(lowerQuery))
  );
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  if (await isLoggedIn()) {
    await saveSupabaseRecipe(recipe);
  } else {
    const recipes = await getStoredRecipes<Recipe>();
    const existingIndex = recipes.findIndex((r) => r.id === recipe.id);
    if (existingIndex >= 0) {
      recipes[existingIndex] = recipe;
    } else {
      recipes.unshift(recipe);
    }
    await setStoredRecipes(recipes);
  }
}

export async function updateRecipe(
  id: string,
  updates: Partial<Omit<Recipe, "id" | "createdAt">>
): Promise<Recipe | undefined> {
  if (await isLoggedIn()) {
    const recipes = await getSupabaseRecipes();
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe) return undefined;
    const updated = { ...recipe, ...updates };
    await saveSupabaseRecipe(updated);
    return updated;
  } else {
    const recipes = await getStoredRecipes<Recipe>();
    const index = recipes.findIndex((r) => r.id === id);
    if (index < 0) return undefined;
    const updated = { ...recipes[index], ...updates };
    recipes[index] = updated;
    await setStoredRecipes(recipes);
    return updated;
  }
}

export async function deleteRecipe(id: string): Promise<boolean> {
  if (await isLoggedIn()) {
    try {
      await deleteSupabaseRecipe(id);
      return true;
    } catch {
      return false;
    }
  } else {
    const recipes = await getStoredRecipes<Recipe>();
    const filtered = recipes.filter((r) => r.id !== id);
    if (filtered.length === recipes.length) return false;
    await setStoredRecipes(filtered);
    return true;
  }
}

// --- Extract Recipe ---

type RecipeDto = {
  id: string;
  title: string;
  description?: string;
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  ingredients: { name: string; amount: string; unit?: string; notes?: string }[];
  steps: { stepNumber: number; text: string; duration?: string }[];
  tips?: string[];
  difficulty?: "easy" | "medium" | "hard";
  sourceUrl: string;
  thumbnailUrl?: string;
  channelName?: string;
  language: "ja" | "en";
  createdAt: string;
};

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function extractRecipeFromApi(
  url: string
): Promise<ActionResult<RecipeDto>> {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await supabase.functions.invoke("extract-recipe", {
      body: { url },
      headers,
    });

    if (response.error) {
      // FunctionsHttpError の場合、error.context は Response オブジェクト
      // response.data は null なので、context から body を取得する
      let errorMessage =
        response.error.message ||
        "サーバーとの通信に失敗しました。もう一度お試しください。";

      try {
        const ctx = (response.error as { context?: Response }).context;
        if (ctx) {
          const errorBody = (await ctx.json()) as {
            success: false;
            error: string;
          };
          if (errorBody?.error) {
            errorMessage = errorBody.error;
          }
        }
      } catch {
        // context の json パース失敗時は元のメッセージを使う
      }

      console.error("extract-recipe error:", errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }

    return response.data as ActionResult<RecipeDto>;
  } catch (err) {
    console.error("extract-recipe unexpected error:", err);
    return {
      success: false,
      error: "サーバーに接続できません。もう一度お試しください。",
    };
  }
}

// --- Usage ---

const PLAN_LIMITS = {
  free: 5,
  premium: 50,
} as const;

type PlanType = keyof typeof PLAN_LIMITS;

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export async function getUserUsage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      remaining: PLAN_LIMITS.free,
      limit: PLAN_LIMITS.free,
      used: 0,
      plan: "free" as PlanType,
    };
  }

  const currentMonth = getCurrentMonth();
  const { data, error } = await supabase
    .from("user_usage")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", currentMonth)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch user usage:", error);
    // エラー時はデフォルト値を返してUIをブロックしない
    return {
      remaining: PLAN_LIMITS.free,
      limit: PLAN_LIMITS.free,
      used: 0,
      plan: "free" as PlanType,
    };
  }

  if (!data) {
    return {
      remaining: PLAN_LIMITS.free,
      limit: PLAN_LIMITS.free,
      used: 0,
      plan: "free" as PlanType,
    };
  }

  const limit = PLAN_LIMITS[data.plan as PlanType];
  const remaining = Math.max(0, limit - data.extraction_count);

  return {
    remaining,
    limit,
    used: data.extraction_count,
    plan: data.plan as PlanType,
  };
}

export async function checkUsageLimit(): Promise<boolean> {
  const usage = await getUserUsage();
  return usage.used < usage.limit;
}

export async function incrementUsageCount(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const currentMonth = getCurrentMonth();
  const { error } = await supabase.rpc("increment_extraction_count", {
    p_user_id: user.id,
    p_month: currentMonth,
  });

  if (error) {
    console.error("Failed to increment usage count:", error);
  }
}

// --- Shopping List ---

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function adjustAmount(amount: string, ratio: number): string {
  const match = amount.match(/^(\d+(?:\.\d+)?)\s*(.*)/);
  if (!match) return amount;
  const num = parseFloat(match[1]);
  if (isNaN(num)) return amount;
  const suffix = match[2]; // 単位が含まれていた場合保持する（例: "500g" → "g"）
  const adjusted = num * ratio;
  const adjustedStr = Number.isInteger(adjusted)
    ? adjusted.toString()
    : parseFloat(adjusted.toFixed(2)).toString();
  return suffix ? `${adjustedStr}${suffix}` : adjustedStr;
}

export async function getShoppingGroups(): Promise<ShoppingGroup[]> {
  const items = await getStoredShoppingList<ShoppingItem>();
  const groupMap = new Map<string, ShoppingGroup>();

  for (const item of items) {
    const group = groupMap.get(item.recipeId);
    if (group) {
      group.items.push(item);
    } else {
      groupMap.set(item.recipeId, {
        recipeId: item.recipeId,
        recipeTitle: item.recipeTitle,
        servings: item.servings,
        items: [item],
      });
    }
  }

  return Array.from(groupMap.values());
}

export async function addRecipeToShoppingList(
  recipe: Recipe,
  servings?: number
): Promise<void> {
  const existing = await getStoredShoppingList<ShoppingItem>();
  const alreadyAdded = existing.some((item) => item.recipeId === recipe.id);
  if (alreadyAdded) return;

  const baseServings = parseInt(recipe.servings ?? "2", 10) || 2;
  const ratio = servings ? servings / baseServings : 1;

  const newItems: ShoppingItem[] = recipe.ingredients.map((ing) => ({
    id: generateId(),
    recipeId: recipe.id,
    recipeTitle: recipe.title,
    ingredientName: ing.name,
    amount: `${adjustAmount(ing.amount, ratio)}${ing.unit ? ` ${ing.unit}` : ""}`,
    unit: ing.unit,
    checked: false,
    servings,
  }));

  await setStoredShoppingList([...existing, ...newItems]);
}

export async function toggleShoppingItem(itemId: string): Promise<void> {
  const items = await getStoredShoppingList<ShoppingItem>();
  const index = items.findIndex((i) => i.id === itemId);
  if (index < 0) return;
  items[index] = { ...items[index], checked: !items[index].checked };
  await setStoredShoppingList(items);
}

export async function toggleAllInGroup(
  recipeId: string,
  checked: boolean
): Promise<void> {
  const items = await getStoredShoppingList<ShoppingItem>();
  const updated = items.map((i) =>
    i.recipeId === recipeId ? { ...i, checked } : i
  );
  await setStoredShoppingList(updated);
}

export async function clearCheckedItems(): Promise<void> {
  const items = await getStoredShoppingList<ShoppingItem>();
  await setStoredShoppingList(items.filter((i) => !i.checked));
}

export const MANUAL_GROUP_ID = "__manual__";
export const MANUAL_GROUP_TITLE = "その他";

export async function addManualShoppingItem(name: string): Promise<void> {
  const items = await getStoredShoppingList<ShoppingItem>();
  const newItem: ShoppingItem = {
    id: generateId(),
    recipeId: MANUAL_GROUP_ID,
    recipeTitle: MANUAL_GROUP_TITLE,
    ingredientName: name,
    amount: "",
    checked: false,
  };
  await setStoredShoppingList([...items, newItem]);
}

export async function removeRecipeFromShoppingList(
  recipeId: string
): Promise<void> {
  const items = await getStoredShoppingList<ShoppingItem>();
  await setStoredShoppingList(items.filter((i) => i.recipeId !== recipeId));
}
