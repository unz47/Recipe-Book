import { TouchableOpacity, Text } from "react-native";
import { LogIn } from "lucide-react-native";
import { useRouter } from "expo-router";

export function LoginButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push("/auth/login")}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: "#E86A30",
      }}
    >
      <LogIn size={16} color="#FFFFFF" />
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: "#FFFFFF",
          fontFamily: "Inter",
        }}
      >
        ログイン
      </Text>
    </TouchableOpacity>
  );
}
