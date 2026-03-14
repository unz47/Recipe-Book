import AsyncStorage from "@react-native-async-storage/async-storage";

const RECIPES_KEY = "recipi-book:recipes";
const SHOPPING_LIST_KEY = "recipi-book:shopping-list";

function safeParse<T>(raw: string): T[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as T[];
    return [];
  } catch {
    return [];
  }
}

export async function getStoredRecipes<T>(): Promise<T[]> {
  const raw = await AsyncStorage.getItem(RECIPES_KEY);
  if (!raw) return [];
  return safeParse<T>(raw);
}

export async function setStoredRecipes<T>(recipes: T[]): Promise<void> {
  await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}

export async function getStoredShoppingList<T>(): Promise<T[]> {
  const raw = await AsyncStorage.getItem(SHOPPING_LIST_KEY);
  if (!raw) return [];
  return safeParse<T>(raw);
}

export async function setStoredShoppingList<T>(list: T[]): Promise<void> {
  await AsyncStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(list));
}
