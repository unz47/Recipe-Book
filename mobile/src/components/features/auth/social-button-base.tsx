import { TouchableOpacity, Text, View, ActivityIndicator, ViewStyle } from "react-native";
import { ReactNode } from "react";

type SocialButtonBaseProps = {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
};

const BUTTON_HEIGHT = 56;
const BORDER_RADIUS = 16;
const ICON_SIZE = 24;

export function SocialButtonBase({
  onPress,
  isLoading = false,
  disabled = false,
  icon,
  label,
  backgroundColor,
  textColor,
  borderColor,
}: SocialButtonBaseProps) {
  const buttonStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: BUTTON_HEIGHT,
    borderRadius: BORDER_RADIUS,
    backgroundColor,
    gap: 12,
    opacity: isLoading || disabled ? 0.6 : 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    ...(borderColor && {
      borderWidth: 1,
      borderColor,
    }),
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading || disabled}
      activeOpacity={0.8}
      style={buttonStyle}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          <View style={{ width: ICON_SIZE, height: ICON_SIZE, alignItems: "center", justifyContent: "center" }}>
            {icon}
          </View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: textColor,
              fontFamily: "Inter",
            }}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
