import { View, TextInput, Text, type ViewStyle } from "react-native";

type InputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: ViewStyle;
};

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  icon,
  multiline = false,
  numberOfLines,
  style,
  inputStyle,
}: InputProps) {
  return (
    <View style={[{ gap: 8 }, style]}>
      {label && (
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: "#6B6862",
            fontFamily: "Inter",
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          {
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#E8E6E1",
            borderRadius: multiline ? 10 : 12,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            minHeight: multiline ? 80 : 48,
          },
          inputStyle,
        ]}
      >
        {icon && <View style={{ marginRight: 10 }}>{icon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#B0ACA3"
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? "top" : "center"}
          style={{
            flex: 1,
            fontSize: multiline ? 14 : 15,
            fontWeight: "500",
            color: "#1F1E1C",
            fontFamily: "Inter",
            paddingVertical: multiline ? 12 : 0,
          }}
        />
      </View>
    </View>
  );
}
