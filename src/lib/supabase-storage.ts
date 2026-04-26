import type { Recipe, Ingredient, Step } from "@/domain/entities/recipe";
import { createClient } from "./supabase/client";

type SupabaseRecipe = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  ingredients: {
    name: string;
    quantity: string;
    unit: string;
  }[];
  steps: {
    description: string;
    duration?: string;
  }[];
  tags: string[];
  total_time: string | null;
  prep_time: string | null;
  cook_time: string | null;
  servings: string | null;
  difficulty: string | null;
  tips: string[];
  channel_name: string | null;
  source_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
};

function toSupabaseRecipe(
  recipe: Recipe,
  userId: string
): Omit<SupabaseRecipe, "created_at" | "updated_at"> {
  return {
    id: recipe.id,
    user_id: userId,
    title: recipe.title,
    description: recipe.description ?? null,
    ingredients: recipe.ingredients.map((ing: Ingredient) => ({
      name: ing.name,
      quantity: ing.amount,
      unit: ing.unit ?? "",
    })),
    steps: recipe.steps.map((step: Step) => ({
      description: step.text,
      duration: step.duration,
    })),
    tags: recipe.category ? [recipe.category] : [],
    total_time: recipe.totalTime ?? null,
    prep_time: recipe.prepTime ?? null,
    cook_time: recipe.cookTime ?? null,
    servings: recipe.servings ?? null,
    difficulty: recipe.difficulty ?? null,
    tips: recipe.tips ?? [],
    channel_name: recipe.channelName ?? null,
    source_url: recipe.sourceUrl ?? null,
    thumbnail_url: recipe.thumbnailUrl ?? null,
  };
}

function isValidDifficulty(
  value: string
): value is "easy" | "medium" | "hard" {
  return value === "easy" || value === "medium" || value === "hard";
}

function fromSupabaseRecipe(data: SupabaseRecipe): Recipe {
  return {
    id: data.id,
    title: data.title,
    description: data.description ?? undefined,
    ingredients: data.ingredients.map((ing) => ({
      name: ing.name,
      amount: ing.quantity,
      unit: ing.unit || undefined,
    })),
    steps: data.steps.map((step, index) => ({
      stepNumber: index + 1,
      text: step.description,
      duration: step.duration,
    })),
    category: data.tags.length > 0 ? data.tags[0] : undefined,
    totalTime: data.total_time ?? undefined,
    prepTime: data.prep_time ?? undefined,
    cookTime: data.cook_time ?? undefined,
    servings: data.servings ?? undefined,
    difficulty:
      data.difficulty && isValidDifficulty(data.difficulty)
        ? data.difficulty
        : undefined,
    tips: data.tips.length > 0 ? data.tips : undefined,
    channelName: data.channel_name ?? undefined,
    sourceUrl: data.source_url ?? "",
    thumbnailUrl: data.thumbnail_url ?? undefined,
    language: "ja",
    createdAt: data.created_at,
  };
}

export async function getSupabaseRecipes(): Promise<Recipe[]> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching recipes from Supabase:", error);
    return [];
  }

  return (data as SupabaseRecipe[]).map(fromSupabaseRecipe);
}

export async function saveSupabaseRecipe(recipe: Recipe): Promise<void> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("User not authenticated");

  const supabaseRecipe = toSupabaseRecipe(recipe, session.user.id);
  const { error } = await supabase
    .from("recipes")
    .upsert(supabaseRecipe, { onConflict: "id" });

  if (error) {
    console.error("Error saving recipe to Supabase:", error);
    throw error;
  }
}

export async function deleteSupabaseRecipe(id: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("User not authenticated");

  const { error } = await supabase.from("recipes").delete().eq("id", id);

  if (error) {
    console.error("Error deleting recipe from Supabase:", error);
    throw error;
  }
}

export async function syncLocalToSupabase(
  localRecipes: Recipe[],
  userId: string
): Promise<void> {
  if (localRecipes.length === 0) return;

  const supabase = createClient();
  const supabaseRecipes = localRecipes.map((recipe) =>
    toSupabaseRecipe(recipe, userId)
  );

  const { error } = await supabase
    .from("recipes")
    .upsert(supabaseRecipes, { onConflict: "id" });

  if (error) {
    console.error("Error syncing recipes:", error);
    throw error;
  }
}
