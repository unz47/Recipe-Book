import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side only: Service Role Key を使用
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const PLAN_LIMITS = {
  free: 10, // 無料プラン: 月10回
  premium: 120, // 有料プラン（月額500円）: 月120回
} as const;

type PlanType = keyof typeof PLAN_LIMITS;

/**
 * 現在の月を YYYY-MM 形式で取得
 */
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * ユーザーの使用状況を取得
 */
export async function getUserUsage(userId: string) {
  const currentMonth = getCurrentMonth();

  const { data, error } = await supabaseAdmin
    .from("user_usage")
    .select("*")
    .eq("user_id", userId)
    .eq("month", currentMonth)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = レコードが存在しない
    throw new Error(`Failed to get user usage: ${error.message}`);
  }

  // レコードが存在しない場合は初期値を返す
  if (!data) {
    return {
      user_id: userId,
      month: currentMonth,
      extraction_count: 0,
      plan: "free" as PlanType,
    };
  }

  return {
    user_id: data.user_id,
    month: data.month,
    extraction_count: data.extraction_count,
    plan: data.plan as PlanType,
  };
}

/**
 * 使用制限をチェック
 */
export async function checkUsageLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
  plan: PlanType;
}> {
  const usage = await getUserUsage(userId);
  const limit = PLAN_LIMITS[usage.plan];
  const remaining = Math.max(0, limit - usage.extraction_count);

  return {
    allowed: usage.extraction_count < limit,
    remaining,
    limit,
    plan: usage.plan,
  };
}

/**
 * 抽出回数を増加
 */
export async function incrementUsageCount(userId: string): Promise<void> {
  const currentMonth = getCurrentMonth();

  const { error } = await supabaseAdmin.rpc("increment_extraction_count", {
    p_user_id: userId,
    p_month: currentMonth,
  });

  if (error) {
    throw new Error(`Failed to increment usage count: ${error.message}`);
  }
}
