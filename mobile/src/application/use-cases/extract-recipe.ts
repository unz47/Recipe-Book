import type { ActionResult, RecipeDto } from "../dto/extract-recipe-dto";
import { API_BASE_URL } from "@/lib/constants";

export async function extractRecipeFromApi(
  url: string
): Promise<ActionResult<RecipeDto>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/extract-recipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: "サーバーとの通信に失敗しました。もう一度お試しください。",
      };
    }

    return (await response.json()) as ActionResult<RecipeDto>;
  } catch {
    return {
      success: false,
      error: `サーバーに接続できません。Next.js が ${API_BASE_URL} で起動しているか確認してください。`,
    };
  }
}
