import { useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";

import type { Recipe } from "@/domain/entities/recipe";
import { RecipeEditForm } from "@/components/features/recipe/recipe-edit-form";
import { useRecipes } from "@/hooks/use-recipes";

export default function RecipeEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getById, update } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getById(id).then((data) => {
      setRecipe(data);
      setLoading(false);
    });
  }, [id, getById]);

  const handleSave = async (updates: Partial<Recipe>) => {
    await update(id, updates);
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#FAFAF8",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="#E86A30" size="large" />
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#FAFAF8",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: "#8A8680",
            fontFamily: "Inter",
          }}
        >
          レシピが見つかりません
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAFAF8" }}>
      <RecipeEditForm
        recipe={recipe}
        onSave={handleSave}
        onCancel={() => router.back()}
      />
    </SafeAreaView>
  );
}
