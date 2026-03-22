import type { Recipe } from "@/domain/entities/recipe";
import { getStoredRecipes, setStoredRecipes } from "@/lib/storage";
import { deleteSupabaseRecipe } from "@/lib/supabase-storage";
import { supabase } from "@/lib/supabase";

export async function deleteRecipe(id: string): Promise<boolean> {
  const { data: session } = await supabase.auth.getSession();

  if (session.session) {
    // ログイン済み: Supabaseから削除
    try {
      await deleteSupabaseRecipe(id);
      return true;
    } catch (error) {
      console.error("Error deleting recipe from Supabase:", error);
      return false;
    }
  } else {
    // 未ログイン: ローカルストレージから削除
    const recipes = await getStoredRecipes<Recipe>();
    const filtered = recipes.filter((r) => r.id !== id);

    if (filtered.length === recipes.length) return false;

    await setStoredRecipes(filtered);
    return true;
  }
}
