import { Stack, Redirect, usePathname } from "expo-router";
import { AnalysisProvider, useAnalysis } from "../context/AnalysisContext";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import { colors } from "../theme";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore errors if splash screen is already hidden
});

function RootStack() {
  const { loading, user } = useAnalysis();
  const pathname = usePathname();

  const [onboardingComplete, setOnboardingComplete] =
    useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem("@onboarding_complete");
        setOnboardingComplete(completed === "true");
      } catch (e) {
        // If error, assume not completed
        setOnboardingComplete(false);
      }
    };
    checkOnboarding();
  }, []);

  if (loading || onboardingComplete === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background.primary }}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  // 1️⃣ First launch → onboarding
  if (!onboardingComplete && pathname !== "/onboarding") {
    return <Redirect href="/onboarding" />;
  }

  // 2️⃣ Profile incomplete → user-info (ALLOW user-info to render)
  const profileIncomplete =
    !user.age || !user.gender || !user.height || !user.weight || !user.diet;

  if (
    onboardingComplete &&
    profileIncomplete &&
    pathname !== "/user-info"
  ) {
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
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
  });

  // Hide splash screen once fonts are loaded OR if there's an error
  useEffect(() => {
    const hideSplash = async () => {
      if (fontsLoaded || fontError) {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          // Ignore errors
        }
      }
    };
    hideSplash();
  }, [fontsLoaded, fontError]);

  // Show loading until fonts are ready
  // If font loading fails, proceed anyway (system fonts will be used)
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FAFAFA" }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AnalysisProvider>
        <RootStack />
      </AnalysisProvider>
    </View>
  );
}
