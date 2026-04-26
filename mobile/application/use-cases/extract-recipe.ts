import type { ActionResult, RecipeDto } from "../dto/extract-recipe-dto";
import { supabase } from "@/lib/supabase";

export async function extractRecipeFromApi(
  url: string
): Promise<ActionResult<RecipeDto>> {
  try {
    // 認証トークンを取得
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await supabase.functions.invoke("extract-recipe", {
      body: { url },
      headers,
    });

    if (response.error) {
      return {
        success: false,
        error:
          response.error.message ||
          "サーバーとの通信に失敗しました。もう一度お試しください。",
      };
    }

    return response.data as ActionResult<RecipeDto>;
  } catch {
    return {
      success: false,
      error: "サーバーに接続できません。もう一度お試しください。",
    };
  }
}
