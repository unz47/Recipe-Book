import type { ActionResult, RecipeDto } from "../dto/extract-recipe-dto";
import { API_BASE_URL } from "@/lib/constants";
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

    const response = await fetch(`${API_BASE_URL}/api/extract-recipe`, {
      method: "POST",
      headers,
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      // サーバーからのエラーメッセージを取得
      try {
        const errorData = (await response.json()) as ActionResult<RecipeDto>;
        return {
          success: false,
          error:
            errorData.error ||
            "サーバーとの通信に失敗しました。もう一度お試しください。",
        };
      } catch {
        return {
          success: false,
          error: "サーバーとの通信に失敗しました。もう一度お試しください。",
        };
      }
    }

    return (await response.json()) as ActionResult<RecipeDto>;
  } catch {
    return {
      success: false,
      error: `サーバーに接続できません。Next.js が ${API_BASE_URL} で起動しているか確認してください。`,
    };
  }
}
