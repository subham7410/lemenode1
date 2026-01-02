import { ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAnalysis } from "../../context/AnalysisContext";
import ProductCard from "../../components/ProductCard";
import { Ionicons } from "@expo/vector-icons";

export default function Style() {
  const { analysis } = useAnalysis();

  const clothing: string[] = analysis?.style?.clothing ?? [];
  const accessories: string[] = analysis?.style?.accessories ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={["#8B5CF6", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerIcon}>
            <Ionicons name="shirt" size={32} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Style Guide</Text>
          <Text style={styles.headerSubtitle}>
            Complement your natural beauty
          </Text>
        </LinearGradient>

        {/* Clothing Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconBadge}>
              <Ionicons name="shirt-outline" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Clothing Recommendations</Text>
              <Text style={styles.sectionSubtitle}>
                Colors and fabrics that enhance your look
              </Text>
            </View>
          </View>

          {clothing.length > 0 ? (
            <View style={styles.itemsGrid}>
              {clothing.map((item, i) => (
                <View key={i} style={styles.styleCard}>
                  <LinearGradient
                    colors={["#F3E8FF", "#EDE9FE"]}
                    style={styles.styleCardGradient}
                  >
                    <View style={styles.styleIcon}>
                      <Ionicons name="color-palette" size={24} color="#8B5CF6" />
                    </View>
                    <Text style={styles.styleText}>{item}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="shirt-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                Get personalized clothing recommendations
              </Text>
            </View>
          )}
        </View>

        {/* Accessories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBadge, styles.iconBadgePink]}>
              <Ionicons name="watch-outline" size={24} color="#EC4899" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Accessories</Text>
              <Text style={styles.sectionSubtitle}>
                Complete your look with the right accents
              </Text>
            </View>
          </View>

          {accessories.length > 0 ? (
            <View style={styles.itemsGrid}>
              {accessories.map((item, i) => (
                <View key={i} style={styles.styleCard}>
                  <LinearGradient
                    colors={["#FCE7F3", "#FBE7F3"]}
                    style={styles.styleCardGradient}
                  >
                    <View style={[styles.styleIcon, styles.styleIconPink]}>
                      <Ionicons name="sparkles" size={24} color="#EC4899" />
                    </View>
                    <Text style={styles.styleText}>{item}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="watch-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                Discover accessory recommendations for you
              </Text>
            </View>
          )}
        </View>

        {/* Color Palette Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBadge, styles.iconBadgeBlue]}>
              <Ionicons name="color-filter" size={24} color="#3B82F6" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Your Color Palette</Text>
              <Text style={styles.sectionSubtitle}>
                Based on your skin tone analysis
              </Text>
            </View>
          </View>

          <View style={styles.colorPalette}>
            <View style={styles.colorGroup}>
              <Text style={styles.colorLabel}>Best Colors</Text>
              <View style={styles.colorRow}>
                <View style={[styles.colorSwatch, { backgroundColor: "#10B981" }]} />
                <View style={[styles.colorSwatch, { backgroundColor: "#3B82F6" }]} />
                <View style={[styles.colorSwatch, { backgroundColor: "#8B5CF6" }]} />
                <View style={[styles.colorSwatch, { backgroundColor: "#EC4899" }]} />
              </View>
            </View>
            <View style={styles.colorGroup}>
              <Text style={styles.colorLabel}>Avoid</Text>
              <View style={styles.colorRow}>
                <View style={[styles.colorSwatch, { backgroundColor: "#6B7280" }]} />
                <View style={[styles.colorSwatch, { backgroundColor: "#78716C" }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="star" size={24} color="#8B5CF6" />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Style Tip</Text>
            <Text style={styles.infoText}>
              The right colors and fabrics can enhance your natural skin tone and make you look more radiant and confident!
            </Text>
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <View style={styles.productHeader}>
            <Ionicons name="bag-handle" size={24} color="#111827" />
            <Text style={styles.productsTitle}>Style Essentials</Text>
          </View>
          <Text style={styles.productsSubtitle}>
            Curated picks for your wardrobe
          </Text>

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

          <ProductCard
            title="Silk Hair Scrunchies Set"
            price="₹449"
            image="https://m.media-amazon.com/images/I/71vL8zP4cSL._SL1500_.jpg"
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
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconBadgePink: {
    backgroundColor: "#FCE7F3",
  },
  iconBadgeBlue: {
    backgroundColor: "#DBEAFE",
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
  itemsGrid: {
    gap: 12,
  },
  styleCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  styleCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  styleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  styleIconPink: {
    backgroundColor: "#fff",
  },
  styleText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  colorPalette: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  colorGroup: {
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
  },
  colorSwatch: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 12,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#F5F3FF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#5B21B6",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#5B21B6",
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