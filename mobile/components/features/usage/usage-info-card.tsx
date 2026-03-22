import { View, Text, StyleSheet } from "react-native";
import { COLORS, USAGE, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SPACING } from "@/src/lib/constants";

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
  const isWarning = usage.remaining <= USAGE.WARNING_THRESHOLD && usage.remaining > 0;
  const isExhausted = usage.remaining === 0;

  const getWarningMessage = () => {
    if (isExhausted) {
      return "今月の上限に達しました。来月また利用できます。";
    }
    if (isWarning) {
      return "残り回数が少なくなっています";
    }
    return null;
  };

  const warningMessage = getWarningMessage();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>今月の残り抽出回数</Text>
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
      {warningMessage && <Text style={styles.warning}>{warningMessage}</Text>}
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
  label: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.neutral[500],
    fontFamily: "Inter",
    marginBottom: SPACING.XS,
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
});
