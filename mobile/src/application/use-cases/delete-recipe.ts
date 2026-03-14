import type { Recipe } from "@/domain/entities/recipe";
import { getStoredRecipes, setStoredRecipes } from "@/lib/storage";

export async function deleteRecipe(id: string): Promise<boolean> {
  const recipes = await getStoredRecipes<Recipe>();
  const filtered = recipes.filter((r) => r.id !== id);

  if (filtered.length === recipes.length) return false;

  await setStoredRecipes(filtered);
  return true;
}
