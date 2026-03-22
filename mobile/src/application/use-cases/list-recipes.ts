import type { Recipe } from "@/domain/entities/recipe";
import { getStoredRecipes } from "@/lib/storage";
import { getSupabaseRecipes } from "@/lib/supabase-storage";
import { supabase } from "@/lib/supabase";

async function getRecipes(): Promise<Recipe[]> {
  const { data: session } = await supabase.auth.getSession();

  if (session.session) {
    // ログイン済み: Supabaseから取得
    return getSupabaseRecipes();
  } else {
    // 未ログイン: ローカルストレージから取得
    return getStoredRecipes<Recipe>();
  }
}

export async function listRecipes(): Promise<Recipe[]> {
  return getRecipes();
}

export async function getRecipeById(
  id: string
): Promise<Recipe | undefined> {
  const recipes = await getRecipes();
  return recipes.find((r) => r.id === id);
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const recipes = await getRecipes();
  const lowerQuery = query.toLowerCase();

  return recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(lowerQuery) ||
      r.description?.toLowerCase().includes(lowerQuery) ||
      r.ingredients.some((i) => i.name.toLowerCase().includes(lowerQuery))
  );
}
