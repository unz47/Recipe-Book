import { View, Text, type ViewStyle } from "react-native";

type BadgeProps = {
  label: string;
  icon?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
};

export function Badge({
  label,
  icon,
  backgroundColor = "#FFF5F0",
  textColor = "#1F1E1C",
  style,
}: BadgeProps) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          backgroundColor,
          borderRadius: 8,
          paddingHorizontal: 10,
          height: 28,
        },
        style,
      ]}
    >
      {icon}
      <Text
        style={{
          fontSize: 12,
          fontWeight: "500",
          color: textColor,
          fontFamily: "Inter",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
