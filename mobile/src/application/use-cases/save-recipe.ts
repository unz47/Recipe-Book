import type { Recipe } from "@/domain/entities/recipe";
import { getStoredRecipes, setStoredRecipes } from "@/lib/storage";

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const recipes = await getStoredRecipes<Recipe>();
  const existingIndex = recipes.findIndex((r) => r.id === recipe.id);

  if (existingIndex >= 0) {
    recipes[existingIndex] = recipe;
  } else {
    recipes.unshift(recipe);
  }

  await setStoredRecipes(recipes);
}
