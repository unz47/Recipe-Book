import { useState, useEffect, useCallback } from "react";
import { getUserUsageClient } from "@/lib/usage-client";

type UsageData = {
  remaining: number;
  limit: number;
  used: number;
  plan: string;
};

export function useUsage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    console.log("[useUsage] Fetching usage data...");
    try {
      setIsLoading(true);
      setError(null);

      // クライアント側から直接Supabaseにアクセス
      const usageData = await getUserUsageClient();
      console.log("[useUsage] Usage data fetched:", usageData);
      setUsage(usageData);
    } catch (err) {
      console.error("[useUsage] Failed to fetch usage:", err);
      // エラーは表示せず、静かに失敗させる（ログアウト状態など）
      setUsage(null);
      setError(null);
    } finally {
      console.log("[useUsage] Fetch complete");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsage();
  }, [fetchUsage]);

  return {
    usage,
    isLoading,
    error,
    refresh: fetchUsage,
  };
}
