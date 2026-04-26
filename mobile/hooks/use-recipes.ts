import { useState, useCallback } from "react";

import type { Recipe } from "@/domain/entities/recipe";
import {
  listRecipes,
  getRecipeById,
  searchRecipes,
} from "@/application/use-cases/list-recipes";
import { saveRecipe } from "@/application/use-cases/save-recipe";
import { updateRecipe } from "@/application/use-cases/update-recipe";
import { deleteRecipe } from "@/application/use-cases/delete-recipe";

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const refresh = useCallback(async () => {
    const data = await listRecipes();
    setRecipes(data);
  }, []);

  const save = useCallback(
    async (recipe: Recipe) => {
      await saveRecipe(recipe);
      await refresh();
    },
    [refresh]
  );

  const update = useCallback(
    async (
      id: string,
      updates: Partial<Omit<Recipe, "id" | "createdAt">>
    ) => {
      const result = await updateRecipe(id, updates);
      await refresh();
      return result;
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      const result = await deleteRecipe(id);
      await refresh();
      return result;
    },
    [refresh]
  );

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      const data = await listRecipes();
      setRecipes(data);
    } else {
      const data = await searchRecipes(query);
      setRecipes(data);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    return getRecipeById(id);
  }, []);

  return {
    recipes,
    refresh,
    save,
    update,
    remove,
    search,
    getById,
  };
}
