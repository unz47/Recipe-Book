import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, Image } from "react-native";
import { User, LogOut, Settings } from "lucide-react-native";
import { useRouter } from "expo-router";

type UserMenuProps = {
  userEmail: string;
  avatarUrl?: string | null;
  onSignOut: () => Promise<void>;
};

export function UserMenu({ userEmail, avatarUrl, onSignOut }: UserMenuProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await onSignOut();
  };

  // メールアドレスからイニシャルを取得
  const getInitials = (email: string) => {
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* User Avatar Button */}
      <TouchableOpacity
        onPress={() => setIsMenuOpen(true)}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "#E86A30",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {avatarUrl && !imageError ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{
              width: 36,
              height: 36,
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#FFFFFF",
              fontFamily: "Inter",
            }}
          >
            {getInitials(userEmail)}
          </Text>
        )}
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
          onPress={() => setIsMenuOpen(false)}
        >
          <View
            style={{
              position: "absolute",
              top: 80,
              right: 20,
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 8,
              minWidth: 200,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {/* User Email */}
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: "#E8E6E1",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#1F1E1C",
                  fontFamily: "Inter",
                }}
              >
                {userEmail}
              </Text>
            </View>

            {/* Settings */}
            <TouchableOpacity
              onPress={() => {
                setIsMenuOpen(false);
                router.push("/settings");
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
              }}
            >
              <Settings size={18} color="#1F1E1C" />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#1F1E1C",
                  fontFamily: "Inter",
                }}
              >
                設定
              </Text>
            </TouchableOpacity>

            {/* Sign Out */}
            <TouchableOpacity
              onPress={handleSignOut}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
              }}
            >
              <LogOut size={18} color="#E86A30" />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#E86A30",
                  fontFamily: "Inter",
                }}
              >
                ログアウト
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
