import { TouchableOpacity, View, Text } from "react-native";
import { Utensils } from "lucide-react-native";

import type { Recipe } from "@/domain/entities/recipe";
import { DIFFICULTY_LABELS } from "@/lib/constants";
import { getThumbnailColor } from "@/lib/utils";

type RecipeCardProps = {
  recipe: Recipe;
  index: number;
  onPress: () => void;
};

export function RecipeCard({ recipe, index, onPress }: RecipeCardProps) {
  const bgColor = getThumbnailColor(index);

  const metaParts: string[] = [];
  if (recipe.totalTime) metaParts.push(recipe.totalTime);
  if (recipe.difficulty) metaParts.push(DIFFICULTY_LABELS[recipe.difficulty]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        width: 160,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E8E6E1",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: 100,
          backgroundColor: bgColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Utensils size={24} color="#B0ACA3" />
      </View>
      <View style={{ padding: 12, gap: 4 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#1F1E1C",
            fontFamily: "Inter",
          }}
        >
          {recipe.title}
        </Text>
        {metaParts.length > 0 && (
          <Text
            style={{
              fontSize: 12,
              color: "#8A8680",
              fontFamily: "Inter",
            }}
          >
            {metaParts.join(" · ")}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
