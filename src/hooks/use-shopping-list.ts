import { useState, useCallback } from "react";

import type { Recipe } from "@/domain/entities/recipe";
import type { ShoppingGroup } from "@/domain/entities/shopping-item";
import {
  getShoppingGroups,
  addRecipeToShoppingList,
  addManualItem,
  toggleShoppingItem,
  setShoppingItemsChecked,
  clearCheckedItems,
} from "@/application/use-cases/shopping-list";

export function useShoppingList() {
  const [groups, setGroups] = useState<ShoppingGroup[]>([]);

  const refresh = useCallback(async () => {
    const data = await getShoppingGroups();
    setGroups(data);
  }, []);

  const addRecipe = useCallback(
    async (recipe: Recipe, servings?: number) => {
      await addRecipeToShoppingList(recipe, servings);
      await refresh();
    },
    [refresh]
  );

  const toggle = useCallback(
    async (itemId: string) => {
      await toggleShoppingItem(itemId);
      await refresh();
    },
    [refresh]
  );

  const toggleAll = useCallback(
    async (itemIds: string[], checked: boolean) => {
      await setShoppingItemsChecked(itemIds, checked);
      await refresh();
    },
    [refresh]
  );

  const addItem = useCallback(
    async (name: string) => {
      await addManualItem(name);
      await refresh();
    },
    [refresh]
  );

  const clearCompleted = useCallback(async () => {
    await clearCheckedItems();
    await refresh();
  }, [refresh]);

  return {
    groups,
    refresh,
    addRecipe,
    addItem,
    toggle,
    toggleAll,
    clearCompleted,
  };
}
