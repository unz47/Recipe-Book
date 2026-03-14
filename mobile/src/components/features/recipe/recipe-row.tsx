import { TouchableOpacity, View, Text } from "react-native";
import { Utensils, Timer } from "lucide-react-native";

import type { Recipe } from "@/domain/entities/recipe";
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/lib/constants";
import { getThumbnailColor } from "@/lib/utils";

type RecipeRowProps = {
  recipe: Recipe;
  index: number;
  onPress: () => void;
};

export function RecipeRow({ recipe, index, onPress }: RecipeRowProps) {
  const bgColor = getThumbnailColor(index);
  const difficulty = recipe.difficulty;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E8E6E1",
        padding: 12,
        gap: 14,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 10,
          backgroundColor: bgColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Utensils size={20} color="#B0ACA3" />
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#1F1E1C",
            fontFamily: "Inter",
          }}
        >
          {recipe.title}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {recipe.totalTime && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Timer size={12} color="#8A8680" />
              <Text
                style={{
                  fontSize: 12,
                  color: "#8A8680",
                  fontFamily: "Inter",
                }}
              >
                {recipe.totalTime}
              </Text>
            </View>
          )}
          {difficulty && (
            <View
              style={{
                backgroundColor: DIFFICULTY_COLORS[difficulty].bg,
                borderRadius: 6,
                paddingHorizontal: 8,
                height: 22,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "500",
                  color: DIFFICULTY_COLORS[difficulty].text,
                  fontFamily: "Inter",
                }}
              >
                {DIFFICULTY_LABELS[difficulty]}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
