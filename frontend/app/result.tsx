import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Button,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

export default function Result() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const data =
    params.data && typeof params.data === "string"
      ? JSON.parse(params.data)
      : null;

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>No analysis data available</Text>
        <Button title="Go Back" onPress={() => router.replace("/upload")} />
      </View>
    );
  }

  // ---------------- SCORE LOGIC ----------------
  const score =
    (data.visible_issues?.length === 0 ? 90 : 70) +
    (data.positive_aspects?.length || 0) * 2;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Skin Analysis</Text>

      {/* ================= SCORE CARD ================= */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreTitle}>Skin Health Score</Text>
        <Text style={styles.scoreValue}>{Math.min(score, 95)} / 100</Text>
        <Text style={styles.scoreHint}>
          Based on visible skin quality & care indicators
        </Text>
      </View>

      {/* ================= SKIN PROFILE ================= */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Skin Profile</Text>

        <Text style={styles.label}>Type</Text>
        <Text style={styles.value}>{data.skin_type || "Unknown"}</Text>

        {data.skin_tone && (
          <>
            <Text style={styles.label}>Tone</Text>
            <Text style={styles.value}>{data.skin_tone}</Text>
          </>
        )}

        {data.overall_condition && (
          <>
            <Text style={styles.label}>Overall Condition</Text>
            <Text style={styles.value}>{data.overall_condition}</Text>
          </>
        )}
      </View>

      {/* ================= INTERACTIVE SECTIONS ================= */}
      {data.positive_aspects?.length > 0 && (
        <ExpandableCard
          title="What's Looking Good"
          icon="✅"
          items={data.positive_aspects}
        />
      )}

      {data.visible_issues?.length > 0 && (
        <ExpandableCard
          title="Areas to Address"
          icon="⚠️"
          items={data.visible_issues}
        />
      )}

      {data.recommendations?.length > 0 && (
        <ExpandableCard
          title="Recommendations"
          icon="💡"
          items={data.recommendations}
        />
      )}

      {data.product_suggestions?.length > 0 && (
        <ExpandableCard
          title="Product Suggestions"
          icon="🛍️"
          items={data.product_suggestions}
        />
      )}

      {data.lifestyle_tips?.length > 0 && (
        <ExpandableCard
          title="Lifestyle Tips"
          icon="🌟"
          items={data.lifestyle_tips}
        />
      )}

      {/* ================= ERROR NOTE ================= */}
      {data.error_note && (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>ℹ️ {data.error_note}</Text>
        </View>
      )}

      {/* ================= ACTION ================= */}
      <View style={styles.buttonContainer}>
        <Button
          title="← Analyze Another Photo"
          onPress={() => router.replace("/upload")}
          color="#007AFF"
        />
      </View>
    </ScrollView>
  );
}

/* ================= EXPANDABLE CARD ================= */

function ExpandableCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: string[];
}) {
  const [open, setOpen] = useState(true);

  return (
    <View style={styles.card}>
      <Pressable onPress={() => setOpen(!open)}>
        <Text style={styles.cardTitle}>
          {icon} {title} {open ? "▲" : "▼"}
        </Text>
      </Pressable>

      {open &&
        items.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            • {item}
          </Text>
        ))}
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  scoreCard: {
    backgroundColor: "#E8F0FF",
    padding: 20,
    borderRadius: 14,
    marginBottom: 20,
    alignItems: "center",
  },
  scoreTitle: {
    fontSize: 16,
    color: "#555",
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#007AFF",
  },
  scoreHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    marginBottom: 2,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textTransform: "capitalize",
    marginBottom: 8,
  },
  listItem: {
    fontSize: 15,
    color: "#444",
    marginBottom: 8,
    lineHeight: 22,
  },
  warningCard: {
    backgroundColor: "#FFF3CD",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#FFE69C",
  },
  warningText: {
    fontSize: 12,
    color: "#856404",
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  error: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
});
