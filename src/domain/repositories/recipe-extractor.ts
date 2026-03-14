import type { Recipe } from "@/domain/entities/recipe";
import type { VideoTranscript } from "@/domain/entities/video-transcript";

export interface RecipeExtractor {
  extract(transcript: VideoTranscript): Promise<Recipe>;
}
