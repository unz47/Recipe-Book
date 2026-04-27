import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Sparkles } from "lucide-react-native";

import { COLORS, USAGE, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SPACING } from "@/lib/constants";

type UsageData = {
  remaining: number;
  limit: number;
  used: number;
  plan: string;
};

type UsageInfoCardProps = {
  usage: UsageData;
};

export function UsageInfoCard({ usage }: UsageInfoCardProps) {
  const router = useRouter();
  const isPremium = usage.plan === "premium";
  const isUnlimited = !Number.isFinite(usage.limit);
  const isWarning = !isUnlimited && usage.remaining <= USAGE.WARNING_THRESHOLD && usage.remaining > 0;
  const isExhausted = !isUnlimited && usage.remaining === 0;
  const isFree = usage.plan === "free";

  const getWarningMessage = () => {
    if (isUnlimited) return null;
    if (isExhausted) {
      return isFree
        ? "今月の上限に達しました。Premium にアップグレードすると無制限に利用できます。"
        : "今月の上限に達しました。来月また利用できます。";
    }
    if (isWarning) {
      return "残り回数が少なくなっています";
    }
    return null;
  };

  const warningMessage = getWarningMessage();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>今月の残り抽出回数</Text>
        {isFree && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>Free</Text>
          </View>
        )}
        {isPremium && (
          <View style={[styles.freeBadge, { backgroundColor: COLORS.primary[100] }]}>
            <Text style={[styles.freeBadgeText, { color: COLORS.primary.DEFAULT }]}>Premium</Text>
          </View>
        )}
      </View>
      {isUnlimited ? (
        <Text
          style={[styles.count, { color: COLORS.primary.DEFAULT }]}
        >
          無制限
        </Text>
      ) : (
        <Text
          style={[
            styles.count,
            {
              color: usage.remaining > USAGE.WARNING_THRESHOLD ? COLORS.primary.DEFAULT : COLORS.danger,
            },
          ]}
        >
          {usage.remaining} / {usage.limit}回
        </Text>
      )}
      {warningMessage && <Text style={styles.warning}>{warningMessage}</Text>}
      {isFree && (isExhausted || isWarning) && (
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => router.push("/paywall")}
        >
          <Sparkles size={16} color={COLORS.white} />
          <Text style={styles.upgradeButtonText}>Premium にアップグレード</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.LG,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.XS,
  },
  label: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.neutral[500],
    fontFamily: "Inter",
  },
  freeBadge: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: BORDER_RADIUS.SM,
    paddingHorizontal: SPACING.SM,
    paddingVertical: 2,
  },
  freeBadgeText: {
    fontSize: FONT_SIZE.XS,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.neutral[500],
    fontFamily: "Inter",
  },
  count: {
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.BOLD,
    fontFamily: "Inter",
  },
  warning: {
    fontSize: FONT_SIZE.XS,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.danger,
    fontFamily: "Inter",
    marginTop: SPACING.XS,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.SM,
    backgroundColor: COLORS.primary.DEFAULT,
    borderRadius: BORDER_RADIUS.SM,
    paddingVertical: SPACING.MD,
    marginTop: SPACING.MD,
  },
  upgradeButtonText: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.white,
    fontFamily: "Inter",
  },
});
