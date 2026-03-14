import { InvalidYouTubeUrlError } from "../errors";

const YOUTUBE_PATTERNS = [
  /^https?:\/\/(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
] as const;

export type YouTubeUrl = {
  readonly url: string;
  readonly videoId: string;
};

export function createYouTubeUrl(url: string): YouTubeUrl {
  const trimmedUrl = url.trim();

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = trimmedUrl.match(pattern);
    if (match?.[1]) {
      return {
        url: trimmedUrl,
        videoId: match[1],
      };
    }
  }

  throw new InvalidYouTubeUrlError(trimmedUrl);
}
