import { Stack } from "expo-router";
import { AnalysisProvider } from "../context/AnalysisContext";
import { AuthProvider } from "../context/AuthContext";
import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import * as Font from "expo-font";
import * as Updates from "expo-updates";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
} from "@expo-google-fonts/inter";

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Check for updates on launch
    async function checkForUpdates() {
      if (__DEV__) return; // Skip in development

      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          setIsUpdating(true);
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync(); // Restart app with new update
        }
      } catch (e) {
        // Update check failed, continue with current version
        console.log("Update check failed:", e);
      }
    }

    checkForUpdates();
  }, []);

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

  // Show updating screen if downloading update
  if (isUpdating) {
    return (
      <View style={styles.updateContainer}>
        <Text style={styles.updateText}>Updating app...</Text>
        <Text style={styles.updateSubtext}>Please wait a moment</Text>
      </View>
    );
  }

  // Wrap with AuthProvider for authentication state
  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <AuthProvider>
        <AnalysisProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="user-info" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="profile" options={{ presentation: "modal" }} />
            <Stack.Screen name="result" options={{ presentation: "modal" }} />
          </Stack>
        </AnalysisProvider>
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  updateContainer: {
    flex: 1,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  updateText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  updateSubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
});
