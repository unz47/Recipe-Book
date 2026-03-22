import { generateObject } from "ai";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { z } from "zod";

import type { Recipe } from "@/domain/entities/recipe";
import type { VideoTranscript } from "@/domain/entities/video-transcript";
import { ExtractionFailedError } from "@/domain/errors";
import type { RecipeExtractor } from "@/domain/repositories/recipe-extractor";

const RecipeSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  servings: z.string().optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  totalTime: z.string().optional(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      amount: z.string(),
      unit: z.string().optional(),
      notes: z.string().optional(),
    })
  ),
  steps: z.array(
    z.object({
      stepNumber: z.number(),
      text: z.string(),
      duration: z.string().optional(),
    })
  ),
  tips: z.array(z.string()).optional(),
  tags: z
    .array(z.string())
    .describe("料理のカテゴリやタグ（例: 和食, 煮物, 時短）")
    .optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

const SYSTEM_PROMPT_JA = `あなたは料理動画からレシピを抽出する専門家です。
動画のタイトル、説明文、字幕テキスト（ある場合）からレシピ情報を正確に構造化してください。
字幕テキストがない場合は、説明文からできる限りレシピを抽出してください。

ルール:
- 材料の分量は提供された情報の表現をできるだけ忠実に抽出する
- "適量"、"少々"、"お好みで" などの表現はそのまま残す
- "大さじ1くらい" → "大さじ1" のように明らかな口語表現は簡潔にする
- 手順は時系列順に整理し、各ステップを簡潔にまとめる
- コツやポイントがあれば tips として抽出する
- 情報が不明な項目は省略する（推測で埋めない）`;

const SYSTEM_PROMPT_EN = `You are an expert at extracting recipes from cooking videos.
Accurately structure recipe information from the video title, description, and subtitle text (if available).
If no subtitle text is provided, extract the recipe from the description as best as you can.

Rules:
- Extract ingredient quantities as faithfully as possible from the provided information
- Keep expressions like "to taste", "a pinch", "as needed" as-is
- Simplify obvious colloquial expressions (e.g., "about 1 tablespoon" → "1 tablespoon")
- Organize steps in chronological order, summarizing each step concisely
- Extract any tips or key points as tips
- Omit unknown fields (do not guess)`;

export class AiRecipeExtractor implements RecipeExtractor {
  async extract(transcript: VideoTranscript): Promise<Recipe> {
    const systemPrompt =
      transcript.language === "ja" ? SYSTEM_PROMPT_JA : SYSTEM_PROMPT_EN;

    const parts = [
      `動画タイトル: ${transcript.title}`,
      `動画説明文: ${transcript.description}`,
    ];
    if (transcript.fullText) {
      parts.push(`字幕テキスト:\n${transcript.fullText}`);
    }
    const userPrompt = parts.join("\n\n");

    try {
      const { object } = await generateObject({
        model: bedrock("jp.anthropic.claude-haiku-4-5-20251001-v1:0"),
        schema: RecipeSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });

      return {
        id: crypto.randomUUID(),
        title: object.title,
        description: object.description,
        servings: object.servings,
        prepTime: object.prepTime,
        cookTime: object.cookTime,
        totalTime: object.totalTime,
        ingredients: object.ingredients,
        steps: object.steps,
        tips: object.tips,
        tags: object.tags,
        difficulty: object.difficulty,
        sourceUrl: "",
        thumbnailUrl: undefined,
        channelName: undefined,
        language: transcript.language,
        createdAt: new Date(),
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "不明なエラー";
      throw new ExtractionFailedError(message);
    }
  }
}
