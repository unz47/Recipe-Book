import type { VideoTranscript } from "@/domain/entities/video-transcript";

export interface TranscriptRepository {
  fetchTranscript(
    videoId: string,
    language: "ja" | "en"
  ): Promise<VideoTranscript>;
}
