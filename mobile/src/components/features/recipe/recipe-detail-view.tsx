import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Timer, Lightbulb, ShoppingCart } from "lucide-react-native";

import type { Recipe } from "@/domain/entities/recipe";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IngredientList } from "./ingredient-list";
import { StepList } from "./step-list";
import { ServingsAdjuster } from "./servings-adjuster";
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/lib/constants";

type RecipeDetailViewProps = {
  recipe: Recipe;
  onAddToShoppingList: (servings: number) => void;
};

export function RecipeDetailView({
  recipe,
  onAddToShoppingList,
}: RecipeDetailViewProps) {
  const baseServings = parseInt(recipe.servings ?? "2", 10) || 2;
  const [servings, setServings] = useState(baseServings);
  const servingsRatio = servings / baseServings;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FAFAF8" }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 100,
        gap: 24,
      }}
    >
      {/* Title & Meta */}
      <View style={{ gap: 12 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#1F1E1C",
            fontFamily: "Inter",
          }}
        >
          {recipe.title}
        </Text>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {recipe.totalTime && (
            <Badge
              label={recipe.totalTime}
              icon={<Timer size={14} color="#E86A30" />}
              backgroundColor="#FFF5F0"
            />
          )}
          {recipe.difficulty && (
            <Badge
              label={DIFFICULTY_LABELS[recipe.difficulty]}
              backgroundColor={DIFFICULTY_COLORS[recipe.difficulty].bg}
              textColor={DIFFICULTY_COLORS[recipe.difficulty].text}
            />
          )}
        </View>
      </View>

      {/* Servings */}
      <ServingsAdjuster
        servings={servings}
        onDecrease={() => setServings((s) => Math.max(1, s - 1))}
        onIncrease={() => setServings((s) => s + 1)}
      />

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: "#E8E6E1" }} />

      {/* Ingredients */}
      <View style={{ gap: 12 }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: "600",
            color: "#1F1E1C",
            fontFamily: "Inter",
          }}
        >
          材料
        </Text>
        <IngredientList
          ingredients={recipe.ingredients}
          servingsRatio={servingsRatio}
        />
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: "#E8E6E1" }} />

      {/* Steps */}
      <View style={{ gap: 12 }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: "600",
            color: "#1F1E1C",
            fontFamily: "Inter",
          }}
        >
          手順
        </Text>
        <StepList steps={recipe.steps} />
      </View>

      {/* Tips */}
      {recipe.tips && recipe.tips.length > 0 && (
        <>
          <View style={{ height: 1, backgroundColor: "#E8E6E1" }} />
          <View
            style={{
              backgroundColor: "#FFF5F0",
              borderRadius: 12,
              padding: 16,
              gap: 10,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Lightbulb size={16} color="#E86A30" />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#E86A30",
                  fontFamily: "Inter",
                }}
              >
                コツ・ポイント
              </Text>
            </View>
            {recipe.tips.map((tip, index) => (
              <Text
                key={index}
                style={{
                  fontSize: 13,
                  lineHeight: 20.8,
                  color: "#6B6862",
                  fontFamily: "Inter",
                }}
              >
                {tip}
              </Text>
            ))}
          </View>
        </>
      )}

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: "#E8E6E1" }} />

      {/* Actions */}
      <View style={{ gap: 10 }}>
        <Button
          title="買い物リストに追加"
          onPress={() => onAddToShoppingList(servings)}
          variant="secondary"
          icon={<ShoppingCart size={16} color="#6B6862" />}
        />
      </View>
    </ScrollView>
  );
}
