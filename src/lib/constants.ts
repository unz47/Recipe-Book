// Re-export shared constants from the mobile project's domain
// These are framework-independent constants

export const COLORS = {
  primary: {
    50: "#FFF5F0",
    100: "#FFE8DB",
    200: "#FFD0B8",
    300: "#FFB08A",
    400: "#FF8A56",
    500: "#E86A30",
    600: "#C85420",
    700: "#A84218",
    DEFAULT: "#E86A30",
  },
  secondary: {
    50: "#F4F7F4",
    100: "#E4ECE4",
    500: "#5C8A5C",
    DEFAULT: "#5C8A5C",
  },
  accent: {
    50: "#FFFBF0",
    100: "#FFF3D6",
    500: "#E5A820",
    600: "#C08A18",
    DEFAULT: "#E5A820",
  },
  neutral: {
    50: "#FAFAF8",
    100: "#F5F4F1",
    200: "#E8E6E1",
    300: "#D4D1CA",
    400: "#B0ACA3",
    500: "#8A8680",
    600: "#6B6862",
    700: "#4D4A46",
    800: "#33312E",
    900: "#1F1E1C",
  },
  danger: "#D64545",
  white: "#FFFFFF",
} as const;

export const DIFFICULTY_LABELS = {
  easy: "簡単",
  medium: "普通",
  hard: "難しい",
} as const;

export const DIFFICULTY_COLORS = {
  easy: { bg: "#E4ECE4", text: "#5C8A5C" },
  medium: { bg: "#FFF3D6", text: "#C08A18" },
  hard: { bg: "#FFE8DB", text: "#C85420" },
} as const;

export const RECIPE_THUMBNAIL_COLORS = [
  "#FFE8DB",
  "#F4F7F4",
  "#FFFBF0",
  "#FFF5F0",
  "#FFF3D6",
] as const;

export const RECIPE_CATEGORIES = [
  "和食",
  "洋食",
  "中華",
  "韓国料理",
  "イタリアン",
  "エスニック",
  "お菓子",
  "パン",
  "簡単",
  "作り置き",
] as const;

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];

export const PLANS = {
  free: {
    label: "Free",
    monthlyExtractionLimit: 5,
    recipeStorageLimit: 10,
    cloudSync: false,
  },
  premium: {
    label: "Premium",
    monthlyExtractionLimit: Infinity, // 無制限
    recipeStorageLimit: Infinity, // 無制限
    cloudSync: true,
    price: {
      monthly: 380,
      yearly: 2800,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

export const USAGE = {
  WARNING_THRESHOLD: 2,
} as const;
