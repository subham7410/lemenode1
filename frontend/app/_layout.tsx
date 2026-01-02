import { Stack, useRouter, useSegments } from "expo-router";
import { AnalysisProvider, useAnalysis } from "../context/AnalysisContext";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

function RootStack() {
  const { loading } = useAnalysis();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function checkOnboarding() {
      const completed = await AsyncStorage.getItem("@onboarding_complete");
      setOnboardingComplete(completed === "true");
    }
    checkOnboarding();
  }, []);

  useEffect(() => {
  if (loading || onboardingComplete === null) return;

  const currentRoute = segments[0];
  const inOnboarding = currentRoute === "onboarding";
  const inTabs = currentRoute === "(tabs)";

  // 🔒 Force onboarding if NOT completed
  if (!onboardingComplete && !inOnboarding) {
    router.replace("/onboarding");
    return;
  }

  // 🚪 Exit onboarding forever once completed
  if (onboardingComplete && inOnboarding) {
    router.replace("/(tabs)");
    return;
  }
}, [onboardingComplete, segments, loading]);


  if (loading || onboardingComplete === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="loading" />
      <Stack.Screen name="result" options={{ presentation: "modal" }} />
      <Stack.Screen name="user-info" />
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