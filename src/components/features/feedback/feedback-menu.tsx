import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Linking,
} from "react-native";
import { EllipsisVertical, Bug, Lightbulb } from "lucide-react-native";

const GITHUB_REPO_URL = "https://github.com/unz47/Recipe-Book";

const MENU_ITEMS = [
  {
    label: "不具合を報告",
    icon: Bug,
    url: `${GITHUB_REPO_URL}/issues/new?template=bug_report.yml`,
  },
  {
    label: "新機能を提案",
    icon: Lightbulb,
    url: `${GITHUB_REPO_URL}/issues/new?template=feature_request.yml`,
  },
] as const;

export function FeedbackMenu() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} hitSlop={8}>
        <EllipsisVertical size={20} color="#8A8680" />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={() => setVisible(false)}
        >
          <View
            style={{
              position: "absolute",
              top: 60,
              right: 20,
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E8E6E1",
              paddingVertical: 4,
              minWidth: 180,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => {
                  setVisible(false);
                  Linking.openURL(item.url);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <item.icon size={16} color="#6B6862" />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#1F1E1C",
                    fontFamily: "Inter",
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
