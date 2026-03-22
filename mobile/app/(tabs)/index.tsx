import { useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CookingPot } from "lucide-react-native";

import type { Recipe } from "@/domain/entities/recipe";
import { UrlInputForm } from "@/components/features/video/url-input-form";
import { RecipeCard } from "@/components/features/recipe/recipe-card";
import { FeedbackMenu } from "@/components/features/feedback/feedback-menu";
import { useRecipes } from "@/hooks/use-recipes";
import { useExtractRecipe } from "@/hooks/use-extract-recipe";

export default function HomeScreen() {
  const router = useRouter();
  const { recipes, save, refresh } = useRecipes();
  const extractState = useExtractRecipe();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const recentRecipes = recipes.slice(0, 5);

  const handleExtract = async (url: string) => {
    const dto = await extractState.extract(url);
    if (dto?.id) {
      const recipe: Recipe = {
        ...dto,
        createdAt: dto.createdAt ?? new Date().toISOString(),
      };
      await save(recipe);
      router.push(`/(tabs)/recipes/${recipe.id}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAFAF8" }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 100,
          gap: 32,
        }}
      >
        {/* Hero */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ gap: 8, flex: 1 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <CookingPot size={28} color="#E86A30" />
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: "#1F1E1C",
                  fontFamily: "Inter",
                }}
              >
                Recipi Book
              </Text>
            </View>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#8A8680",
                fontFamily: "Inter",
              }}
            >
              料理動画からレシピを抽出
            </Text>
          </View>
          <FeedbackMenu />
        </View>

        {/* URL Input */}
        <UrlInputForm
          onExtract={handleExtract}
          isLoading={extractState.isLoading}
          error={
            extractState.status === "error" ? extractState.error : undefined
          }
        />

        {/* Recent Recipes */}
        {recentRecipes.length > 0 && (
          <View style={{ gap: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: "#1F1E1C",
                  fontFamily: "Inter",
                }}
              >
                最近のレシピ
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: "#E86A30",
                  fontFamily: "Inter",
                }}
                onPress={() => router.push("/(tabs)/recipes")}
              >
                すべて見る
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {recentRecipes.map((item, index) => (
                <RecipeCard
                  key={item.id}
                  recipe={item}
                  index={index}
                  onPress={() =>
                    router.push(`/(tabs)/recipes/${item.id}`)
                  }
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
