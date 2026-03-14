export type TranscriptSegment = {
  text: string;
  start: number;
  duration: number;
};

export type VideoTranscript = {
  videoId: string;
  title: string;
  description: string;
  language: "ja" | "en";
  segments: TranscriptSegment[];
  fullText: string;
};
