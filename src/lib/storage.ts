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

function isClient(): boolean {
  return typeof window !== "undefined";
}

export async function getStoredRecipes<T>(): Promise<T[]> {
  if (!isClient()) return [];
  const raw = localStorage.getItem(RECIPES_KEY);
  if (!raw) return [];
  return safeParse<T>(raw);
}

export async function setStoredRecipes<T>(recipes: T[]): Promise<void> {
  if (!isClient()) return;
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}

export async function getStoredShoppingList<T>(): Promise<T[]> {
  if (!isClient()) return [];
  const raw = localStorage.getItem(SHOPPING_LIST_KEY);
  if (!raw) return [];
  return safeParse<T>(raw);
}

export async function setStoredShoppingList<T>(list: T[]): Promise<void> {
  if (!isClient()) return;
  localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(list));
}

export async function clearStorage(): Promise<void> {
  if (!isClient()) return;
  localStorage.removeItem(RECIPES_KEY);
  localStorage.removeItem(SHOPPING_LIST_KEY);
}
