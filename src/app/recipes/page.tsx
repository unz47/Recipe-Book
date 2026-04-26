"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Star, Clock, ChefHat } from "lucide-react";

import type { Recipe } from "@/domain/entities/recipe";
import { Badge } from "@/components/ui/badge";
import { useRecipes } from "@/hooks/use-recipes";
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  RECIPE_THUMBNAIL_COLORS,
  RECIPE_CATEGORIES,
} from "@/lib/constants";

const FILTER_TABS = ["all", "favorites", ...RECIPE_CATEGORIES] as const;

export default function RecipesPage() {
  const router = useRouter();
  const { recipes, search, refresh } = useRecipes();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleSearch = (text: string) => {
    setQuery(text);
    void search(text);
  };

  const filteredRecipes = recipes.filter((r) => {
    if (activeCategory === "favorites") return r.isFavorite;
    if (activeCategory !== "all") return r.category === activeCategory;
    return true;
  });

  const chipLabel = (cat: string) => {
    if (cat === "all") return "すべて";
    if (cat === "favorites") return "お気に入り";
    return cat;
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-5 sm:px-6 sm:py-8">
      {/* Title */}
      <h1 className="mb-5 text-2xl font-bold text-app-text">レシピ一覧</h1>

      {/* Search Bar */}
      <div className="mb-4 flex h-11 items-center gap-2.5 rounded-[10px] border border-app-border bg-white px-3.5">
        <Search className="h-[18px] w-[18px] shrink-0 text-app-text-placeholder" />
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="レシピを検索..."
          className="h-full flex-1 bg-transparent text-sm text-app-text placeholder:text-app-text-placeholder focus:outline-none"
        />
      </div>

      {/* Filter Chips */}
      <div className="-mx-5 mb-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
        {FILTER_TABS.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-3.5 text-[13px] font-medium transition-colors ${
              activeCategory === cat
                ? "bg-app-primary text-white"
                : "border border-app-border bg-white text-app-text-secondary hover:bg-app-surface"
            }`}
          >
            {cat === "favorites" && (
              <Star
                className="h-3 w-3"
                fill={activeCategory === cat ? "#fff" : "#E5A820"}
                color={activeCategory === cat ? "#fff" : "#E5A820"}
              />
            )}
            {chipLabel(cat)}
          </button>
        ))}
      </div>

      {/* Recipe List */}
      {filteredRecipes.length === 0 ? (
        <div className="py-20 text-center">
          <ChefHat className="mx-auto mb-4 h-12 w-12 text-app-text-placeholder" />
          <p className="mb-1 text-base text-app-text-muted">
            レシピがありません
          </p>
          <p className="text-sm text-app-text-placeholder">
            ホーム画面から YouTube 動画の URL を入力してレシピを抽出しましょう
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecipes.map((recipe, index) => (
            <RecipeRow
              key={recipe.id}
              recipe={recipe}
              index={index}
              onClick={() => router.push(`/recipes/${recipe.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Recipe Row Component ---

type RecipeRowProps = {
  recipe: Recipe;
  index: number;
  onClick: () => void;
};

function RecipeRow({ recipe, index, onClick }: RecipeRowProps) {
  const bgColor =
    RECIPE_THUMBNAIL_COLORS[index % RECIPE_THUMBNAIL_COLORS.length];
  const difficulty = recipe.difficulty;

  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center gap-3.5 rounded-xl border border-app-border bg-white p-3 transition-all hover:shadow-sm hover:border-app-primary/30"
    >
      {/* Thumbnail */}
      {recipe.thumbnailUrl ? (
        <img
          src={recipe.thumbnailUrl}
          alt={recipe.title}
          className="h-[72px] w-[72px] shrink-0 rounded-[10px] object-cover"
        />
      ) : (
        <div
          className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[10px]"
          style={{ backgroundColor: bgColor }}
        >
          <ChefHat className="h-7 w-7 text-app-text-placeholder" />
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-app-text">
            {recipe.title}
          </h3>
          {recipe.isFavorite && (
            <Star className="h-4 w-4 shrink-0 fill-app-accent text-app-accent" />
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          {recipe.totalTime && (
            <span className="flex items-center gap-1 text-xs text-app-text-muted">
              <Clock className="h-3 w-3" />
              {recipe.totalTime}
            </span>
          )}
          {difficulty && (
            <Badge
              variant="secondary"
              className="h-5 text-[11px] px-1.5 py-0"
              style={{
                backgroundColor: DIFFICULTY_COLORS[difficulty].bg,
                color: DIFFICULTY_COLORS[difficulty].text,
              }}
            >
              {DIFFICULTY_LABELS[difficulty]}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
