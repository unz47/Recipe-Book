export type Ingredient = {
  name: string;
  amount: string;
  unit?: string;
  notes?: string;
};

export type Step = {
  stepNumber: number;
  text: string;
  duration?: string;
};

export type Recipe = {
  id: string;
  title: string;
  description?: string;
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  ingredients: Ingredient[];
  steps: Step[];
  tips?: string[];
  tags?: string[];
  difficulty?: "easy" | "medium" | "hard";
  sourceUrl: string;
  thumbnailUrl?: string;
  channelName?: string;
  language: "ja" | "en";
  createdAt: Date;
};
