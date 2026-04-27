import { supabase } from "./supabase";
import { PLANS } from "./constants";
import type { PlanType } from "./constants";

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
    const freeLimit = PLANS.free.monthlyExtractionLimit;
    return {
      remaining: freeLimit,
      limit: freeLimit,
      used: 0,
      plan: "free" as PlanType,
    };
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
    const freeLimit = PLANS.free.monthlyExtractionLimit;
    return {
      remaining: freeLimit,
      limit: freeLimit,
      used: 0,
      plan: "free" as PlanType,
    };
  }

  const plan = (data.plan as PlanType) ?? "free";
  const limit = PLANS[plan].monthlyExtractionLimit;
  const remaining = Number.isFinite(limit)
    ? Math.max(0, limit - data.extraction_count)
    : Infinity;

  return {
    remaining,
    limit,
    used: data.extraction_count,
    plan,
  };
}

/**
 * 使用制限をチェック（クライアント側）
 */
export async function checkUsageLimitClient(): Promise<boolean> {
  const usage = await getUserUsageClient();
  if (!Number.isFinite(usage.limit)) return true; // Premium: 無制限
  return usage.used < usage.limit;
}
