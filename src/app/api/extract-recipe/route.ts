import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };

    if (!body.url || typeof body.url !== "string") {
      const result: ActionResult<RecipeDto> = {
        success: false,
        error: "URLが指定されていません。",
      };
      return NextResponse.json(result, { status: 400 });
    }

    const transcriptRepository = new YouTubeTranscriptService();
    const recipeExtractor = new AiRecipeExtractor();

    const recipe = await extractRecipe(body.url, {
      transcriptRepository,
      recipeExtractor,
    });

    const dto: RecipeDto = {
      ...recipe,
      createdAt: recipe.createdAt.toISOString(),
    };

    const result: ActionResult<RecipeDto> = { success: true, data: dto };
    return NextResponse.json(result);
  } catch (error) {
    const result: ActionResult<RecipeDto> = {
      success: false,
      error: toErrorMessage(error),
    };
    return NextResponse.json(result, { status: 500 });
  }
}
