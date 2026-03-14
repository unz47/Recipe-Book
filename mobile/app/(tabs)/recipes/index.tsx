import { useState, useCallback } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Search, Star } from "lucide-react-native";

import { RecipeRow } from "@/components/features/recipe/recipe-row";
import { useRecipes } from "@/hooks/use-recipes";

const CATEGORIES = ["all", "favorites", "和食", "洋食", "中華", "簡単"] as const;

type FilterChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
};

function FilterChip({ label, active, onPress, icon }: FilterChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        height: 32,
        borderRadius: 16,
        paddingHorizontal: 14,
        flexDirection: "row",
        gap: 4,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: active ? "#E86A30" : "#FFFFFF",
        borderWidth: active ? 0 : 1,
        borderColor: "#E8E6E1",
      }}
    >
      {icon}
      <Text
        style={{
          fontSize: 13,
          fontWeight: "500",
          fontFamily: "Inter",
          color: active ? "#FFFFFF" : "#6B6862",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function RecipeListScreen() {
  const router = useRouter();
  const { recipes, search, refresh } = useRecipes();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const handleSearch = (text: string) => {
    setQuery(text);
    void search(text);
  };

  const handleCategoryPress = (category: string) => {
    setActiveCategory(category);
  };

  const filteredRecipes = recipes.filter((r) => {
    if (activeCategory === "favorites") return r.isFavorite;
    if (activeCategory !== "all") return r.category === activeCategory;
    return true;
  });

  const chipLabel = (cat: string) => {
    if (cat === "all") return "すべて";
    if (cat === "favorites") return "お気に入り";
    return cat;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAFAF8" }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: 20,
          gap: 20,
        }}
      >
        {/* Title */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#1F1E1C",
            fontFamily: "Inter",
          }}
        >
          レシピ一覧
        </Text>

        {/* Search Bar */}
        <View
          style={{
            height: 44,
            borderRadius: 10,
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#E8E6E1",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
          }}
        >
          <Search size={18} color="#B0ACA3" />
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="レシピを検索..."
            placeholderTextColor="#B0ACA3"
            style={{
              flex: 1,
              marginLeft: 10,
              fontSize: 14,
              color: "#1F1E1C",
              fontFamily: "Inter",
            }}
          />
        </View>

        {/* Filter Chips */}
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              label={chipLabel(cat)}
              active={activeCategory === cat}
              onPress={() => handleCategoryPress(cat)}
              icon={
                cat === "favorites" ? (
                  <Star
                    size={12}
                    color={activeCategory === cat ? "#FFFFFF" : "#E5A820"}
                    fill={activeCategory === cat ? "#FFFFFF" : "#E5A820"}
                  />
                ) : undefined
              }
            />
          ))}
        </View>

        {/* Recipe List */}
        {filteredRecipes.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: "#8A8680",
                fontFamily: "Inter",
              }}
            >
              レシピがありません
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#B0ACA3",
                fontFamily: "Inter",
                textAlign: "center",
              }}
            >
              ホーム画面からYouTube動画のURLを入力して{"\n"}
              レシピを抽出しましょう
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredRecipes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <RecipeRow
                recipe={item}
                index={index}
                onPress={() =>
                  router.push(`/(tabs)/recipes/${item.id}`)
                }
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
