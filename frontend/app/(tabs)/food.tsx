import { ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAnalysis } from "../../context/AnalysisContext";
import ProductCard from "../../components/ProductCard";
import { Ionicons } from "@expo/vector-icons";

export default function Food() {
  const { analysis } = useAnalysis();

  const eatMore: string[] = analysis?.food?.eat_more ?? [];
  const limit: string[] = analysis?.food?.limit ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={["#10B981", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerIcon}>
            <Ionicons name="nutrition" size={32} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Nutrition Guide</Text>
          <Text style={styles.headerSubtitle}>
            Personalized diet for glowing skin
          </Text>
        </LinearGradient>

        {/* Eat More Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Foods to Embrace</Text>
              <Text style={styles.sectionSubtitle}>
                Boost your skin health naturally
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            {eatMore.length > 0 ? (
              eatMore.map((item, i) => (
                <View key={i} style={styles.foodItem}>
                  <View style={styles.bulletGreen}>
                    <View style={styles.bulletInner} />
                  </View>
                  <Text style={styles.foodText}>{item}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="leaf-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>
                  Complete your analysis for personalized recommendations
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Limit Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBadge, styles.iconBadgeRed]}>
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Foods to Limit</Text>
              <Text style={styles.sectionSubtitle}>
                Reduce for clearer, healthier skin
              </Text>
            </View>
          </View>

          <View style={[styles.card, styles.cardRed]}>
            {limit.length > 0 ? (
              limit.map((item, i) => (
                <View key={i} style={styles.foodItem}>
                  <View style={styles.bulletRed}>
                    <View style={styles.bulletInnerRed} />
                  </View>
                  <Text style={styles.foodText}>{item}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="fast-food-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>
                  Get analysis for specific foods to avoid
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Did you know?</Text>
            <Text style={styles.infoText}>
              What you eat affects your skin within 2-4 weeks. Consistency is key for visible results!
            </Text>
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <View style={styles.productHeader}>
            <Ionicons name="cart" size={24} color="#111827" />
            <Text style={styles.productsTitle}>Recommended Products</Text>
          </View>
          <Text style={styles.productsSubtitle}>
            Premium quality, skin-friendly nutrition
          </Text>

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

          <ProductCard
            title="Organic Chia Seeds"
            price="₹349"
            image="https://m.media-amazon.com/images/I/71S8VYTYAPL._SL1500_.jpg"
            link="https://www.amazon.in/"
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: "#F9FAFB" 
  },
  container: { 
    paddingBottom: 20 
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconBadgeRed: {
    backgroundColor: "#FEE2E2",
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardRed: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FEF3C7",
  },
  foodItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  bulletGreen: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  bulletInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
  bulletRed: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  bulletInnerRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
  },
  foodText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 12,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 18,
  },
  productsSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  productsTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 8,
  },
  productsSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
});