import { useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CookingPot } from "lucide-react-native";

import type { Recipe } from "@/domain/entities/recipe";
import { UrlInputForm } from "@/components/features/video/url-input-form";
import { RecipeCard } from "@/components/features/recipe/recipe-card";
import { FeedbackMenu } from "@/components/features/feedback/feedback-menu";
import { UserMenu } from "@/components/features/auth/user-menu";
import { LoginButton } from "@/components/features/auth/login-button";
import { UsageInfoCard } from "@/components/features/usage/usage-info-card";
import { useRecipes } from "@/hooks/use-recipes";
import { useExtractRecipe } from "@/hooks/use-extract-recipe";
import { useAuth } from "@/hooks/use-auth";
import { useUsage } from "@/hooks/use-usage";
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from "@/src/lib/constants";

export default function HomeScreen() {
  const router = useRouter();
  const { recipes, save, refresh } = useRecipes();
  const extractState = useExtractRecipe();
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth();
  const { usage, refresh: refreshUsage } = useUsage();

  useFocusEffect(
    useCallback(() => {
      if (__DEV__) {
        console.log("[HomeScreen] Focus effect triggered, refreshing data...");
      }
      const refreshData = async () => {
        try {
          await Promise.all([refresh(), refreshUsage()]);
        } catch (error) {
          if (__DEV__) {
            console.error("[HomeScreen] Failed to refresh data:", error);
          }
          // エラーは静かに失敗させる（各hookで個別にハンドリング）
        }
      };
      void refreshData();
    }, [refresh, refreshUsage])
  );

  const recentRecipes = recipes.slice(0, 5);

  // 認証状態のロード中は中央にローディング表示
  if (authLoading) {
    if (__DEV__) {
      console.log("[HomeScreen] Showing loading screen (authLoading=true)");
    }
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (__DEV__) {
    console.log("[HomeScreen] Rendering main content", {
      isAuthenticated,
      hasUser: !!user,
      hasUsage: !!usage,
      recipesCount: recipes.length,
    });
  }

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
    <SafeAreaView style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero */}
        <View style={styles.heroContainer}>
          <View style={styles.heroLeft}>
            <View style={styles.titleRow}>
              <CookingPot size={28} color={COLORS.primary.DEFAULT} />
              <Text style={styles.title}>Recipi Book</Text>
            </View>
            <Text style={styles.subtitle}>料理動画からレシピを抽出</Text>
          </View>
          <View style={styles.heroRight}>
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
        {isAuthenticated && usage && <UsageInfoCard usage={usage} />}

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
          <View style={styles.recipesSection}>
            <View style={styles.recipesSectionHeader}>
              <Text style={styles.sectionTitle}>最近のレシピ</Text>
              <Text
                style={styles.viewAllLink}
                onPress={() => router.push("/(tabs)/recipes")}
              >
                すべて見る
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recipesScrollContent}
            >
              {recentRecipes.map((item, index) => (
                <RecipeCard
                  key={item.id}
                  recipe={item}
                  index={index}
                  onPress={() => router.push(`/(tabs)/recipes/${item.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.LG,
  },
  loadingText: {
    fontSize: SPACING.LG,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.neutral[500],
    fontFamily: "Inter",
  },
  scrollContent: {
    paddingHorizontal: SPACING.XL,
    paddingTop: SPACING.XXL,
    paddingBottom: 100,
    gap: SPACING.XXXL,
  },
  heroContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroLeft: {
    gap: SPACING.SM,
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.SM,
  },
  title: {
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.neutral[900],
    fontFamily: "Inter",
  },
  subtitle: {
    fontSize: FONT_SIZE.MD,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.neutral[500],
    fontFamily: "Inter",
  },
  heroRight: {
    flexDirection: "row",
    gap: SPACING.SM,
    alignItems: "center",
  },
  recipesSection: {
    gap: SPACING.LG,
  },
  recipesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.neutral[900],
    fontFamily: "Inter",
  },
  viewAllLink: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.primary.DEFAULT,
    fontFamily: "Inter",
  },
  recipesScrollContent: {
    gap: SPACING.MD,
  },
});
