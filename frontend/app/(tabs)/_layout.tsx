import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function TabsLayout() {
  return (
    <SafeAreaProvider>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="upload"
          options={{
            title: "Upload",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cloud-upload" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="food"
          options={{
            title: "Food",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="restaurant" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="health"
          options={{
            title: "Health",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="style"
          options={{
            title: "Style",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="shirt" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
