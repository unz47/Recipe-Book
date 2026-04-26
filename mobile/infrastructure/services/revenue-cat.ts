import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

const ENTITLEMENT_ID = "premium";

let initialized = false;

/**
 * RevenueCat SDK を初期化する
 * アプリ起動時に1度だけ呼び出す
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
  if (initialized) {
    return;
  }

  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    }

    let apiKey: string | undefined;

    if (Platform.OS === "android") {
      apiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
    } else if (Platform.OS === "ios") {
      apiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
    }

    if (!apiKey || apiKey === "your_android_api_key_here" || apiKey === "your_ios_api_key_here") {
      console.warn("[RevenueCat] API key not configured, skipping initialization");
      return;
    }

    await Purchases.configure({
      apiKey,
      appUserID: userId,
    });

    initialized = true;
    console.log("[RevenueCat] Initialized successfully");
  } catch (error) {
    console.error("[RevenueCat] Failed to initialize:", error);
  }
}

/**
 * RevenueCat が初期化済みかどうか
 */
export function isRevenueCatInitialized(): boolean {
  return initialized;
}

/**
 * ユーザーが Premium エンタイトルメントを持っているか確認
 */
export async function checkPremiumStatus(): Promise<boolean> {
  if (!initialized) {
    return false;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
  } catch (error) {
    console.error("[RevenueCat] Error checking premium status:", error);
    return false;
  }
}

/**
 * RevenueCat のユーザーIDを Supabase の userId に紐付ける
 */
export async function loginRevenueCat(userId: string): Promise<void> {
  if (!initialized) {
    return;
  }

  try {
    await Purchases.logIn(userId);
    console.log("[RevenueCat] User logged in:", userId);
  } catch (error) {
    console.error("[RevenueCat] Failed to log in user:", error);
  }
}

/**
 * RevenueCat からログアウト（匿名ユーザーに戻す）
 */
export async function logoutRevenueCat(): Promise<void> {
  if (!initialized) {
    return;
  }

  try {
    await Purchases.logOut();
    console.log("[RevenueCat] User logged out");
  } catch (error) {
    console.error("[RevenueCat] Failed to log out:", error);
  }
}
