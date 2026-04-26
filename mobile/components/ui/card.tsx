import { View, type ViewStyle } from "react-native";

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function Card({ children, style }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#E8E6E1",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
