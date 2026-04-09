import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

// ---------- YouTube URL パース ----------

const YOUTUBE_PATTERNS = [
  /^https?:\/\/(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
];

function extractVideoId(url) {
  const trimmed = url.trim();
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

// ---------- YouTube データ取得 ----------

const INVIDIOUS_INSTANCES = [
  "https://inv.tux.pizza",
  "https://invidious.nerdvpn.de",
  "https://invidious.jing.rocks",
];

async function fetchFromInvidious(path) {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const res = await fetch(`${instance}${path}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) return res;
    } catch {
      continue;
    }
  }
  return null;
}

async function fetchTranscript(videoId, lang) {
  const videoRes = await fetchFromInvidious(
    `/api/v1/videos/${videoId}?fields=title,description`
  );

  let title = "Unknown Title";
  let description = "";

  if (videoRes) {
    try {
      const videoData = await videoRes.json();
      title = videoData.title || title;
      description = videoData.description || "";
    } catch {
      console.error("[Invidious] Failed to parse video data");
    }
  }

  // フォールバック: YouTube oEmbed API
  if (title === "Unknown Title") {
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        title = oembed.title || title;
      }
    } catch {
      // ignore
    }
  }

  // 字幕取得
  let segments = [];
  let fullText = "";

  const captionRes = await fetchFromInvidious(
    `/api/v1/captions/${videoId}?label=&lang=${lang}`
  );

  if (captionRes) {
    try {
      const captionXml = await captionRes.text();
      const textRegex =
        /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>(.*?)<\/text>/g;
      let match;
      while ((match = textRegex.exec(captionXml)) !== null) {
        const text = match[3]
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/<[^>]*>/g, "");
        segments.push({
          text,
          start: parseFloat(match[1]),
          duration: parseFloat(match[2]),
        });
      }
      fullText = segments.map((s) => s.text).join(" ");
    } catch {
      console.error("[Invidious] Failed to parse captions");
    }
  }

  console.log(
    `[YouTube] title="${title}", desc=${description.length}chars, segments=${segments.length}`
  );

  return { videoId, title, description, language: lang, segments, fullText };
}

// ---------- Bedrock でレシピ抽出 ----------

const bedrockClient = new BedrockRuntimeClient({ region: "ap-northeast-1" });

const SYSTEM_PROMPT_JA = `あなたは料理動画からレシピを抽出する専門家です。
動画のタイトル、説明文、字幕テキスト（ある場合）からレシピ情報を正確に構造化してください。
字幕テキストがない場合は、説明文からできる限りレシピを抽出してください。

ルール:
- 材料の分量は提供された情報の表現をできるだけ忠実に抽出する
- "適量"、"少々"、"お好みで" などの表現はそのまま残す
- "大さじ1くらい" → "大さじ1" のように明らかな口語表現は簡潔にする
- 手順は時系列順に整理し、各ステップを簡潔にまとめる
- コツやポイントがあれば tips として抽出する
- 情報が不明な項目は省略する（推測で埋めない）

必ず以下のJSON形式で応答してください:
{
  "title": "レシピ名",
  "description": "簡単な説明（省略可）",
  "servings": "分量（省略可）",
  "prepTime": "下準備時間（省略可）",
  "cookTime": "調理時間（省略可）",
  "totalTime": "合計時間（省略可）",
  "ingredients": [{ "name": "材料名", "amount": "分量", "unit": "単位（省略可）", "notes": "備考（省略可）" }],
  "steps": [{ "stepNumber": 1, "text": "手順の説明", "duration": "所要時間（省略可）" }],
  "tips": ["コツ1", "コツ2"],
  "tags": ["和食", "煮物"],
  "difficulty": "easy | medium | hard"
}`;

const SYSTEM_PROMPT_EN = `You are an expert at extracting recipes from cooking videos.
Accurately structure recipe information from the video title, description, and subtitle text (if available).
If no subtitle text is provided, extract the recipe from the description as best as you can.

Rules:
- Extract ingredient quantities as faithfully as possible
- Keep expressions like "to taste", "a pinch", "as needed" as-is
- Simplify obvious colloquial expressions
- Organize steps in chronological order
- Extract any tips or key points as tips
- Omit unknown fields (do not guess)

Always respond in the following JSON format:
{
  "title": "Recipe name",
  "description": "Brief description (optional)",
  "servings": "Servings (optional)",
  "prepTime": "Prep time (optional)",
  "cookTime": "Cook time (optional)",
  "totalTime": "Total time (optional)",
  "ingredients": [{ "name": "Ingredient", "amount": "Amount", "unit": "Unit (optional)", "notes": "Notes (optional)" }],
  "steps": [{ "stepNumber": 1, "text": "Step description", "duration": "Duration (optional)" }],
  "tips": ["Tip 1", "Tip 2"],
  "tags": ["Japanese", "Stew"],
  "difficulty": "easy | medium | hard"
}`;

async function extractRecipeWithBedrock(transcript) {
  const systemPrompt =
    transcript.language === "ja" ? SYSTEM_PROMPT_JA : SYSTEM_PROMPT_EN;

  const parts = [`動画タイトル: ${transcript.title}`];
  if (transcript.description) {
    parts.push(`動画説明文: ${transcript.description}`);
  }
  if (transcript.fullText) {
    parts.push(`字幕テキスト:\n${transcript.fullText}`);
  }
  const userPrompt = parts.join("\n\n");

  const command = new InvokeModelCommand({
    modelId: "jp.anthropic.claude-haiku-4-5-20251001-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const content = responseBody.content?.[0]?.text || "";

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`AIからのレスポンスにJSONが含まれていません`);
  }

  const recipe = JSON.parse(jsonMatch[0]);

  return {
    id: crypto.randomUUID(),
    title: recipe.title || transcript.title,
    description: recipe.description,
    servings: recipe.servings,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.totalTime,
    ingredients: recipe.ingredients || [],
    steps: recipe.steps || [],
    tips: recipe.tips,
    tags: recipe.tags,
    difficulty: recipe.difficulty,
    sourceUrl: `https://www.youtube.com/watch?v=${transcript.videoId}`,
    channelName: undefined,
    language: transcript.language,
    createdAt: new Date().toISOString(),
  };
}

// ---------- Lambda ハンドラ ----------

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // CORS preflight
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    if (!body.url || typeof body.url !== "string") {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "URLが指定されていません。",
        }),
      };
    }

    const videoId = extractVideoId(body.url);
    if (!videoId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "有効なYouTube URLを入力してください。",
        }),
      };
    }

    // 字幕取得（ja → en フォールバック）
    let transcript = await fetchTranscript(videoId, "ja");

    if (!transcript.fullText) {
      try {
        const enTranscript = await fetchTranscript(videoId, "en");
        if (enTranscript.fullText) {
          transcript = enTranscript;
        }
      } catch {
        // en 取得失敗は無視
      }
    }

    const recipe = await extractRecipeWithBedrock(transcript);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: recipe }),
    };
  } catch (error) {
    console.error("[extract-recipe] Error:", error);
    const message = error instanceof Error ? error.message : "予期しないエラー";

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: `レシピの抽出に失敗しました。(${message})`,
      }),
    };
  }
};
