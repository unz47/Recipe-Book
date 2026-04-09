export type IngredientDto = {
  name: string;
  amount: string;
  unit?: string;
  notes?: string;
};

export type StepDto = {
  stepNumber: number;
  text: string;
  duration?: string;
};

export type RecipeDto = {
  id: string;
  title: string;
  description?: string;
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  ingredients: IngredientDto[];
  steps: StepDto[];
  tips?: string[];
  difficulty?: "easy" | "medium" | "hard";
  sourceUrl: string;
  thumbnailUrl?: string;
  channelName?: string;
  language: "ja" | "en";
  createdAt: string;
};

export type ExtractRecipeInput = {
  url: string;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
