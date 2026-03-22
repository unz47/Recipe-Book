import type { Recipe } from "@/domain/entities/recipe";
import { getStoredRecipes, setStoredRecipes } from "@/lib/storage";
import { saveSupabaseRecipe, getSupabaseRecipes } from "@/lib/supabase-storage";
import { supabase } from "@/lib/supabase";

export async function updateRecipe(
  id: string,
  updates: Partial<Omit<Recipe, "id" | "createdAt">>
): Promise<Recipe | undefined> {
  const { data: session } = await supabase.auth.getSession();

  if (session.session) {
    // ログイン済み: Supabaseで更新
    const recipes = await getSupabaseRecipes();
    const recipe = recipes.find((r) => r.id === id);

    if (!recipe) return undefined;

    const updated = { ...recipe, ...updates };
    await saveSupabaseRecipe(updated);

    return updated;
  } else {
    // 未ログイン: ローカルストレージで更新
    const recipes = await getStoredRecipes<Recipe>();
    const index = recipes.findIndex((r) => r.id === id);

    if (index < 0) return undefined;

    const updated = { ...recipes[index], ...updates };
    recipes[index] = updated;
    await setStoredRecipes(recipes);

    return updated;
  }
}
