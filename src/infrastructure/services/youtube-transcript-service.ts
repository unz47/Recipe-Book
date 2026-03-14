import type { VideoTranscript } from "@/domain/entities/video-transcript";
import { VideoNotFoundError } from "@/domain/errors";
import type { TranscriptRepository } from "@/domain/repositories/transcript-repository";
import { getVideoDetails } from "youtube-caption-extractor";

export class YouTubeTranscriptService implements TranscriptRepository {
  async fetchTranscript(
    videoId: string,
    language: "ja" | "en"
  ): Promise<VideoTranscript> {
    let details;
    try {
      details = await getVideoDetails({ videoID: videoId, lang: language });
    } catch {
      throw new VideoNotFoundError(videoId);
    }

    if (!details.title) {
      throw new VideoNotFoundError(videoId);
    }

    const subtitles = details.subtitles ?? [];

    const segments = subtitles.map((subtitle) => ({
      text: subtitle.text,
      start: parseFloat(subtitle.start),
      duration: parseFloat(subtitle.dur),
    }));

    const fullText = segments.map((s) => s.text).join(" ");

    return {
      videoId,
      title: details.title,
      description: details.description ?? "",
      language,
      segments,
      fullText,
    };
  }
}
