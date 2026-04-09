import { useState, useCallback } from "react";

import type { RecipeDto } from "@/application/dto/extract-recipe-dto";
import { extractRecipeFromApi } from "@/application/use-cases/extract-recipe";
import { checkUsageLimitClient } from "@/lib/usage-client";
import { supabase } from "@/lib/supabase";

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

      // 使用制限チェック（ログイン済みの場合のみ）
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const canExtract = await checkUsageLimitClient();
        if (!canExtract) {
          setState({
            status: "error",
            error: "今月の抽出回数の上限に達しました。来月また利用できます。",
          });
          return null;
        }
      }

      const result = await extractRecipeFromApi(url);

      if (result.success) {
        // 抽出成功後にカウントを増やす（ログイン済みの場合のみ）
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
    extract,
    reset,
  };
}

/**
 * 抽出回数を増加（クライアント側）
 */
async function incrementUsageCount() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const currentMonth = getCurrentMonth();

  // increment_extraction_count関数を呼び出す
  const { error } = await supabase.rpc("increment_extraction_count", {
    p_user_id: user.id,
    p_month: currentMonth,
  });

  if (error) {
    console.error("Failed to increment usage count:", error);
  }
}

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
