import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FFF5F0",
          100: "#FFE8DB",
          200: "#FFD0B8",
          300: "#FFB08A",
          400: "#FF8A56",
          500: "#E86A30",
          600: "#C85420",
          700: "#A84218",
          800: "#7A3014",
          900: "#4D1E0D",
          950: "#2D1008",
          DEFAULT: "#E86A30",
        },
        secondary: {
          50: "#F4F7F4",
          100: "#E4ECE4",
          200: "#C8D9C8",
          300: "#A3BFA3",
          400: "#7DA37D",
          500: "#5C8A5C",
          600: "#4A7150",
          700: "#3B5B40",
          800: "#2D4530",
          900: "#1E2F20",
          950: "#111C13",
          DEFAULT: "#5C8A5C",
        },
        accent: {
          50: "#FFFBF0",
          100: "#FFF3D6",
          200: "#FFE5A8",
          300: "#FFD470",
          400: "#F5BC3C",
          500: "#E5A820",
          600: "#C08A18",
          700: "#996E14",
          800: "#735210",
          900: "#4D370A",
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
          950: "#121110",
        },
        danger: {
          DEFAULT: "#D64545",
        },
      },
      fontFamily: {
        inter: ["Inter"],
      },
    },
  },
  plugins: [],
};

export default config;
