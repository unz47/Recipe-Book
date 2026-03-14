import { useState, useCallback } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Plus } from "lucide-react-native";

import { ShoppingGroupView } from "@/components/features/shopping/shopping-group";
import { useShoppingList } from "@/hooks/use-shopping-list";

export default function ShoppingListScreen() {
  const { groups, refresh, addItem, toggle, toggleAll, clearCompleted } = useShoppingList();
  const [newItemName, setNewItemName] = useState("");

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const handleAddItem = async () => {
    const trimmed = newItemName.trim();
    if (!trimmed) return;
    await addItem(trimmed);
    setNewItemName("");
  };

  const hasCheckedItems = groups.some((g) =>
    g.items.some((i) => i.checked)
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAFAF8" }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 100,
          gap: 24,
        }}
      >
        {/* Title Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: "#1F1E1C",
              fontFamily: "Inter",
            }}
          >
            買い物リスト
          </Text>
          {hasCheckedItems && (
            <Text
              onPress={clearCompleted}
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: "#D64545",
                fontFamily: "Inter",
              }}
            >
              完了を消去
            </Text>
          )}
        </View>

        {/* Add Item */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            alignItems: "center",
          }}
        >
          <TextInput
            value={newItemName}
            onChangeText={setNewItemName}
            placeholder="アイテムを追加..."
            placeholderTextColor="#B0ACA3"
            onSubmitEditing={handleAddItem}
            returnKeyType="done"
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E8E6E1",
              paddingHorizontal: 14,
              fontSize: 14,
              color: "#1F1E1C",
              fontFamily: "Inter",
            }}
          />
          <TouchableOpacity
            onPress={handleAddItem}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: "#E86A30",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Groups */}
        {groups.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 100,
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
              買い物リストは空です
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#B0ACA3",
                fontFamily: "Inter",
                textAlign: "center",
              }}
            >
              レシピ詳細画面から材料を{"\n"}
              買い物リストに追加できます
            </Text>
          </View>
        ) : (
          groups.map((group, index) => (
            <ShoppingGroupView
              key={group.recipeId}
              group={group}
              colorIndex={index}
              onToggle={toggle}
              onToggleAll={toggleAll}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
