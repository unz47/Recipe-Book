import { useState, useCallback } from "react";

import type { RecipeDto } from "@/application/dto/extract-recipe-dto";
import { extractRecipeFromApi } from "@/application/use-cases/extract-recipe";

type ExtractState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: RecipeDto }
  | { status: "error"; error: string };

export function useExtractRecipe() {
  const [state, setState] = useState<ExtractState>({ status: "idle" });

  const extract = useCallback(async (url: string) => {
    try {
      setState({ status: "loading" });

      const result = await extractRecipeFromApi(url);

      if (result.success) {
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
    extract,
    reset,
  };
}
