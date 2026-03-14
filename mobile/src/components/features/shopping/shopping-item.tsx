import { View, Text, TouchableOpacity } from "react-native";
import { Check } from "lucide-react-native";

import type { ShoppingItem } from "@/domain/entities/shopping-item";

type ShoppingItemRowProps = {
  item: ShoppingItem;
  isLast: boolean;
  onToggle: () => void;
};

export function ShoppingItemRow({
  item,
  isLast,
  onToggle,
}: ShoppingItemRowProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: "#E8E6E1",
      }}
    >
      {/* Checkbox */}
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          backgroundColor: item.checked ? "#E86A30" : "transparent",
          borderWidth: item.checked ? 0 : 1.5,
          borderColor: "#E8E6E1",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {item.checked && <Check size={14} color="#FFFFFF" />}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            color: item.checked ? "#B0ACA3" : "#1F1E1C",
            fontFamily: "Inter",
            textDecorationLine: item.checked ? "line-through" : "none",
          }}
        >
          {item.ingredientName}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "500",
          color: item.checked ? "#B0ACA3" : "#6B6862",
          fontFamily: "Inter",
        }}
      >
        {item.amount}
      </Text>
    </TouchableOpacity>
  );
}
