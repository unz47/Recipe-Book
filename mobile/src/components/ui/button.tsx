import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: "#E86A30",
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E6E1",
  },
  destructive: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
};

const variantTextStyles: Record<ButtonVariant, TextStyle> = {
  primary: { color: "#FFFFFF", fontWeight: "600" },
  secondary: { color: "#1F1E1C", fontWeight: "500" },
  destructive: { color: "#D64545", fontWeight: "500" },
  ghost: { color: "#E86A30", fontWeight: "600" },
};

export function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        {
          height: 48,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: disabled ? 0.5 : 1,
        },
        variantStyles[variant],
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#FFFFFF" : "#E86A30"}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              {
                fontSize: 15,
                fontFamily: "Inter",
              },
              variantTextStyles[variant],
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
