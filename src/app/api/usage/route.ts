import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkUsageLimit } from "@/lib/usage-limit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

type UsageResponse = {
  success: boolean;
  data?: {
    remaining: number;
    limit: number;
    used: number;
    plan: string;
  };
  error?: string;
};

export async function GET(request: Request) {
  try {
    // 認証チェック
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      const result: UsageResponse = {
        success: false,
        error: "認証が必要です。",
      };
      return NextResponse.json(result, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      const result: UsageResponse = {
        success: false,
        error: "認証が無効です。",
      };
      return NextResponse.json(result, { status: 401 });
    }

    // 使用状況を取得
    const usageCheck = await checkUsageLimit(user.id);

    const result: UsageResponse = {
      success: true,
      data: {
        remaining: usageCheck.remaining,
        limit: usageCheck.limit,
        used: usageCheck.limit - usageCheck.remaining,
        plan: usageCheck.plan,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    const result: UsageResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "使用状況の取得に失敗しました。",
    };
    return NextResponse.json(result, { status: 500 });
  }
}
