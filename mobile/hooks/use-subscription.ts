import { useEffect, useState, useCallback } from "react";
import Purchases from "react-native-purchases";

import {
  checkPremiumStatus,
  isRevenueCatInitialized,
} from "@/infrastructure/services/revenue-cat";

type SubscriptionState = {
  isPremium: boolean;
  isLoading: boolean;
};

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    isPremium: false,
    isLoading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const isPremium = await checkPremiumStatus();
      setState({ isPremium, isLoading: false });
    } catch {
      setState({ isPremium: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    refresh();

    // サブスク状態のリアルタイム監視
    if (!isRevenueCatInitialized()) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const handleUpdate = (customerInfo: { entitlements: { active: Record<string, unknown> } }) => {
      const isPremium =
        typeof customerInfo.entitlements.active["premium"] !== "undefined";
      setState({ isPremium, isLoading: false });
    };

    Purchases.addCustomerInfoUpdateListener(handleUpdate);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(handleUpdate);
    };
  }, [refresh]);

  return {
    ...state,
    refresh,
  };
}
