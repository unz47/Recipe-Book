import type { Recipe } from "@/domain/entities/recipe";
import { getStoredRecipes } from "@/lib/storage";

export async function listRecipes(): Promise<Recipe[]> {
  return getStoredRecipes<Recipe>();
}

export async function getRecipeById(
  id: string
): Promise<Recipe | undefined> {
  const recipes = await getStoredRecipes<Recipe>();
  return recipes.find((r) => r.id === id);
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const recipes = await getStoredRecipes<Recipe>();
  const lowerQuery = query.toLowerCase();

  return recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(lowerQuery) ||
      r.description?.toLowerCase().includes(lowerQuery) ||
      r.ingredients.some((i) => i.name.toLowerCase().includes(lowerQuery))
  );
}
