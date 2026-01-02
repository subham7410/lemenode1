import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAnalysis } from "../context/AnalysisContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Result() {
  const { analysis } = useAnalysis();
  const router = useRouter();

  if (!analysis) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Ionicons name="sad-outline" size={64} color="#999" />
          <Text style={styles.emptyText}>No analysis available</Text>
          <Pressable
            style={styles.button}
            onPress={() => router.replace("/(tabs)/upload")}
          >
            <Text style={styles.buttonText}>Upload Photo</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const score = analysis.score ?? 70;
  
  const getScoreColor = (s: number) => {
    if (s >= 85) return "#10B981";
    if (s >= 75) return "#3B82F6";
    if (s >= 65) return "#F59E0B";
    return "#EF4444";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 85) return "Excellent";
    if (s >= 75) return "Good";
    if (s >= 65) return "Fair";
    return "Needs Care";
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={28} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Analysis Result</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Score Circle */}
        <View style={styles.scoreSection}>
          <View
            style={[
              styles.scoreCircle,
              { borderColor: getScoreColor(score) },
            ]}
          >
            <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>
              {score}
            </Text>
            <Text style={styles.scoreSub}>out of 100</Text>
          </View>
          <Text style={[styles.scoreLabel, { color: getScoreColor(score) }]}>
            {getScoreLabel(score)}
          </Text>
        </View>

        {/* Skin Info */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Skin Type</Text>
            <Text style={styles.infoValue}>
              {analysis.skin_type || "Unknown"}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Skin Tone</Text>
            <Text style={styles.infoValue}>
              {analysis.skin_tone || "Unknown"}
            </Text>
          </View>
        </View>

        {/* Issues & Positives */}
        {analysis.visible_issues && analysis.visible_issues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 Observations</Text>
            <View style={styles.card}>
              {analysis.visible_issues.map((issue, i) => (
                <Text key={i} style={styles.issueItem}>
                  • {issue}
                </Text>
              ))}
            </View>
          </View>
        )}

        {analysis.positive_aspects && analysis.positive_aspects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Positive Aspects</Text>
            <View style={[styles.card, styles.positiveCard]}>
              {analysis.positive_aspects.map((item, i) => (
                <Text key={i} style={styles.positiveItem}>
                  ✓ {item}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Quick Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Top Recommendations</Text>
            <View style={styles.card}>
              {analysis.recommendations.slice(0, 4).map((rec, i) => (
                <Text key={i} style={styles.recItem}>
                  {i + 1}. {rec}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => router.push("/(tabs)/health")}
          >
            <Ionicons name="heart" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>View Health Tips</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={() => router.push("/(tabs)/food")}
          >
            <Ionicons name="restaurant" size={20} color="#4F46E5" />
            <Text style={styles.secondaryActionText}>Food Guide</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.newAnalysisButton}
          onPress={() => router.replace("/(tabs)/upload")}
        >
          <Text style={styles.newAnalysisText}>Start New Analysis</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  scoreSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 56,
    fontWeight: "800",
  },
  scoreSub: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  scoreLabel: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    textTransform: "capitalize",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
  },
  issueItem: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    lineHeight: 20,
  },
  positiveCard: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  positiveItem: {
    fontSize: 14,
    color: "#166534",
    marginBottom: 8,
    lineHeight: 20,
  },
  recItem: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 10,
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
    marginTop: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  primaryAction: {
    backgroundColor: "#4F46E5",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryAction: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#4F46E5",
  },
  secondaryActionText: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "700",
  },
  newAnalysisButton: {
    alignItems: "center",
    paddingVertical: 14,
  },
  newAnalysisText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});