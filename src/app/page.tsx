"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Clock,
  ChefHat,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";

import Link from "next/link";
import type { Recipe } from "@/domain/entities/recipe";
import { Badge } from "@/components/ui/badge";
import { useRecipes } from "@/hooks/use-recipes";
import { useExtractRecipe } from "@/hooks/use-extract-recipe";
import { useAuth } from "@/hooks/use-auth";
import { useUsage } from "@/hooks/use-usage";
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS, RECIPE_THUMBNAIL_COLORS, PLANS } from "@/lib/constants";

export default function HomePage() {
  const router = useRouter();
  const { recipes, refresh, save } = useRecipes();
  const extractState = useExtractRecipe();
  const { isAuthenticated } = useAuth();
  const { usage, refresh: refreshUsage } = useUsage();
  const [url, setUrl] = useState("");
  const [storageLimitReached, setStorageLimitReached] = useState(false);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const result = await extractState.extract(url.trim());

    if (result === "limit_reached") {
      return;
    }

    if (result?.id) {
      const recipe: Recipe = {
        ...result,
        createdAt: result.createdAt ?? new Date().toISOString(),
      };
      const saveResult = await save(recipe);
      if (!saveResult.success && saveResult.reason === "storage_limit_reached") {
        extractState.reset();
        setStorageLimitReached(true);
        return;
      }
      setStorageLimitReached(false);
      setUrl("");
      void refreshUsage();
      router.push(`/recipes/${recipe.id}`);
    }
  };

  const recentRecipes = recipes.slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6 sm:py-12">
      {/* Hero Section */}
      <section className="mb-8 sm:mb-12 sm:text-center">
        <div className="sm:mx-auto sm:max-w-2xl">
          <div className="mb-2 flex items-center gap-2 sm:justify-center">
            <h1 className="text-2xl font-bold tracking-tight text-app-text sm:text-4xl">
              <span className="sm:hidden">料理動画からレシピを抽出</span>
              <span className="hidden sm:inline">
                料理動画から
                <span className="text-app-primary">レシピを抽出</span>
              </span>
            </h1>
          </div>
          <p className="text-[15px] text-app-text-muted sm:text-lg sm:text-app-text-secondary">
            <span className="sm:hidden">YouTube URL を貼り付けるだけ</span>
            <span className="hidden sm:inline">
              YouTube の料理動画 URL を貼り付けるだけ。
              <br />
              AI が材料と手順を自動で整理します。
            </span>
          </p>
        </div>
      </section>

      {/* URL Input Section */}
      <section className="mb-8 sm:mx-auto sm:mb-12 sm:max-w-2xl">
        <label className="mb-3 block text-[13px] font-medium text-app-text-secondary">
          動画URLを入力
        </label>
        <form onSubmit={handleExtract} className="space-y-3">
          {/* URL Field */}
          <div className="flex h-[52px] items-center gap-2.5 rounded-xl border border-app-border bg-white px-4">
            <LinkIcon className="h-[18px] w-[18px] shrink-0 text-app-text-placeholder" />
            <input
              type="text"
              inputMode="url"
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={extractState.isLoading}
              className="h-full flex-1 bg-transparent text-sm text-app-text placeholder:text-app-text-placeholder focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Extract Button */}
          <button
            type="submit"
            disabled={extractState.isLoading || !url.trim()}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-app-primary text-[15px] font-semibold text-white transition-colors hover:bg-app-primary-hover disabled:opacity-50"
          >
            {extractState.isLoading ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin" />
            ) : (
              <>
                <Sparkles className="h-[18px] w-[18px]" />
                レシピを抽出する
              </>
            )}
          </button>
        </form>

        {/* Error */}
        {extractState.status === "error" && (
          <p className="mt-3 text-sm text-app-danger">
            {extractState.error}
          </p>
        )}

        {/* Storage Limit Reached */}
        {storageLimitReached && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            レシピの保存上限（{PLANS.free.recipeStorageLimit}件）に達しました。{" "}
            <Link href="/pricing" className="font-semibold underline">
              Premium にアップグレード
            </Link>
            すると無制限に保存できます。
          </div>
        )}

        {/* Extraction Limit Reached */}
        {extractState.isLimitReached && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            今月の抽出上限に達しました。{" "}
            <Link href="/pricing" className="font-semibold underline">
              Premium にアップグレード
            </Link>
            すると月{PLANS.premium.monthlyExtractionLimit}回まで利用できます。
          </div>
        )}

        {/* Usage Info */}
        {isAuthenticated && usage && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-app-surface px-4 py-1.5 text-sm text-app-text-secondary">
            <span>
              今月の残り回数:{" "}
              <span
                className={
                  usage.remaining <= 2
                    ? "font-bold text-app-danger"
                    : "font-bold text-app-primary"
                }
              >
                {usage.remaining}
              </span>{" "}
              / {usage.limit}
            </span>
          </div>
        )}
      </section>

      {/* Recent Recipes */}
      {recentRecipes.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-app-text sm:text-xl sm:font-bold">
              最近のレシピ
            </h2>
            <button
              onClick={() => router.push("/recipes")}
              className="text-[13px] font-medium text-app-primary"
            >
              すべて見る
            </button>
          </div>

          {/* モバイル: 横スクロール / デスクトップ: グリッド */}
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
            {recentRecipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                index={index}
                onClick={() => router.push(`/recipes/${recipe.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {recentRecipes.length === 0 && (
        <section className="py-16 text-center">
          <ChefHat className="mx-auto mb-4 h-16 w-16 text-app-text-placeholder" />
          <h2 className="mb-2 text-lg font-semibold text-app-text-secondary">
            まだレシピがありません
          </h2>
          <p className="text-sm text-app-text-muted">
            上の入力欄に YouTube URL を貼り付けて、最初のレシピを作りましょう
          </p>
        </section>
      )}
    </div>
  );
}

// --- Recipe Card Component ---

type RecipeCardProps = {
  recipe: Recipe;
  index: number;
  onClick: () => void;
};

function RecipeCard({ recipe, index, onClick }: RecipeCardProps) {
  const bgColor = RECIPE_THUMBNAIL_COLORS[index % RECIPE_THUMBNAIL_COLORS.length];
  const difficulty = recipe.difficulty;

  return (
    <div
      className="w-40 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-app-border bg-white transition-all hover:shadow-md hover:-translate-y-0.5 sm:w-auto sm:shrink"
      onClick={onClick}
    >
      {/* Thumbnail */}
      {recipe.thumbnailUrl ? (
        <img
          src={recipe.thumbnailUrl}
          alt={recipe.title}
          className="h-24 w-full object-cover sm:h-32"
        />
      ) : (
        <div
          className="flex h-24 items-center justify-center sm:h-32"
          style={{ backgroundColor: bgColor }}
        >
          <ChefHat className="h-8 w-8 text-app-text-placeholder sm:h-10 sm:w-10" />
        </div>
      )}

      {/* Info */}
      <div className="p-3 sm:p-4">
        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-app-text">
          {recipe.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-app-text-muted">
          {recipe.totalTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {recipe.totalTime}
            </span>
          )}
          {difficulty && (
            <Badge
              variant="secondary"
              className="text-xs px-1.5 py-0"
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
