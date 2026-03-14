import type { Recipe } from "@/domain/entities/recipe";
import type {
  ShoppingItem,
  ShoppingGroup,
} from "@/domain/entities/shopping-item";
import {
  getStoredShoppingList,
  setStoredShoppingList,
} from "@/lib/storage";
import { generateId, adjustAmount } from "@/lib/utils";

export async function getShoppingList(): Promise<ShoppingItem[]> {
  return getStoredShoppingList<ShoppingItem>();
}

export async function getShoppingGroups(): Promise<ShoppingGroup[]> {
  const items = await getShoppingList();
  const groupMap = new Map<string, ShoppingGroup>();

  for (const item of items) {
    const group = groupMap.get(item.recipeId);
    if (group) {
      group.items.push(item);
    } else {
      groupMap.set(item.recipeId, {
        recipeId: item.recipeId,
        recipeTitle: item.recipeTitle,
        servings: item.servings,
        items: [item],
      });
    }
  }

  return Array.from(groupMap.values());
}

export async function addRecipeToShoppingList(
  recipe: Recipe,
  servings?: number
): Promise<void> {
  const existing = await getShoppingList();

  const alreadyAdded = existing.some((item) => item.recipeId === recipe.id);
  if (alreadyAdded) return;

  const baseServings = parseInt(recipe.servings ?? "2", 10) || 2;
  const ratio = servings ? servings / baseServings : 1;

  const newItems: ShoppingItem[] = recipe.ingredients.map((ing) => ({
    id: generateId(),
    recipeId: recipe.id,
    recipeTitle: recipe.title,
    ingredientName: ing.name,
    amount: `${adjustAmount(ing.amount, ratio)}${ing.unit ? ` ${ing.unit}` : ""}`,
    unit: ing.unit,
    checked: false,
    servings,
  }));

  await setStoredShoppingList([...existing, ...newItems]);
}

export async function setShoppingItemsChecked(
  itemIds: string[],
  checked: boolean
): Promise<void> {
  const items = await getShoppingList();
  const idSet = new Set(itemIds);
  const updated = items.map((i) =>
    idSet.has(i.id) ? { ...i, checked } : i
  );
  await setStoredShoppingList(updated);
}

export async function toggleShoppingItem(itemId: string): Promise<void> {
  const items = await getShoppingList();
  const index = items.findIndex((i) => i.id === itemId);
  if (index < 0) return;

  items[index] = { ...items[index], checked: !items[index].checked };
  await setStoredShoppingList(items);
}

export async function clearCheckedItems(): Promise<void> {
  const items = await getShoppingList();
  await setStoredShoppingList(items.filter((i) => !i.checked));
}

export const MANUAL_GROUP_ID = "__manual__";
export const MANUAL_GROUP_TITLE = "その他";

export async function addManualItem(name: string): Promise<void> {
  const items = await getShoppingList();
  const newItem: ShoppingItem = {
    id: generateId(),
    recipeId: MANUAL_GROUP_ID,
    recipeTitle: MANUAL_GROUP_TITLE,
    ingredientName: name,
    amount: "",
    checked: false,
  };
  await setStoredShoppingList([...items, newItem]);
}

export async function removeRecipeFromShoppingList(
  recipeId: string
): Promise<void> {
  const items = await getShoppingList();
  await setStoredShoppingList(items.filter((i) => i.recipeId !== recipeId));
}
