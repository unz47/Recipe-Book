import type { Recipe } from "@/domain/entities/recipe";
import type { RecipeExtractor } from "@/domain/repositories/recipe-extractor";
import type { TranscriptRepository } from "@/domain/repositories/transcript-repository";
import { createYouTubeUrl } from "@/domain/value-objects/youtube-url";

export type ExtractRecipeDeps = {
  transcriptRepository: TranscriptRepository;
  recipeExtractor: RecipeExtractor;
};

export async function extractRecipe(
  url: string,
  deps: ExtractRecipeDeps
): Promise<Recipe> {
  const youtubeUrl = createYouTubeUrl(url);

  let transcript = await deps.transcriptRepository.fetchTranscript(
    youtubeUrl.videoId,
    "ja"
  );

  if (!transcript.fullText) {
    try {
      const enTranscript = await deps.transcriptRepository.fetchTranscript(
        youtubeUrl.videoId,
        "en"
      );
      if (enTranscript.fullText) {
        transcript = enTranscript;
      }
    } catch {
      // en 取得失敗は無視、ja の結果（description のみ）で進む
    }
  }

  const recipe = await deps.recipeExtractor.extract(transcript);

  return {
    ...recipe,
    sourceUrl: youtubeUrl.url,
  };
}
