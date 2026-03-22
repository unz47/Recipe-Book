import { useEffect, useRef, useState } from "react";
import { View, Text, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { CookingPot } from "lucide-react-native";

import { GoogleSignInButton } from "@/components/features/auth/google-sign-in-button";
import { AppleSignInButton } from "@/components/features/auth/apple-sign-in-button";

const { height } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const [error, setError] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={["#E86A30", "#D45A20", "#C04A10"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: height * 0.12,
            paddingBottom: 40,
            justifyContent: "space-between",
          }}
        >
          {/* Hero Section */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              alignItems: "center",
              gap: 24,
            }}
          >
            {/* Logo Icon */}
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "rgba(255, 255, 255, 0.3)",
              }}
            >
              <CookingPot size={48} color="#FFFFFF" strokeWidth={2.5} />
            </View>

            {/* Title */}
            <View style={{ gap: 12, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: "800",
                  color: "#FFFFFF",
                  fontFamily: "Inter",
                  letterSpacing: -0.5,
                }}
              >
                Recipi Book
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: "rgba(255, 255, 255, 0.9)",
                  fontFamily: "Inter",
                  textAlign: "center",
                  lineHeight: 24,
                }}
              >
                料理動画からレシピを抽出{"\n"}クラウドに保存して、どこでもアクセス
              </Text>
            </View>
          </Animated.View>

          {/* Login Section */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              gap: 16,
            }}
          >
            {/* Error Message */}
            {error && (
              <View
                style={{
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.3)",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#FFFFFF",
                    fontFamily: "Inter",
                    textAlign: "center",
                  }}
                >
                  {error}
                </Text>
              </View>
            )}

            {/* Social Login Buttons */}
            <View style={{ gap: 12 }}>
              <GoogleSignInButton
                mode="signin"
                onSuccess={() => {
                  console.log("[LoginScreen] onSuccess called, navigating to home...");
                  router.replace("/");
                  console.log("[LoginScreen] Navigation triggered");
                }}
                onError={(err) => setError(err)}
              />

              <AppleSignInButton
                onSuccess={() => {
                  console.log("[LoginScreen] onSuccess called, navigating to home...");
                  router.replace("/");
                  console.log("[LoginScreen] Navigation triggered");
                }}
                onError={(err) => setError(err)}
              />
            </View>

            {/* Terms */}
            <Text
              style={{
                fontSize: 12,
                fontWeight: "400",
                color: "rgba(255, 255, 255, 0.7)",
                fontFamily: "Inter",
                textAlign: "center",
                lineHeight: 18,
                marginTop: 8,
              }}
            >
              ログインすることで、利用規約とプライバシーポリシーに{"\n"}
              同意したものとみなされます
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
