import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
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
  const [descExpanded, setDescExpanded] = useState(false);
  const [descClamped, setDescClamped] = useState(false);

  const onDescTextLayout = useCallback(
    (e: { nativeEvent: { lines: unknown[] } }) => {
      if (!descExpanded && e.nativeEvent.lines.length >= 3) {
        setDescClamped(true);
      }
    },
    [descExpanded]
  );

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
          {recipe.category && (
            <Badge
              label={recipe.category}
              backgroundColor="#F0EDE8"
              textColor="#6B6862"
            />
          )}
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

      {/* Description */}
      {recipe.description ? (
        <View>
          <Text
            numberOfLines={descExpanded ? undefined : 3}
            onTextLayout={onDescTextLayout}
            style={{
              fontSize: 14,
              lineHeight: 22.4,
              color: "#6B6862",
              fontFamily: "Inter",
            }}
          >
            {recipe.description}
          </Text>
          {descClamped && (
            <Pressable onPress={() => setDescExpanded((v) => !v)}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: "#E86A30",
                  marginTop: 4,
                  fontFamily: "Inter",
                }}
              >
                {descExpanded ? "閉じる" : "もっと見る"}
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

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
