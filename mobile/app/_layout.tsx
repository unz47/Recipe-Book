import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { initializeRevenueCat } from "@/infrastructure/services/revenue-cat";

import "../global.css";

export default function RootLayout() {
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FAFAF8" },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="recipes/[id]/edit"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
    </>
  );
}
