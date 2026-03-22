import { useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CookingPot } from "lucide-react-native";

import type { Recipe } from "@/domain/entities/recipe";
import { UrlInputForm } from "@/components/features/video/url-input-form";
import { RecipeCard } from "@/components/features/recipe/recipe-card";
import { FeedbackMenu } from "@/components/features/feedback/feedback-menu";
import { UserMenu } from "@/components/features/auth/user-menu";
import { LoginButton } from "@/components/features/auth/login-button";
import { useRecipes } from "@/hooks/use-recipes";
import { useExtractRecipe } from "@/hooks/use-extract-recipe";
import { useAuth } from "@/hooks/use-auth";
import { useUsage } from "@/hooks/use-usage";

export default function HomeScreen() {
  const router = useRouter();
  const { recipes, save, refresh } = useRecipes();
  const extractState = useExtractRecipe();
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth();
  const { usage, refresh: refreshUsage } = useUsage();

  useFocusEffect(
    useCallback(() => {
      console.log("[HomeScreen] Focus effect triggered, refreshing data...");
      void refresh();
      void refreshUsage();
    }, [refresh, refreshUsage])
  );

  const recentRecipes = recipes.slice(0, 5);

  // 認証状態のロード中は中央にローディング表示
  if (authLoading) {
    console.log("[HomeScreen] Showing loading screen (authLoading=true)");
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FAFAF8" }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
          }}
        >
          <ActivityIndicator size="large" color="#E86A30" />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#8A8680",
              fontFamily: "Inter",
            }}
          >
            読み込み中...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log("[HomeScreen] Rendering main content", {
    isAuthenticated,
    hasUser: !!user,
    hasUsage: !!usage,
    recipesCount: recipes.length,
  });

  const handleExtract = async (url: string) => {
    const dto = await extractState.extract(url);
    if (dto?.id) {
      const recipe: Recipe = {
        ...dto,
        createdAt: dto.createdAt ?? new Date().toISOString(),
      };
      await save(recipe);
      await refreshUsage(); // 抽出成功後に使用状況を更新
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
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            {isAuthenticated && user ? (
              <UserMenu
                userEmail={user.email ?? ""}
                avatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture}
                onSignOut={signOut}
              />
            ) : (
              <LoginButton />
            )}
            <FeedbackMenu />
          </View>
        </View>

        {/* Usage Info */}
        {isAuthenticated && usage && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E8E6E1",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#8A8680",
                fontFamily: "Inter",
                marginBottom: 4,
              }}
            >
              今月の残り抽出回数
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: usage.remaining > 10 ? "#E86A30" : "#EF4444",
                fontFamily: "Inter",
              }}
            >
              {usage.remaining} / {usage.limit}回
            </Text>
            {usage.remaining <= 10 && usage.remaining > 0 && (
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#EF4444",
                  fontFamily: "Inter",
                  marginTop: 4,
                }}
              >
                残り回数が少なくなっています
              </Text>
            )}
            {usage.remaining === 0 && (
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#EF4444",
                  fontFamily: "Inter",
                  marginTop: 4,
                }}
              >
                今月の上限に達しました。来月また利用できます。
              </Text>
            )}
          </View>
        )}

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
