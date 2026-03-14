import type { Recipe } from "@/domain/entities/recipe";
import { getStoredRecipes, setStoredRecipes } from "@/lib/storage";

export async function updateRecipe(
  id: string,
  updates: Partial<Omit<Recipe, "id" | "createdAt">>
): Promise<Recipe | undefined> {
  const recipes = await getStoredRecipes<Recipe>();
  const index = recipes.findIndex((r) => r.id === id);

  if (index < 0) return undefined;

  const updated = { ...recipes[index], ...updates };
  recipes[index] = updated;
  await setStoredRecipes(recipes);

  return updated;
}
