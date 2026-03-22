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

export const API_BASE_URL = __DEV__
  ? process.env.EXPO_PUBLIC_API_URL || "http://localhost:3002"
  : "https://your-production-url.com";

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

// 使用制限関連
export const USAGE = {
  WARNING_THRESHOLD: 10, // 警告を表示する残り回数の閾値
} as const;

// スタイリング定数
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  XXL: 24,
  XXXL: 32,
} as const;

export const FONT_SIZE = {
  XS: 12,
  SM: 13,
  MD: 15,
  LG: 17,
  XL: 24,
  XXL: 28,
} as const;

export const FONT_WEIGHT = {
  REGULAR: "400" as const,
  MEDIUM: "500" as const,
  SEMIBOLD: "600" as const,
  BOLD: "700" as const,
};

export const BORDER_RADIUS = {
  SM: 8,
  MD: 12,
  LG: 16,
} as const;
