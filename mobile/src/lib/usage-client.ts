import { supabase } from "./supabase";

const PLAN_LIMITS = {
  free: 10,
  premium: 120,
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
 * ユーザーの使用状況を取得（クライアント側）
 */
export async function getUserUsageClient() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("ログインが必要です");
  }

  const currentMonth = getCurrentMonth();

  const { data, error } = await supabase
    .from("user_usage")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", currentMonth)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  // レコードが存在しない場合は初期値
  if (!data) {
    return {
      remaining: PLAN_LIMITS.free,
      limit: PLAN_LIMITS.free,
      used: 0,
      plan: "free" as PlanType,
    };
  }

  const limit = PLAN_LIMITS[data.plan as PlanType];
  const remaining = Math.max(0, limit - data.extraction_count);

  return {
    remaining,
    limit,
    used: data.extraction_count,
    plan: data.plan as PlanType,
  };
}

/**
 * 使用制限をチェック（クライアント側）
 */
export async function checkUsageLimitClient(): Promise<boolean> {
  const usage = await getUserUsageClient();
  return usage.used < usage.limit;
}
