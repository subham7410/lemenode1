import { Stack, Redirect, usePathname } from "expo-router";
import { AnalysisProvider, useAnalysis } from "../context/AnalysisContext";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
} from "@expo-google-fonts/inter";

// NOTE: Removed all SplashScreen API calls - let Expo handle it automatically

function RootStack() {
  const { loading, user } = useAnalysis();
  const pathname = usePathname();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("@onboarding_complete")
      .then((completed) => setOnboardingComplete(completed === "true"))
      .catch(() => setOnboardingComplete(false));
  }, []);

  // Show loading while checking state
  if (loading || onboardingComplete === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FAFAFA" }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  // First launch → onboarding
  if (!onboardingComplete && pathname !== "/onboarding") {
    return <Redirect href="/onboarding" />;
  }

  // Profile incomplete → user-info
  const profileIncomplete = !user.age || !user.gender || !user.height || !user.weight || !user.diet;
  if (onboardingComplete && profileIncomplete && pathname !== "/user-info") {
    return <Redirect href="/user-info" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="user-info" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="result" options={{ presentation: "modal" }} />
    </Stack>
  );
}

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

  // Always render the app - don't return null
  // This allows the native splash to hide automatically
  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <AnalysisProvider>
        <RootStack />
      </AnalysisProvider>
    </View>
  );
}
