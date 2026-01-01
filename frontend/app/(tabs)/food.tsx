import { ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAnalysis } from "../../context/AnalysisContext";
import ProductCard from "../../components/ProductCard";

export default function Food() {
  const { analysis } = useAnalysis();

  const eatMore: string[] = analysis?.food?.eat_more ?? [];
  const limit: string[] = analysis?.food?.limit ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Food & Nutrition</Text>
        <Text style={styles.subtitle}>
          Diet directly impacts skin clarity and oil balance
        </Text>

        {/* EAT MORE */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🥗 Eat More</Text>
          {eatMore.length > 0 ? (
            eatMore.map((item, i) => (
              <Text key={i} style={styles.item}>• {item}</Text>
            ))
          ) : (
            <Text style={styles.muted}>No suggestions</Text>
          )}
        </View>

        {/* LIMIT */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚫 Limit</Text>
          {limit.length > 0 ? (
            limit.map((item, i) => (
              <Text key={i} style={styles.item}>• {item}</Text>
            ))
          ) : (
            <Text style={styles.muted}>No restrictions</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>🛒 Recommended Products</Text>

        <ProductCard
          title="Organic Green Tea (Antioxidants)"
          price="₹299"
          image="https://m.media-amazon.com/images/I/71d5yF2bYXL._SL1500_.jpg"
          link="https://www.amazon.in/"
        />

        <ProductCard
          title="Raw Walnuts – Omega 3"
          price="₹499"
          image="https://m.media-amazon.com/images/I/81Fz6nM6J-L._SL1500_.jpg"
          link="https://www.flipkart.com/"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7FB" },
  container: { padding: 16 },
  pageTitle: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 6 },
  item: { fontSize: 14, marginBottom: 4 },
  muted: { color: "#aaa" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
});
