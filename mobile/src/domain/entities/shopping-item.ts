export type ShoppingItem = {
  id: string;
  recipeId: string;
  recipeTitle: string;
  ingredientName: string;
  amount: string;
  unit?: string;
  checked: boolean;
  servings?: number;
};

export type ShoppingGroup = {
  recipeId: string;
  recipeTitle: string;
  servings?: number;
  items: ShoppingItem[];
};
