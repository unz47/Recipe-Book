import { View, Text, TouchableOpacity } from "react-native";
import { Utensils } from "lucide-react-native";

import type { ShoppingGroup as ShoppingGroupType } from "@/domain/entities/shopping-item";
import { Card } from "@/components/ui/card";
import { ShoppingItemRow } from "./shopping-item";

type ShoppingGroupProps = {
  group: ShoppingGroupType;
  colorIndex: number;
  onToggle: (itemId: string) => void;
  onToggleAll: (itemIds: string[], checked: boolean) => void;
};

const GROUP_ICON_COLORS = ["#E86A30", "#5C8A5C", "#E5A820", "#C85420"];

export function ShoppingGroupView({
  group,
  colorIndex,
  onToggle,
  onToggleAll,
}: ShoppingGroupProps) {
  const iconColor = GROUP_ICON_COLORS[colorIndex % GROUP_ICON_COLORS.length];
  const allChecked = group.items.every((i) => i.checked);

  const handleTitlePress = () => {
    const ids = group.items.map((i) => i.id);
    onToggleAll(ids, !allChecked);
  };

  return (
    <View style={{ gap: 12 }}>
      <TouchableOpacity
        onPress={handleTitlePress}
        activeOpacity={0.6}
        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
      >
        <Utensils size={16} color={iconColor} />
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: allChecked ? "#B0ACA3" : "#1F1E1C",
            fontFamily: "Inter",
          }}
        >
          {group.recipeTitle}
        </Text>
        {group.servings != null && (
          <Text
            style={{
              fontSize: 12,
              fontWeight: "500",
              color: "#8A8680",
              fontFamily: "Inter",
            }}
          >
            ({group.servings}人前)
          </Text>
        )}
      </TouchableOpacity>
      <Card>
        {group.items.map((item, index) => (
          <ShoppingItemRow
            key={item.id}
            item={item}
            isLast={index === group.items.length - 1}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </Card>
    </View>
  );
}
