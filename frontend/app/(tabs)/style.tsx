import { ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAnalysis } from "../../context/AnalysisContext";
import ProductCard from "../../components/ProductCard";

export default function Style() {
  const { analysis } = useAnalysis();

  const clothing: string[] = analysis?.style?.clothing ?? [];
  const accessories: string[] = analysis?.style?.accessories ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Style Guide</Text>
        <Text style={styles.subtitle}>
          Looks that complement your skin tone and features
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>👕 Clothing</Text>
          {clothing.length > 0 ? (
            clothing.map((item, i) => (
              <Text key={i} style={styles.item}>• {item}</Text>
            ))
          ) : (
            <Text style={styles.muted}>No clothing tips</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⌚ Accessories</Text>
          {accessories.length > 0 ? (
            accessories.map((item, i) => (
              <Text key={i} style={styles.item}>• {item}</Text>
            ))
          ) : (
            <Text style={styles.muted}>No accessory tips</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>🛍️ Style Picks</Text>

        <ProductCard
          title="UV Protection Sunglasses"
          price="₹699"
          image="https://m.media-amazon.com/images/I/61Hf8w5gPBL._SL1500_.jpg"
          link="https://www.amazon.in/"
        />

        <ProductCard
          title="Minimal Analog Watch"
          price="₹1,299"
          image="https://m.media-amazon.com/images/I/71qv0xFzHCL._SL1500_.jpg"
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
