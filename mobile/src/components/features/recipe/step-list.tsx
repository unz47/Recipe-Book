import { View, Text } from "react-native";

import type { Step } from "@/domain/entities/recipe";

type StepListProps = {
  steps: Step[];
};

export function StepList({ steps }: StepListProps) {
  return (
    <View style={{ gap: 16 }}>
      {steps.map((step) => (
        <View
          key={step.stepNumber}
          style={{ flexDirection: "row", gap: 14 }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: "#E86A30",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#FFFFFF",
                fontFamily: "Inter",
              }}
            >
              {step.stepNumber}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                lineHeight: 22.4,
                color: "#1F1E1C",
                fontFamily: "Inter",
              }}
            >
              {step.text}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
