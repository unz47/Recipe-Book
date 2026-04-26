"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  extractRecipeFromApi,
  checkUsageLimit,
  incrementUsageCount,
} from "@/lib/use-cases";

type RecipeDto = {
  id: string;
  title: string;
  description?: string;
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  ingredients: { name: string; amount: string; unit?: string; notes?: string }[];
  steps: { stepNumber: number; text: string; duration?: string }[];
  tips?: string[];
  difficulty?: "easy" | "medium" | "hard";
  sourceUrl: string;
  thumbnailUrl?: string;
  channelName?: string;
  language: "ja" | "en";
  createdAt: string;
};

type ExtractState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: RecipeDto }
  | { status: "error"; error: string }
  | { status: "limit_reached" };

export function useExtractRecipe() {
  const [state, setState] = useState<ExtractState>({ status: "idle" });

  const extract = useCallback(async (url: string) => {
    try {
      setState({ status: "loading" });

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const canExtract = await checkUsageLimit();
        if (!canExtract) {
          setState({ status: "limit_reached" });
          return "limit_reached" as const;
        }
      }

      const result = await extractRecipeFromApi(url);

      if (result.success) {
        if (user) {
          await incrementUsageCount();
        }
        setState({ status: "success", data: result.data });
        return result.data;
      } else {
        setState({ status: "error", error: result.error });
        return null;
      }
    } catch {
      setState({
        status: "error",
        error: "予期しないエラーが発生しました。",
      });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return {
    ...state,
    isLoading: state.status === "loading",
    isLimitReached: state.status === "limit_reached",
    extract,
    reset,
  };
}
