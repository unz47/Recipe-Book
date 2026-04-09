import { View, Text } from "react-native";

import type { Ingredient } from "@/domain/entities/recipe";
import { Card } from "@/components/ui/card";
import { adjustAmount } from "@/lib/utils";

type IngredientListProps = {
  ingredients: Ingredient[];
  servingsRatio?: number;
};

export function IngredientList({
  ingredients,
  servingsRatio = 1,
}: IngredientListProps) {
  return (
    <Card>
      {ingredients.map((ing, index) => (
        <View
          key={index}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderBottomWidth: index < ingredients.length - 1 ? 1 : 0,
            borderBottomColor: "#E8E6E1",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: "#1F1E1C",
              fontFamily: "Inter",
              flex: 1,
            }}
          >
            {ing.name}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: "#6B6862",
              fontFamily: "Inter",
            }}
          >
            {adjustAmount(ing.amount, servingsRatio)}
            {ing.unit ? ` ${ing.unit}` : ""}
          </Text>
        </View>
      ))}
    </Card>
  );
}
