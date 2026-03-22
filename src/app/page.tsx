"use client";

import { useState } from "react";

import type { RecipeDto } from "@/application/dto/extract-recipe-dto";

import { FeedbackMenu } from "@/components/features/feedback/feedback-menu";
import { RecipeDetail } from "@/components/features/recipe/recipe-detail";
import { UrlInputForm } from "@/components/features/video/url-input-form";

import { extractRecipeAction } from "./actions/extract-recipe-action";

export default function Home() {
  const [recipe, setRecipe] = useState<RecipeDto | null>(null);

  return (
    <main className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center px-4 py-12 sm:px-6">
      <div className="absolute top-3 right-2">
        <FeedbackMenu />
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold leading-tight">Recipi Book</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          YouTube の料理動画からレシピを自動抽出
        </p>
      </div>

      <UrlInputForm
        onSuccess={setRecipe}
        extractAction={extractRecipeAction}
      />

      {recipe && (
        <div className="mt-12 w-full">
          <RecipeDetail recipe={recipe} />
        </div>
      )}
    </main>
  );
}
