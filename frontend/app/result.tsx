import { View, Text, ScrollView, StyleSheet, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function Result() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const data = params.data ? JSON.parse(params.data as string) : null;

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>No analysis data available</Text>
        <Button title="Go Back" onPress={() => router.replace("/upload")} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Skin Analysis</Text>

      {/* Skin Profile */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Skin Profile</Text>
        <Text style={styles.label}>Type:</Text>
        <Text style={styles.value}>{data.skin_type || "Unknown"}</Text>

        {data.skin_tone && (
          <>
            <Text style={styles.label}>Tone:</Text>
            <Text style={styles.value}>{data.skin_tone}</Text>
          </>
        )}

        {data.overall_condition && (
          <>
            <Text style={styles.label}>Overall Condition:</Text>
            <Text style={styles.value}>{data.overall_condition}</Text>
          </>
        )}
      </View>

      {/* Positive Aspects */}
      {data.positive_aspects && data.positive_aspects.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✅ Whats Looking Good</Text>
          {data.positive_aspects.map((item: string, index: number) => (
            <Text key={index} style={styles.listItem}>
              • {item}
            </Text>
          ))}
        </View>
      )}

      {/* Visible Issues */}
      {data.visible_issues && data.visible_issues.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚠️ Areas to Address</Text>
          {data.visible_issues.map((issue: string, index: number) => (
            <Text key={index} style={styles.listItem}>
              • {issue}
            </Text>
          ))}
        </View>
      )}

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 Recommendations</Text>
          {data.recommendations.map((rec: string, index: number) => (
            <Text key={index} style={styles.listItem}>
              • {rec}
            </Text>
          ))}
        </View>
      )}

      {/* Product Suggestions */}
      {data.product_suggestions && data.product_suggestions.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛍️ Product Suggestions</Text>
          {data.product_suggestions.map((product: string, index: number) => (
            <Text key={index} style={styles.listItem}>
              • {product}
            </Text>
          ))}
        </View>
      )}

      {/* Lifestyle Tips */}
      {data.lifestyle_tips && data.lifestyle_tips.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌟 Lifestyle Tips</Text>
          {data.lifestyle_tips.map((tip: string, index: number) => (
            <Text key={index} style={styles.listItem}>
              • {tip}
            </Text>
          ))}
        </View>
      )}

      {/* Error Note (if AI failed but fallback data shown) */}
      {data.error_note && (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>ℹ️ {data.error_note}</Text>
        </View>
      )}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 40,
    textAlign: "center",
    color: "#333",
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
  buttonContainer: {
    marginTop: 20,
    marginBottom: 50,
  },
  error: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
});