import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAnalysis } from "../context/AnalysisContext";
import { useRouter } from "expo-router";

export default function Result() {
  const { analysis } = useAnalysis();
  const router = useRouter();

  if (!analysis) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Skin Score</Text>

        <View style={styles.scoreCircle}>
          <Text style={styles.scoreText}>{analysis.score ?? "--"}</Text>
          <Text style={styles.scoreSub}>out of 100</Text>
        </View>

        <Text style={styles.desc}>
          This score reflects your current skin condition based on AI analysis.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.replace("/(tabs)/health")}
        >
          <Text style={styles.buttonText}>View Recommendations</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7FB" },
  container: { flex: 1, alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },

  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreText: { fontSize: 48, fontWeight: "700", color: "#fff" },
  scoreSub: { color: "#E0E7FF" },

  desc: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },

  button: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
