// ---------- 型定義 ----------

type TranscriptSegment = {
  text: string;
  start: number;
  duration: number;
};

type VideoTranscript = {
  videoId: string;
  title: string;
  description: string;
  language: "ja" | "en";
  segments: TranscriptSegment[];
  fullText: string;
};

type Ingredient = {
  name: string;
  amount: string;
  unit?: string;
  notes?: string;
};

type Step = {
  stepNumber: number;
  text: string;
  duration?: string;
};

type RecipeDto = {
  id: string;
  title: string;
  description?: string;
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  ingredients: Ingredient[];
  steps: Step[];
  tips?: string[];
  tags?: string[];
  difficulty?: "easy" | "medium" | "hard";
  sourceUrl: string;
  thumbnailUrl?: string;
  channelName?: string;
  language: "ja" | "en";
  createdAt: string;
};

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ---------- YouTube URL パース ----------

const YOUTUBE_PATTERNS = [
  /^https?:\/\/(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
] as const;

function extractVideoId(url: string): string | null {
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

async function fetchFromInvidious(path: string): Promise<Response | null> {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const res = await fetch(`${instance}${path}`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) return res;
    } catch {
      continue;
    }
  }
  return null;
}

async function fetchTranscript(
  videoId: string,
  lang: "ja" | "en"
): Promise<VideoTranscript> {
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

  if (title === "Unknown Title") {
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        title = oembed.title || title;
      }
    } catch {
      // ignore
    }
  }

  let segments: TranscriptSegment[] = [];
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

// ---------- AWS SigV4 署名 (fetch で Bedrock を直接呼ぶ) ----------

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const hash = await crypto.subtle.digest("SHA-256", encoded);
  return toHex(hash);
}

async function hmacSha256(
  key: ArrayBuffer,
  data: string
): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}

async function getSignatureKey(
  secretKey: string,
  dateStamp: string,
  region: string,
  service: string
): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(
    new TextEncoder().encode(`AWS4${secretKey}`),
    dateStamp
  );
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  return hmacSha256(kService, "aws4_request");
}

async function invokeBedrock(
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
  modelId: string,
  body: string
): Promise<string> {
  const service = "bedrock";
  const host = `bedrock-runtime.${region}.amazonaws.com`;
  // AWS SigV4: canonical URI はコロンを %3A にエンコードした形式を要求する。
  // ただし Deno fetch はリクエスト URL 中の %3A を : にデコードして送信するため、
  // fetch URL にはエンコードなしの : を使い、署名用 canonical URI には %3A を使う。
  const fetchPath = `/model/${modelId}/invoke`;
  const canonicalUri = `/model/${encodeURIComponent(modelId)}/invoke`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const dateStamp = amzDate.substring(0, 8);

  const payloadHash = await sha256(body);

  const canonicalHeaders =
    `content-type:application/json\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;

  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = [
    "POST",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256(canonicalRequest),
  ].join("\n");

  const signingKey = await getSignatureKey(
    secretAccessKey,
    dateStamp,
    region,
    service
  );
  const signatureBuffer = await hmacSha256(signingKey, stringToSign);
  const signature = toHex(signatureBuffer);

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const endpoint = `https://${host}${fetchPath}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Amz-Date": amzDate,
      "X-Amz-Content-Sha256": payloadHash,
      Authorization: authorization,
    },
    body,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[invokeBedrock] Request failed:", {
      status: res.status,
      endpoint,
      canonicalUri,
      errorResponse: errText.substring(0, 1000),
    });
    throw new Error(`Bedrock API error (${res.status}): ${errText.substring(0, 500)}`);
  }

  return res.text();
}

// ---------- Bedrock でレシピ抽出 ----------

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
  "servings": "分量（例: 2人前）（省略可）",
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

async function extractRecipeWithBedrock(
  transcript: VideoTranscript
): Promise<RecipeDto> {
  const region = Deno.env.get("AWS_REGION") || "ap-northeast-1";
  const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID") || "";
  const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY") || "";

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

  const requestBody = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const responseText = await invokeBedrock(
    region,
    accessKeyId,
    secretAccessKey,
    "jp.anthropic.claude-haiku-4-5-20251001-v1:0",
    requestBody
  );

  const responseBody = JSON.parse(responseText);
  const content = responseBody.content?.[0]?.text || "";

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(
      `AIからのレスポンスにJSONが含まれていません: ${content.substring(0, 200)}`
    );
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
    thumbnailUrl: `https://i.ytimg.com/vi/${transcript.videoId}/hqdefault.jpg`,
    channelName: undefined,
    language: transcript.language,
    createdAt: new Date().toISOString(),
  };
}

// ---------- メインハンドラ ----------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, apikey, x-client-info",
      },
    });
  }

  if (req.method !== "POST") {
    return Response.json(
      { success: false, error: "Method not allowed" } satisfies ActionResult<RecipeDto>,
      { status: 405 }
    );
  }

  try {
    const body = (await req.json()) as { url?: string };

    if (!body.url || typeof body.url !== "string") {
      return Response.json(
        { success: false, error: "URLが指定されていません。" } satisfies ActionResult<RecipeDto>,
        { status: 400 }
      );
    }

    const videoId = extractVideoId(body.url);
    if (!videoId) {
      return Response.json(
        {
          success: false,
          error: "有効なYouTube URLを入力してください。",
        } satisfies ActionResult<RecipeDto>,
        { status: 400 }
      );
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

    return Response.json(
      { success: true, data: recipe } satisfies ActionResult<RecipeDto>,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[extract-recipe] Error:", error);

    const message =
      error instanceof Error ? error.message : "予期しないエラーが発生しました";

    return Response.json(
      {
        success: false,
        error: `レシピの抽出に失敗しました。もう一度お試しください。(${message})`,
      } satisfies ActionResult<RecipeDto>,
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
});
