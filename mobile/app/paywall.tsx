import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Purchases, { PurchasesPackage, PURCHASES_ERROR_CODE } from "react-native-purchases";
import { X, Check, Sparkles, CookingPot } from "lucide-react-native";

import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS } from "@/lib/constants";
import { isRevenueCatInitialized } from "@/infrastructure/services/revenue-cat";

const PLAN_FEATURES = {
  free: [
    { text: "月5回のレシピ抽出", included: true },
    { text: "レシピの保存・編集", included: true },
    { text: "買い物リスト", included: true },
    { text: "クラウド同期", included: false },
    { text: "月50回のレシピ抽出", included: false },
  ],
  premium: [
    { text: "月50回のレシピ抽出", included: true },
    { text: "レシピの保存・編集", included: true },
    { text: "買い物リスト", included: true },
    { text: "クラウド同期", included: true },
    { text: "優先サポート", included: true },
  ],
} as const;

export default function PaywallScreen() {
  const router = useRouter();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Offering を取得
  useState(() => {
    const fetchPackages = async () => {
      if (!isRevenueCatInitialized()) {
        setIsLoading(false);
        return;
      }

      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current?.availablePackages) {
          setPackages(offerings.current.availablePackages);
        }
      } catch (error) {
        console.error("[Paywall] Error fetching offerings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  });

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setIsPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isPremium =
        typeof customerInfo.entitlements.active["premium"] !== "undefined";

      if (isPremium) {
        Alert.alert("", "Premium プランへようこそ!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
      ) {
        // ユーザーがキャンセルした場合は何もしない
      } else {
        Alert.alert("エラー", "購入処理に失敗しました。もう一度お試しください。");
        console.error("[Paywall] Purchase error:", error);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsPurchasing(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPremium =
        typeof customerInfo.entitlements.active["premium"] !== "undefined";

      if (isPremium) {
        Alert.alert("復元完了", "Premium プランが復元されました。", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("", "復元可能な購入が見つかりませんでした。");
      }
    } catch {
      Alert.alert("エラー", "復元に失敗しました。");
    } finally {
      setIsPurchasing(false);
    }
  };

  const monthlyPackage = packages.find(
    (pkg) => pkg.packageType === "MONTHLY"
  ) ?? packages[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAFAF8" }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: SPACING.XL,
          paddingTop: SPACING.LG,
          paddingBottom: 40,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginBottom: SPACING.LG,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: COLORS.neutral[100],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} color={COLORS.neutral[600]} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={{ alignItems: "center", marginBottom: SPACING.XXXL }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: COLORS.primary[100],
              alignItems: "center",
              justifyContent: "center",
              marginBottom: SPACING.LG,
            }}
          >
            <CookingPot size={36} color={COLORS.primary.DEFAULT} />
          </View>
          <Text
            style={{
              fontSize: 24,
              fontWeight: FONT_WEIGHT.BOLD,
              color: COLORS.neutral[900],
              fontFamily: "Inter",
              marginBottom: SPACING.SM,
            }}
          >
            Premium にアップグレード
          </Text>
          <Text
            style={{
              fontSize: FONT_SIZE.MD,
              fontWeight: FONT_WEIGHT.REGULAR,
              color: COLORS.neutral[500],
              fontFamily: "Inter",
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            もっとたくさんのレシピを抽出しよう
          </Text>
        </View>

        {/* Feature Comparison */}
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: BORDER_RADIUS.LG,
            borderWidth: 2,
            borderColor: COLORS.primary.DEFAULT,
            padding: SPACING.XL,
            marginBottom: SPACING.XXL,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: SPACING.SM,
              marginBottom: SPACING.LG,
            }}
          >
            <Sparkles size={20} color={COLORS.primary.DEFAULT} />
            <Text
              style={{
                fontSize: FONT_SIZE.LG,
                fontWeight: FONT_WEIGHT.BOLD,
                color: COLORS.neutral[900],
                fontFamily: "Inter",
              }}
            >
              Premium プラン
            </Text>
          </View>

          {PLAN_FEATURES.premium.map((feature, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: SPACING.MD,
                paddingVertical: SPACING.SM,
              }}
            >
              <Check
                size={18}
                color={
                  feature.included
                    ? COLORS.secondary.DEFAULT
                    : COLORS.neutral[300]
                }
              />
              <Text
                style={{
                  fontSize: FONT_SIZE.MD,
                  fontWeight: FONT_WEIGHT.MEDIUM,
                  color: feature.included
                    ? COLORS.neutral[900]
                    : COLORS.neutral[400],
                  fontFamily: "Inter",
                }}
              >
                {feature.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Price & Purchase Button */}
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
        ) : monthlyPackage ? (
          <View style={{ gap: SPACING.MD }}>
            <TouchableOpacity
              onPress={() => handlePurchase(monthlyPackage)}
              disabled={isPurchasing}
              style={{
                backgroundColor: COLORS.primary.DEFAULT,
                borderRadius: BORDER_RADIUS.MD,
                paddingVertical: SPACING.LG,
                alignItems: "center",
                opacity: isPurchasing ? 0.6 : 1,
              }}
            >
              {isPurchasing ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text
                  style={{
                    fontSize: FONT_SIZE.LG,
                    fontWeight: FONT_WEIGHT.BOLD,
                    color: COLORS.white,
                    fontFamily: "Inter",
                  }}
                >
                  {monthlyPackage.product.priceString}/月 で始める
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRestore}
              disabled={isPurchasing}
              style={{
                paddingVertical: SPACING.MD,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: FONT_SIZE.SM,
                  fontWeight: FONT_WEIGHT.MEDIUM,
                  color: COLORS.neutral[500],
                  fontFamily: "Inter",
                }}
              >
                購入を復元
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ alignItems: "center", paddingVertical: SPACING.XL }}>
            <Text
              style={{
                fontSize: FONT_SIZE.MD,
                fontWeight: FONT_WEIGHT.MEDIUM,
                color: COLORS.neutral[500],
                fontFamily: "Inter",
                textAlign: "center",
              }}
            >
              現在、購入可能なプランを読み込めませんでした。{"\n"}
              しばらくしてからもう一度お試しください。
            </Text>
          </View>
        )}

        {/* Terms */}
        <Text
          style={{
            fontSize: FONT_SIZE.XS,
            fontWeight: FONT_WEIGHT.REGULAR,
            color: COLORS.neutral[400],
            fontFamily: "Inter",
            textAlign: "center",
            lineHeight: 18,
            marginTop: SPACING.XXL,
          }}
        >
          サブスクリプションは自動更新されます。{"\n"}
          いつでもキャンセルできます。
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
