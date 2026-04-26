"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

import type { Recipe, Ingredient, Step } from "@/domain/entities/recipe";
import { useRecipes } from "@/hooks/use-recipes";

type PageParams = { id: string };

export default function RecipeEditPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getById, update } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  // フォーム状態
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void getById(id).then((r) => {
      if (r) {
        setRecipe(r);
        setTitle(r.title);
        setDescription(r.description ?? "");
        setIngredients([...r.ingredients]);
        setSteps([...r.steps]);
      }
    });
  }, [id, getById]);

  const handleSave = useCallback(async () => {
    if (!recipe || isSaving) return;
    setIsSaving(true);
    try {
      await update(recipe.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        ingredients,
        steps: steps.map((s, i) => ({ ...s, stepNumber: i + 1 })),
      });
      router.back();
    } finally {
      setIsSaving(false);
    }
  }, [recipe, isSaving, title, description, ingredients, steps, update, router]);

  // 材料の操作
  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { name: "", amount: "" }]);
  };

  // 手順の操作
  const updateStep = (index: number, text: string) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, text } : s))
    );
  };

  const removeStep = (index: number) => {
    setSteps((prev) =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 }))
    );
  };

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { stepNumber: prev.length + 1, text: "" },
    ]);
  };

  if (!recipe) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-app-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl bg-app-bg">
      {/* Nav Bar */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <button
          onClick={() => router.back()}
          className="text-[15px] font-medium text-app-text-muted"
        >
          キャンセル
        </button>
        <h1 className="text-[17px] font-semibold text-app-text">レシピ編集</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="text-[15px] font-semibold text-app-primary disabled:opacity-50"
        >
          保存
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6 px-5 pb-8 sm:px-6">
        {/* Title Field */}
        <div>
          <label className="mb-2 block text-[13px] font-medium text-app-text-secondary">
            タイトル
          </label>
          <div className="flex h-12 items-center rounded-[10px] border border-app-border bg-white px-3.5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-full w-full bg-transparent text-[15px] text-app-text focus:outline-none"
            />
          </div>
        </div>

        {/* Description Field */}
        <div>
          <label className="mb-2 block text-[13px] font-medium text-app-text-secondary">
            説明
          </label>
          <div className="rounded-[10px] border border-app-border bg-white px-3.5 py-3">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-app-text placeholder:text-app-text-placeholder focus:outline-none"
              placeholder="レシピの説明を入力..."
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-app-border" />

        {/* Ingredients */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-app-text">材料</h2>
            <button
              onClick={addIngredient}
              className="flex items-center gap-1 text-[13px] font-medium text-app-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              追加
            </button>
          </div>
          <div className="space-y-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex h-11 flex-1 items-center rounded-lg border border-app-border bg-white px-3">
                  <input
                    value={ing.name}
                    onChange={(e) => updateIngredient(i, "name", e.target.value)}
                    placeholder="材料名"
                    className="h-full w-full bg-transparent text-sm text-app-text placeholder:text-app-text-placeholder focus:outline-none"
                  />
                </div>
                <div className="flex h-11 w-[90px] items-center rounded-lg border border-app-border bg-white px-3">
                  <input
                    value={`${ing.amount}${ing.unit ?? ""}`}
                    onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                    placeholder="量"
                    className="h-full w-full bg-transparent text-sm text-app-text placeholder:text-app-text-placeholder focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => removeIngredient(i)}
                  className="shrink-0 p-1 text-app-text-placeholder hover:text-app-danger"
                >
                  <X className="h-[18px] w-[18px]" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-app-border" />

        {/* Steps */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-app-text">手順</h2>
            <button
              onClick={addStep}
              className="flex items-center gap-1 text-[13px] font-medium text-app-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              追加
            </button>
          </div>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-app-primary text-[11px] font-bold text-white">
                  {i + 1}
                </div>
                <div className="flex-1 rounded-lg border border-app-border bg-white px-3 py-2.5">
                  <textarea
                    value={step.text}
                    onChange={(e) => updateStep(i, e.target.value)}
                    rows={3}
                    className="w-full resize-none bg-transparent text-sm leading-relaxed text-app-text placeholder:text-app-text-placeholder focus:outline-none"
                    placeholder="手順を入力..."
                  />
                </div>
                <button
                  onClick={() => removeStep(i)}
                  className="shrink-0 self-start p-1 text-app-text-placeholder hover:text-app-danger"
                >
                  <X className="h-[18px] w-[18px]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
