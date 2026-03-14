export class InvalidYouTubeUrlError extends Error {
  constructor(url: string) {
    super(`不正なYouTube URLです: ${url}`);
    this.name = "InvalidYouTubeUrlError";
  }
}

export class VideoNotFoundError extends Error {
  constructor(videoId: string) {
    super(`動画が見つかりません: ${videoId}`);
    this.name = "VideoNotFoundError";
  }
}

export class TranscriptNotAvailableError extends Error {
  constructor(videoId: string) {
    super(`字幕が取得できません: ${videoId}`);
    this.name = "TranscriptNotAvailableError";
  }
}

export class ExtractionFailedError extends Error {
  constructor(message: string) {
    super(`レシピ抽出に失敗しました: ${message}`);
    this.name = "ExtractionFailedError";
  }
}
