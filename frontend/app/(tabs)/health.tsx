import { ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAnalysis } from "../../context/AnalysisContext";

export default function Health() {
  const { analysis } = useAnalysis();

  const dailyHabits = analysis?.health?.daily_habits ?? [];
  const routine = analysis?.health?.routine ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Health & Skin Care</Text>
        <Text style={styles.subtitle}>
          Personalized habits to improve your skin over time
        </Text>

        {/* DAILY HABITS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌿 Daily Habits</Text>
          <Text style={styles.cardDesc}>
            Small daily changes that make a big difference
          </Text>

          {dailyHabits.length > 0 ? (
            dailyHabits.map((item: string, i: number) => (
              <Text key={i} style={styles.item}>• {item}</Text>
            ))
          ) : (
            <Text style={styles.muted}>No habits available yet</Text>
          )}
        </View>

        {/* ROUTINE */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧴 Skin Care Routine</Text>
          <Text style={styles.cardDesc}>
            Follow this routine consistently for best results
          </Text>

          {routine.length > 0 ? (
            routine.map((item: string, i: number) => (
              <Text key={i} style={styles.item}>• {item}</Text>
            ))
          ) : (
            <Text style={styles.muted}>Routine will appear after analysis</Text>
          )}
        </View>

        {/* EDUCATION */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Why this matters</Text>
          <Text style={styles.infoText}>
            Skin improvement is not instant. Following these habits for
            2–4 weeks will noticeably improve texture, oil balance, and clarity.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7FB" },
  container: { padding: 16 },
  pageTitle: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 16 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  cardDesc: { fontSize: 13, color: "#777", marginBottom: 10 },
  item: { fontSize: 14, marginBottom: 6 },

  muted: { fontSize: 13, color: "#aaa" },

  infoCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 14,
    padding: 16,
  },
  infoTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  infoText: { fontSize: 14, color: "#444" },
});
