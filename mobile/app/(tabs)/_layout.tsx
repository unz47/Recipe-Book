import { View, Text, TouchableOpacity } from "react-native";
import { Tabs } from "expo-router";
import { CommonActions } from "@react-navigation/native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { House, BookOpen, ShoppingCart } from "lucide-react-native";

const TAB_CONFIG = [
  { icon: House, label: "HOME" },
  { icon: BookOpen, label: "RECIPES" },
  { icon: ShoppingCart, label: "LIST" },
] as const;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    // Level 1: Tab Bar Container — 83px, padding [12, 21, 21, 21], transparent
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 83,
        paddingTop: 12,
        paddingRight: 21,
        paddingBottom: 21,
        paddingLeft: 21,
        backgroundColor: "transparent",
      }}
    >
      {/* Level 2: Tab Pill — 62px, cornerRadius 36, white, #E8E6E1 1px inside stroke, padding 4 */}
      <View
        style={{
          flex: 1,
          height: 62,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          borderRadius: 36,
          borderWidth: 1,
          borderColor: "#E8E6E1",
          padding: 4,
        }}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const config = TAB_CONFIG[index];
          const Icon = config.icon;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              if (focused) {
                navigation.dispatch(
                  CommonActions.navigate({
                    name: route.name,
                    params: { screen: undefined },
                  })
                );
              } else {
                navigation.navigate(route.name);
              }
            }
          };

          return (
            // Level 3: Tab Item — fill 1/3, 54px tall, cornerRadius 26
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={{
                flex: 1,
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                borderRadius: 26,
                backgroundColor: focused ? "#E86A30" : "transparent",
              }}
            >
              {/* Level 4: Icon 18px */}
              <Icon
                size={18}
                color={focused ? "#FFFFFF" : "#B0ACA3"}
              />
              {/* Level 4: Label */}
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  letterSpacing: 0.5,
                  color: focused ? "#FFFFFF" : "#B0ACA3",
                  fontFamily: "Inter",
                }}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="recipes" />
      <Tabs.Screen name="shopping" />
    </Tabs>
  );
}
