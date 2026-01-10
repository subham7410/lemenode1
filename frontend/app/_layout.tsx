import { Stack, Redirect, usePathname } from "expo-router";
import { AnalysisProvider, useAnalysis } from "../context/AnalysisContext";
import { View, ActivityIndicator } from "react-native";
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

// Keep splash visible while loading - ignore errors
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
  const [appReady, setAppReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function prepare() {
      try {
        // Try to load fonts but don't block on failure
        await Font.loadAsync({
          Inter_400Regular,
          Inter_500Medium,
          Inter_600SemiBold,
          Inter_700Bold,
          Inter_900Black,
        }).catch((e) => {
          console.warn("Font loading failed:", e);
        });
      } catch (e) {
        console.warn("Prepare error:", e);
        if (isMounted) {
          setError(String(e));
        }
      } finally {
        if (isMounted) {
          setAppReady(true);
        }
      }
    }

    // Add a timeout to ensure app becomes ready even if fonts hang
    const timeout = setTimeout(() => {
      if (isMounted && !appReady) {
        console.warn("Font loading timed out, proceeding...");
        setAppReady(true);
      }
    }, 5000);

    prepare();

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  // Hide splash when ready
  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [appReady]);

  // Show nothing while loading - native splash is visible
  if (!appReady) {
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
