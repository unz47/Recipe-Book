import type { Recipe } from "@/domain/entities/recipe";
import { supabase } from "@/lib/supabase";

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
  created_at: string;
  updated_at: string;
};

function toSupabaseRecipe(recipe: Recipe, userId: string): Omit<SupabaseRecipe, "created_at" | "updated_at"> {
  return {
    id: recipe.id,
    user_id: userId,
    title: recipe.title,
    description: recipe.description ?? null,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    tags: recipe.tags ?? [],
    total_time: recipe.totalTime ?? null,
    prep_time: recipe.prepTime ?? null,
    cook_time: recipe.cookTime ?? null,
    servings: recipe.servings ?? null,
    difficulty: recipe.difficulty ?? null,
    tips: recipe.tips ?? [],
    channel_name: recipe.channelName ?? null,
    source_url: recipe.sourceUrl ?? null,
  };
}

function fromSupabaseRecipe(data: SupabaseRecipe): Recipe {
  return {
    id: data.id,
    title: data.title,
    description: data.description ?? undefined,
    ingredients: data.ingredients,
    steps: data.steps,
    tags: data.tags.length > 0 ? data.tags : undefined,
    totalTime: data.total_time ?? undefined,
    prepTime: data.prep_time ?? undefined,
    cookTime: data.cook_time ?? undefined,
    servings: data.servings ?? undefined,
    difficulty: data.difficulty ?? undefined,
    tips: data.tips.length > 0 ? data.tips : undefined,
    channelName: data.channel_name ?? undefined,
    sourceUrl: data.source_url ?? undefined,
    createdAt: data.created_at,
  };
}

export async function getSupabaseRecipes(): Promise<Recipe[]> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    return [];
  }

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
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    throw new Error("User not authenticated");
  }

  const supabaseRecipe = toSupabaseRecipe(recipe, session.session.user.id);

  const { error } = await supabase
    .from("recipes")
    .upsert(supabaseRecipe, { onConflict: "id" });

  if (error) {
    console.error("Error saving recipe to Supabase:", error);
    throw error;
  }
}

export async function deleteSupabaseRecipe(id: string): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase.from("recipes").delete().eq("id", id);

  if (error) {
    console.error("Error deleting recipe from Supabase:", error);
    throw error;
  }
}

export async function syncLocalToSupabase(localRecipes: Recipe[], userId: string): Promise<void> {
  console.log("[syncLocalToSupabase] Starting sync, recipes count:", localRecipes.length);
  console.log("[syncLocalToSupabase] User ID:", userId);

  try {
    if (localRecipes.length === 0) {
      console.log("[syncLocalToSupabase] No recipes to sync");
      return;
    }

    // ローカルのレシピを全てSupabaseにアップロード
    console.log("[syncLocalToSupabase] Converting recipes to Supabase format...");
    const supabaseRecipes = localRecipes.map((recipe) => toSupabaseRecipe(recipe, userId));

    console.log("[syncLocalToSupabase] Upserting", supabaseRecipes.length, "recipes to Supabase...");
    const { error } = await supabase
      .from("recipes")
      .upsert(supabaseRecipes, { onConflict: "id" });

    if (error) {
      console.error("[syncLocalToSupabase] Error syncing recipes:", error);
      throw error;
    }

    console.log("[syncLocalToSupabase] Sync completed successfully");
  } catch (error) {
    console.error("[syncLocalToSupabase] Unexpected error:", error);
    throw error;
  }
}
