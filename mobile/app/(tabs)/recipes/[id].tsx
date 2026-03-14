import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Pencil, Trash2, Star } from "lucide-react-native";

import type { Recipe } from "@/domain/entities/recipe";
import { RecipeDetailView } from "@/components/features/recipe/recipe-detail-view";
import { useRecipes } from "@/hooks/use-recipes";
import { useShoppingList } from "@/hooks/use-shopping-list";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getById, update, remove } = useRecipes();
  const { addRecipe } = useShoppingList();
  const [recipe, setRecipe] = useState<Recipe | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getById(id).then((data) => {
        setRecipe(data);
        setLoading(false);
      });
    }, [id, getById])
  );

  const handleToggleFavorite = async () => {
    if (!recipe) return;
    const updated = await update(id, { isFavorite: !recipe.isFavorite });
    if (updated) setRecipe(updated);
  };

  const handleAddToShoppingList = async (servings: number) => {
    if (!recipe) return;
    await addRecipe(recipe, servings);
    Alert.alert("追加完了", `${servings}人前で買い物リストに追加しました`);
  };

  const handleDelete = () => {
    Alert.alert("レシピを削除", "このレシピを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          await remove(id);
          router.back();
        },
      },
    ]);
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
      {/* Nav Bar */}
      <View
        style={{
          height: 48,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
        >
          <ChevronLeft size={20} color="#E86A30" />
          <Text
            style={{
              fontSize: 15,
              fontWeight: "500",
              color: "#E86A30",
              fontFamily: "Inter",
            }}
          >
            戻る
          </Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <TouchableOpacity onPress={handleToggleFavorite}>
            <Star
              size={20}
              color="#E5A820"
              fill={recipe.isFavorite ? "#E5A820" : "none"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/recipes/${id}/edit`)}
          >
            <Pencil size={20} color="#6B6862" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Trash2 size={20} color="#D64545" />
          </TouchableOpacity>
        </View>
      </View>

      <RecipeDetailView
        recipe={recipe}
        onAddToShoppingList={handleAddToShoppingList}
      />
    </SafeAreaView>
  );
}
