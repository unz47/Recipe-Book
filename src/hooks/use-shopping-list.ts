"use client";

import { useState, useCallback } from "react";
import type { ShoppingGroup } from "@/domain/entities/shopping-item";
import {
  getShoppingGroups,
  addManualShoppingItem,
  toggleShoppingItem,
  toggleAllInGroup,
  clearCheckedItems,
  removeRecipeFromShoppingList,
} from "@/lib/use-cases";

export function useShoppingList() {
  const [groups, setGroups] = useState<ShoppingGroup[]>([]);

  const refresh = useCallback(async () => {
    const data = await getShoppingGroups();
    setGroups(data);
  }, []);

  const addItem = useCallback(
    async (name: string) => {
      await addManualShoppingItem(name);
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
    async (recipeId: string, checked: boolean) => {
      await toggleAllInGroup(recipeId, checked);
      await refresh();
    },
    [refresh]
  );

  const clearCompleted = useCallback(async () => {
    await clearCheckedItems();
    await refresh();
  }, [refresh]);

  const removeGroup = useCallback(
    async (recipeId: string) => {
      await removeRecipeFromShoppingList(recipeId);
      await refresh();
    },
    [refresh]
  );

  return { groups, refresh, addItem, toggle, toggleAll, clearCompleted, removeGroup };
}
