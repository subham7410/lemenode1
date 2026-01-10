/**
 * Tabs Layout - Styled with Lemenode Design System
 */

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, StyleSheet, Platform } from "react-native";
import { colors, radius, shadows } from "../../theme";

function TabBarIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const iconName = focused ? name : `${name}-outline`;
  return <Ionicons name={iconName as any} size={22} color={color} />;
}

function TabsContent() {
  const insets = useSafeAreaInsets();

  // Calculate proper tab bar height with safe area
  const tabBarHeight = 60 + Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarStyle: {
          backgroundColor: colors.neutral[0],
          borderTopWidth: 0,
          elevation: 0,
          height: tabBarHeight,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 8,
          ...shadows.top,
        },
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="upload"
        options={{
          title: "Scan",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="scan" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: "Food",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="nutrition" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: "Tips",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="heart" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="style"
        options={{
          title: "Style",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="shirt" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Me",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="person" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabsLayout() {
  return (
    <SafeAreaProvider>
      <TabsContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBarItem: {
    paddingTop: 4,
    minWidth: 60,
  },
  tabBarLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
    textAlign: "center",
  },
  iconContainer: {
    width: 36,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  iconContainerActive: {
    backgroundColor: colors.primary[100],
  },
});
