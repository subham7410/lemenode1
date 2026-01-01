import { ActivityIndicator, Text, View } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Loading() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push("/result");
    }, 2000);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
      <View>
        <ActivityIndicator size="large" />
        <Text style={{ textAlign: "center", marginTop: 12 }}>
          Analyzing your photo...
        </Text>
      </View>
    </SafeAreaView>
  );
}
