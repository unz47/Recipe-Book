import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  User,
  Mail,
  Database,
  Trash2,
  Info,
  ChevronRight,
} from "lucide-react-native";

import { useAuth } from "@/hooks/use-auth";
import { syncLocalToSupabase } from "@/lib/supabase-storage";
import { getStoredRecipes, clearStorage } from "@/lib/storage";
import type { Recipe } from "@/domain/entities/recipe";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncData = async () => {
    if (!user) {
      Alert.alert("エラー", "ログインしてください");
      return;
    }

    setIsSyncing(true);
    try {
      const localRecipes = await getStoredRecipes<Recipe>();
      await syncLocalToSupabase(localRecipes);
      Alert.alert("成功", `${localRecipes.length}件のレシピを同期しました`);
    } catch (error) {
      Alert.alert("エラー", "同期に失敗しました");
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearLocalData = () => {
    Alert.alert(
      "ローカルデータを削除",
      "ローカルに保存されているすべてのレシピが削除されます。この操作は元に戻せません。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              await clearStorage();
              Alert.alert("成功", "ローカルデータを削除しました");
            } catch (error) {
              Alert.alert("エラー", "削除に失敗しました");
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert("ログアウト", "ログアウトしますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "ログアウト",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAFAF8" }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 40,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F1E1C" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#1F1E1C",
              fontFamily: "Inter",
            }}
          >
            設定
          </Text>
        </View>

        {/* Account Section */}
        {user && (
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#8A8680",
                fontFamily: "Inter",
                marginBottom: 12,
              }}
            >
              アカウント
            </Text>

            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E8E6E1",
              }}
            >
              {/* Email */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: "#E8E6E1",
                }}
              >
                <Mail size={20} color="#8A8680" />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "500",
                      color: "#8A8680",
                      fontFamily: "Inter",
                    }}
                  >
                    メールアドレス
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: "#1F1E1C",
                      fontFamily: "Inter",
                      marginTop: 2,
                    }}
                  >
                    {user.email}
                  </Text>
                </View>
              </View>

              {/* User ID */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  padding: 16,
                }}
              >
                <User size={20} color="#8A8680" />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "500",
                      color: "#8A8680",
                      fontFamily: "Inter",
                    }}
                  >
                    ユーザーID
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: "#B0ACA3",
                      fontFamily: "Inter",
                      marginTop: 2,
                    }}
                  >
                    {user.id}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Data Section */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#8A8680",
              fontFamily: "Inter",
              marginBottom: 12,
            }}
          >
            データ管理
          </Text>

          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E8E6E1",
            }}
          >
            {/* Sync Data */}
            {user && (
              <TouchableOpacity
                onPress={handleSyncData}
                disabled={isSyncing}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: "#E8E6E1",
                  opacity: isSyncing ? 0.5 : 1,
                }}
              >
                <Database size={20} color="#E86A30" />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    fontWeight: "500",
                    color: "#1F1E1C",
                    fontFamily: "Inter",
                  }}
                >
                  {isSyncing ? "同期中..." : "データを同期"}
                </Text>
                <ChevronRight size={20} color="#B0ACA3" />
              </TouchableOpacity>
            )}

            {/* Clear Local Data */}
            <TouchableOpacity
              onPress={handleClearLocalData}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 16,
              }}
            >
              <Trash2 size={20} color="#E86A30" />
              <Text
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: "500",
                  color: "#E86A30",
                  fontFamily: "Inter",
                }}
              >
                ローカルデータを削除
              </Text>
              <ChevronRight size={20} color="#B0ACA3" />
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#8A8680",
              fontFamily: "Inter",
              marginBottom: 12,
            }}
          >
            アプリについて
          </Text>

          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E8E6E1",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 16,
              }}
            >
              <Info size={20} color="#8A8680" />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "500",
                    color: "#1F1E1C",
                    fontFamily: "Inter",
                  }}
                >
                  バージョン
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#8A8680",
                    fontFamily: "Inter",
                    marginTop: 2,
                  }}
                >
                  1.0.0
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        {user && (
          <TouchableOpacity
            onPress={handleSignOut}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E8E6E1",
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#E86A30",
                fontFamily: "Inter",
              }}
            >
              ログアウト
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
