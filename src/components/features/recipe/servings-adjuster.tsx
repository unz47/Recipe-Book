import { View, Text, TouchableOpacity } from "react-native";
import { Minus, Plus } from "lucide-react-native";

type ServingsAdjusterProps = {
  servings: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

export function ServingsAdjuster({
  servings,
  onDecrease,
  onIncrease,
}: ServingsAdjusterProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: "#1F1E1C",
          fontFamily: "Inter",
        }}
      >
        人数
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
        }}
      >
        <TouchableOpacity
          onPress={onDecrease}
          disabled={servings <= 1}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#E8E6E1",
            alignItems: "center",
            justifyContent: "center",
            opacity: servings <= 1 ? 0.4 : 1,
          }}
        >
          <Minus size={16} color="#1F1E1C" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#1F1E1C",
            fontFamily: "Inter",
            minWidth: 60,
            textAlign: "center",
          }}
        >
          {servings}人前
        </Text>
        <TouchableOpacity
          onPress={onIncrease}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#E86A30",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
