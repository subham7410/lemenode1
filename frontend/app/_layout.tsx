import { Stack, Redirect, usePathname } from "expo-router";
import { AnalysisProvider, useAnalysis } from "../context/AnalysisContext";
import { View, ActivityIndicator, Text } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
} from "@expo-google-fonts/inter";

// Keep splash visible while loading
SplashScreen.preventAutoHideAsync().catch(() => { });

function RootStack() {
  const { loading, user } = useAnalysis();
  const pathname = usePathname();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("@onboarding_complete")
      .then((completed) => setOnboardingComplete(completed === "true"))
      .catch(() => setOnboardingComplete(false));
  }, []);

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
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          Inter_400Regular,
          Inter_500Medium,
          Inter_600SemiBold,
          Inter_700Bold,
          Inter_900Black,
        });
      } catch (e) {
        console.warn("Font loading error:", e);
        // Continue anyway - app will use system fonts
      } finally {
        // Mark app as ready regardless of font loading result
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appReady) {
      // Hide splash when ready
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [appReady]);

  if (!appReady) {
    // Return null while loading - splash screen is still visible
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <AnalysisProvider>
        <RootStack />
      </AnalysisProvider>
    </View>
  );
}
