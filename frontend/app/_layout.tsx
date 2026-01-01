import { Stack } from "expo-router";
import { AnalysisProvider, useAnalysis } from "../context/AnalysisContext";
import { View, ActivityIndicator } from "react-native";

function RootStack() {
  const { loading } = useAnalysis();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="loading" />
      <Stack.Screen
        name="result"
        options={{ presentation: "modal" }}
      />
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
