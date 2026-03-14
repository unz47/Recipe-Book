"use server";

import type {
  ActionResult,
  RecipeDto,
} from "@/application/dto/extract-recipe-dto";
import { extractRecipe } from "@/application/use-cases/extract-recipe";
import {
  ExtractionFailedError,
  InvalidYouTubeUrlError,
  TranscriptNotAvailableError,
  VideoNotFoundError,
} from "@/domain/errors";
import { AiRecipeExtractor } from "@/infrastructure/services/ai-recipe-extractor";
import { YouTubeTranscriptService } from "@/infrastructure/services/youtube-transcript-service";

function toErrorMessage(error: unknown): string {
  if (error instanceof InvalidYouTubeUrlError) {
    return "有効なYouTube URLを入力してください。";
  }
  if (error instanceof VideoNotFoundError) {
    return "動画が見つかりませんでした。URLを確認してください。";
  }
  if (error instanceof TranscriptNotAvailableError) {
    return "この動画には字幕がありません。字幕付きの動画をお試しください。";
  }
  if (error instanceof ExtractionFailedError) {
    return "レシピの抽出に失敗しました。もう一度お試しください。";
  }
  return "予期しないエラーが発生しました。もう一度お試しください。";
}

export async function extractRecipeAction(
  url: string
): Promise<ActionResult<RecipeDto>> {
  try {
    const transcriptRepository = new YouTubeTranscriptService();
    const recipeExtractor = new AiRecipeExtractor();

    const recipe = await extractRecipe(url, {
      transcriptRepository,
      recipeExtractor,
    });

    const dto: RecipeDto = {
      ...recipe,
      createdAt: recipe.createdAt.toISOString(),
    };

    return { success: true, data: dto };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}
