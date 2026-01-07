import { Stack, Redirect, usePathname } from "expo-router";
import { AnalysisProvider, useAnalysis } from "../context/AnalysisContext";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

function RootStack() {
  const { loading, user } = useAnalysis();
  const pathname = usePathname();

  const [onboardingComplete, setOnboardingComplete] =
    useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await AsyncStorage.getItem("@onboarding_complete");
      setOnboardingComplete(completed === "true");
    };
    checkOnboarding();
  }, []);

  if (loading || onboardingComplete === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
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
  return (
    <AnalysisProvider>
      <RootStack />
    </AnalysisProvider>
  );
}
