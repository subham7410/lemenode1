import { Stack } from "expo-router";
import { AnalysisProvider } from "../context/AnalysisContext";
import { View } from "react-native";
import { useEffect, useState } from "react";
import * as Font from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
} from "@expo-google-fonts/inter";

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Load fonts in background - don't block rendering
    Font.loadAsync({
      Inter_400Regular,
      Inter_500Medium,
      Inter_600SemiBold,
      Inter_700Bold,
      Inter_900Black,
    })
      .then(() => setFontsLoaded(true))
      .catch(() => setFontsLoaded(true)); // Continue even if fonts fail

    // Fallback - set fonts loaded after 3 seconds no matter what
    const timeout = setTimeout(() => setFontsLoaded(true), 3000);
    return () => clearTimeout(timeout);
  }, []);

  // Always render - navigation logic is in index.tsx
  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <AnalysisProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="user-info" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="result" options={{ presentation: "modal" }} />
        </Stack>
      </AnalysisProvider>
    </View>
  );
}
