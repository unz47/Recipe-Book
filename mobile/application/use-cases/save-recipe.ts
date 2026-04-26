import type { Recipe } from "@/domain/entities/recipe";
import { getStoredRecipes, setStoredRecipes } from "@/lib/storage";
import { saveSupabaseRecipe } from "@/lib/supabase-storage";
import { supabase } from "@/lib/supabase";

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const { data: session } = await supabase.auth.getSession();

  if (session.session) {
    // ログイン済み: Supabaseに保存
    await saveSupabaseRecipe(recipe);
  } else {
    // 未ログイン: ローカルストレージに保存
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
