"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  Minus,
  Plus,
  Pencil,
  ShoppingCart,
  Trash2,
  Lightbulb,
  Star,
} from "lucide-react";

import type { Recipe } from "@/domain/entities/recipe";
import { useRecipes } from "@/hooks/use-recipes";
import { addRecipeToShoppingList } from "@/lib/use-cases";
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
} from "@/lib/constants";

type PageParams = { id: string };

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getById, update, remove } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState(2);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    void getById(id).then((r) => {
      if (r) {
        setRecipe(r);
        // servings文字列から数値を抽出
        const match = r.servings?.match(/\d+/);
        if (match) setServings(parseInt(match[0], 10));
      }
    });
  }, [id, getById]);

  const handleDelete = useCallback(async () => {
    if (!recipe) return;
    if (!confirm("このレシピを削除しますか？")) return;
    await remove(recipe.id);
    router.push("/recipes");
  }, [recipe, remove, router]);

  const handleToggleFavorite = useCallback(async () => {
    if (!recipe) return;
    const newFavorite = !recipe.isFavorite;
    const updated = { ...recipe, isFavorite: newFavorite };
    setRecipe(updated);
    await update(recipe.id, { isFavorite: newFavorite });
  }, [recipe, update]);

  const handleAddToShoppingList = useCallback(async () => {
    if (!recipe) return;
    await addRecipeToShoppingList(recipe);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [recipe]);

  if (!recipe) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-app-primary border-t-transparent" />
      </div>
    );
  }

  const difficulty = recipe.difficulty;
  const originalServings = parseInt(recipe.servings?.match(/\d+/)?.[0] ?? "2", 10);
  const ratio = servings / originalServings;

  // 量を調整する関数
  const adjustAmount = (amount: string): string => {
    if (ratio === 1) return amount;
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    const adjusted = num * ratio;
    return adjusted % 1 === 0 ? String(adjusted) : adjusted.toFixed(1);
  };

  return (
    <div className="mx-auto max-w-3xl bg-app-bg">
      {/* Nav Bar - モバイル */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[15px] font-medium text-app-primary"
        >
          <ChevronLeft className="h-5 w-5" />
          戻る
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleFavorite}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-app-surface"
            aria-label={recipe?.isFavorite ? "お気に入り解除" : "お気に入りに追加"}
          >
            <Star
              className={`h-5 w-5 ${recipe?.isFavorite ? "fill-app-accent text-app-accent" : "text-app-text-secondary"}`}
            />
          </button>
          <button
            onClick={() => recipe && router.push(`/recipes/${recipe.id}/edit`)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-app-surface"
            aria-label="編集"
          >
            <Pencil className="h-[18px] w-[18px] text-app-text-secondary" />
          </button>
          <button
            onClick={handleDelete}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-red-50"
            aria-label="削除"
          >
            <Trash2 className="h-[18px] w-[18px] text-app-danger" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 px-5 pb-8 sm:px-6">
        {/* Title Section */}
        <div>
          <h1 className="mb-3 text-2xl font-bold text-app-text">
            {recipe.title}
          </h1>
          {/* Meta Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {recipe.totalTime && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-app-primary-light px-2.5 py-1 text-xs font-medium text-app-primary">
                <Clock className="h-3.5 w-3.5" />
                {recipe.totalTime}
              </span>
            )}
            {difficulty && (
              <span
                className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium"
                style={{
                  backgroundColor: DIFFICULTY_COLORS[difficulty].bg,
                  color: DIFFICULTY_COLORS[difficulty].text,
                }}
              >
                {DIFFICULTY_LABELS[difficulty]}
              </span>
            )}
            {recipe.category && (
              <span className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                {recipe.category}
              </span>
            )}
          </div>
        </div>

        {/* Servings Adjuster */}
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-semibold text-app-text">人数</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-app-border bg-white"
            >
              <Minus className="h-4 w-4 text-app-text-secondary" />
            </button>
            <span className="min-w-[3rem] text-center text-base font-semibold text-app-text">
              {servings}人前
            </span>
            <button
              onClick={() => setServings(servings + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-app-primary"
            >
              <Plus className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-app-border" />

        {/* Ingredients */}
        <div>
          <h2 className="mb-4 text-[17px] font-semibold text-app-text">材料</h2>
          <div className="overflow-hidden rounded-xl border border-app-border bg-white">
            {recipe.ingredients.map((ing, i) => (
              <div
                key={`${ing.name}-${i}`}
                className={`flex items-center justify-between px-4 py-3.5 ${
                  i < recipe.ingredients.length - 1
                    ? "border-b border-app-border"
                    : ""
                }`}
              >
                <span className="text-sm text-app-text">{ing.name}</span>
                <span className="text-sm text-app-text-muted">
                  {adjustAmount(ing.amount)}
                  {ing.unit ? ing.unit : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-app-border" />

        {/* Steps */}
        <div>
          <h2 className="mb-4 text-[17px] font-semibold text-app-text">手順</h2>
          <div className="space-y-4">
            {recipe.steps.map((step) => (
              <div key={step.stepNumber} className="flex gap-3.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-app-primary text-xs font-bold text-white">
                  {step.stepNumber}
                </div>
                <p className="flex-1 pt-0.5 text-sm leading-relaxed text-app-text">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-app-border" />

        {/* Tips */}
        {recipe.tips && recipe.tips.length > 0 && (
          <>
            <div className="rounded-xl bg-app-primary-light p-4">
              <div className="mb-2.5 flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-app-primary" />
                <span className="text-sm font-semibold text-app-primary">
                  コツ・ポイント
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-app-text-secondary">
                {recipe.tips.join(" ")}
              </p>
            </div>
            <div className="h-px bg-app-border" />
          </>
        )}

        {/* Action Button */}
        <button
          onClick={handleAddToShoppingList}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-app-primary text-[15px] font-semibold text-white transition-colors hover:bg-app-primary-hover"
        >
          <ShoppingCart className="h-4 w-4" />
          {addedToCart ? "追加しました!" : "買い物リストに追加"}
        </button>
      </div>
    </div>
  );
}
