import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // URLパラメータからセッション情報を取得してSupabaseに渡す
    const handleCallback = async () => {
      try {
        // expo-web-browserが自動的に処理するため、
        // ここでは単にホーム画面にリダイレクトするだけ
        setTimeout(() => {
          router.replace("/");
        }, 1000);
      } catch (error) {
        console.error("Auth callback error:", error);
        router.replace("/");
      }
    };

    handleCallback();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#E86A30" />
      <Text style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
        ログイン中...
      </Text>
    </View>
  );
}
