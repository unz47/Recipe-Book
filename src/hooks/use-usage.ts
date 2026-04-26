"use client";

import { useState, useEffect, useCallback } from "react";
import { getUserUsage } from "@/lib/use-cases";

type UsageData = {
  remaining: number;
  limit: number;
  used: number;
  plan: string;
};

export function useUsage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    try {
      setIsLoading(true);
      const usageData = await getUserUsage();
      setUsage(usageData);
    } catch {
      setUsage(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsage();
  }, [fetchUsage]);

  return { usage, isLoading, refresh: fetchUsage };
}
