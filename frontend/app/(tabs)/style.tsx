/**
 * Style Screen - Redesigned with Lemenode Design System
 * Fashion and accessory recommendations with visual color palette
 */

import { ScrollView, Text, View, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAnalysis } from "../../context/AnalysisContext";
import ProductCard from "../../components/ProductCard";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  colors,
  textStyles,
  spacing,
  layout,
  radius,
  shadows,
} from "../../theme";

// Style recommendation card
interface StyleCardProps {
  item: string;
  type: "clothing" | "accessory";
  index: number;
}

function StyleCard({ item, type, index }: StyleCardProps) {
  const isClothing = type === "clothing";
  const iconName = isClothing ? "shirt-outline" : "diamond-outline";
  const gradientColors = isClothing
    ? ["#F3E8FF", "#EDE9FE"] as const
    : ["#FCE7F3", "#FBE7F3"] as const;
  const iconColor = isClothing ? "#8B5CF6" : "#EC4899";

  return (
    <View style={styles.styleCard}>
      <LinearGradient
        colors={gradientColors}
        style={styles.styleCardGradient}
      >
        <View style={[styles.styleIcon, { backgroundColor: colors.neutral[0] }]}>
          <Ionicons name={iconName} size={22} color={iconColor} />
        </View>
        <Text style={styles.styleText}>{item}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
      </LinearGradient>
    </View>
  );
}

// Color swatch with label
interface ColorSwatchProps {
  color: string;
  name: string;
  recommended: boolean;
}

function ColorSwatch({ color, name, recommended }: ColorSwatchProps) {
  return (
    <View style={styles.colorSwatchContainer}>
      <View style={[styles.colorSwatch, { backgroundColor: color }]}>
        {recommended && (
          <View style={styles.swatchBadge}>
            <Ionicons name="checkmark" size={12} color={colors.neutral[0]} />
          </View>
        )}
      </View>
      <Text style={styles.colorName}>{name}</Text>
    </View>
  );
}

// Empty state component
function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon as any} size={40} color={colors.neutral[300]} />
      </View>
      <Text style={styles.emptyText}>{message}</Text>
      <Text style={styles.emptyHint}>Complete your skin analysis to get personalized style tips</Text>
    </View>
  );
}

export default function Style() {
  const { analysis } = useAnalysis();
  const [activeTab, setActiveTab] = useState<"clothing" | "accessories">("clothing");

  const clothing: string[] = analysis?.style?.clothing ?? [];
  const accessories: string[] = analysis?.style?.accessories ?? [];
  const hasData = clothing.length > 0 || accessories.length > 0;

  // Get skin tone from analysis
  const skinTone = analysis?.skin_tone?.toLowerCase() || "";

  // Dynamic color palettes based on skin tone
  const getColorPalette = () => {
    // Fair/Light skin tones
    if (skinTone.includes("fair") || skinTone.includes("light") || skinTone.includes("pale")) {
      return {
        recommended: [
          { color: "#E11D48", name: "Rose" },
          { color: "#7C3AED", name: "Violet" },
          { color: "#0EA5E9", name: "Sky Blue" },
          { color: "#10B981", name: "Emerald" },
          { color: "#EC4899", name: "Pink" },
        ],
        avoid: [
          { color: "#FEF3C7", name: "Pale Yellow" },
          { color: "#FED7AA", name: "Peach" },
        ],
      };
    }

    // Medium/Olive skin tones
    if (skinTone.includes("medium") || skinTone.includes("olive") || skinTone.includes("wheat")) {
      return {
        recommended: [
          { color: "#059669", name: "Jade" },
          { color: "#7C3AED", name: "Purple" },
          { color: "#DC2626", name: "Red" },
          { color: "#0284C7", name: "Ocean" },
          { color: "#F59E0B", name: "Amber" },
        ],
        avoid: [
          { color: "#9CA3AF", name: "Gray" },
          { color: "#D4D4D8", name: "Silver" },
        ],
      };
    }

    // Tan/Brown skin tones
    if (skinTone.includes("tan") || skinTone.includes("brown") || skinTone.includes("caramel")) {
      return {
        recommended: [
          { color: "#F97316", name: "Orange" },
          { color: "#FBBF24", name: "Gold" },
          { color: "#059669", name: "Teal" },
          { color: "#E11D48", name: "Coral" },
          { color: "#FFFFFF", name: "White" },
        ],
        avoid: [
          { color: "#78716C", name: "Brown" },
          { color: "#A8A29E", name: "Khaki" },
        ],
      };
    }

    // Deep/Dark skin tones
    if (skinTone.includes("deep") || skinTone.includes("dark") || skinTone.includes("ebony")) {
      return {
        recommended: [
          { color: "#FBBF24", name: "Gold" },
          { color: "#F97316", name: "Tangerine" },
          { color: "#EC4899", name: "Fuchsia" },
          { color: "#22D3EE", name: "Cyan" },
          { color: "#FFFFFF", name: "White" },
        ],
        avoid: [
          { color: "#1F2937", name: "Black" },
          { color: "#374151", name: "Charcoal" },
        ],
      };
    }

    // Default palette (if skin tone not detected)
    return {
      recommended: [
        { color: "#10B981", name: "Emerald" },
        { color: "#3B82F6", name: "Royal Blue" },
        { color: "#8B5CF6", name: "Purple" },
        { color: "#EC4899", name: "Pink" },
        { color: "#F59E0B", name: "Gold" },
      ],
      avoid: [
        { color: "#6B7280", name: "Gray" },
        { color: "#78716C", name: "Stone" },
      ],
    };
  };

  const colorPalette = getColorPalette();
  const recommendedColors = colorPalette.recommended;
  const avoidColors = colorPalette.avoid;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Header */}
        <LinearGradient
          colors={["#1a1a2e", "#16213e", "#0f3460"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>👔</Text>
          </View>
          <Text style={styles.headerTitle}>StyleGuide</Text>
          <Text style={styles.headerSubtitle}>
            Fashion & Color Matching
          </Text>
          <View style={styles.headerDivider} />
          <Text style={styles.headerTagline}>
            Complement your natural beauty
          </Text>
        </LinearGradient>

        {!hasData ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="color-palette-outline"
              message="No style data yet"
            />
          </View>
        ) : (
          <>
            {/* Color Palette Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, styles.sectionIconBlue]}>
                  <Ionicons name="color-filter" size={20} color={colors.info} />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Your Color Palette</Text>
                  <Text style={styles.sectionSubtitle}>
                    {skinTone ? `For ${skinTone} skin tone` : "Based on your analysis"}
                  </Text>
                </View>
              </View>

              <View style={styles.colorPalette}>
                <View style={styles.colorGroup}>
                  <View style={styles.colorGroupHeader}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.accent[500]} />
                    <Text style={styles.colorGroupTitle}>Best Colors</Text>
                  </View>
                  <View style={styles.colorRow}>
                    {recommendedColors.map((c, i) => (
                      <ColorSwatch key={i} color={c.color} name={c.name} recommended />
                    ))}
                  </View>
                </View>

                <View style={styles.colorDivider} />

                <View style={styles.colorGroup}>
                  <View style={styles.colorGroupHeader}>
                    <Ionicons name="close-circle" size={18} color={colors.error} />
                    <Text style={styles.colorGroupTitle}>Colors to Avoid</Text>
                  </View>
                  <View style={styles.colorRow}>
                    {avoidColors.map((c, i) => (
                      <ColorSwatch key={i} color={c.color} name={c.name} recommended={false} />
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <Pressable
                style={[styles.tab, activeTab === "clothing" && styles.tabActive]}
                onPress={() => setActiveTab("clothing")}
              >
                <Ionicons
                  name="shirt-outline"
                  size={18}
                  color={activeTab === "clothing" ? colors.primary[600] : colors.neutral[400]}
                />
                <Text style={[styles.tabText, activeTab === "clothing" && styles.tabTextActive]}>
                  Clothing ({clothing.length})
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, activeTab === "accessories" && styles.tabActive]}
                onPress={() => setActiveTab("accessories")}
              >
                <Ionicons
                  name="diamond-outline"
                  size={18}
                  color={activeTab === "accessories" ? colors.primary[600] : colors.neutral[400]}
                />
                <Text style={[styles.tabText, activeTab === "accessories" && styles.tabTextActive]}>
                  Accessories ({accessories.length})
                </Text>
              </Pressable>
            </View>

            {/* Recommendations Section */}
            <View style={styles.section}>
              <View style={styles.recommendationList}>
                {(activeTab === "clothing" ? clothing : accessories).map((item, i) => (
                  <StyleCard
                    key={i}
                    item={item}
                    type={activeTab === "clothing" ? "clothing" : "accessory"}
                    index={i}
                  />
                ))}
              </View>
            </View>
          </>
        )}

        {/* Style Tip Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="star" size={20} color="#8B5CF6" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Style Tip</Text>
            <Text style={styles.tipText}>
              The right colors and fabrics can enhance your natural skin tone and make you look more radiant!
            </Text>
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <View style={styles.productsSectionHeader}>
            <Ionicons name="bag-handle" size={22} color={colors.text.primary} />
            <Text style={styles.productsTitle}>Style Essentials</Text>
          </View>
          <Text style={styles.productsSubtitle}>
            Curated picks for your wardrobe
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsScroll}
          >
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
              title="Silk Hair Scrunchies"
              price="₹449"
              image="https://m.media-amazon.com/images/I/71vL8zP4cSL._SL1500_.jpg"
              link="https://www.amazon.in/"
            />
          </ScrollView>
        </View>

        <View style={{ height: spacing[10] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    paddingBottom: spacing[5],
  },

  // Premium Header
  header: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing[7],
    paddingBottom: spacing[8],
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "center",
  },
  headerBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[3],
  },
  headerBadgeText: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.neutral[0],
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: spacing[1],
    letterSpacing: 0.5,
  },
  headerDivider: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: spacing[3],
    borderRadius: 1,
  },
  headerTagline: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    fontStyle: "italic",
  },

  // Empty State
  emptyContainer: {
    padding: layout.screenPaddingHorizontal,
    paddingTop: spacing[10],
  },
  emptyState: {
    alignItems: "center",
    padding: spacing[8],
    backgroundColor: colors.neutral[0],
    borderRadius: radius.xl,
    ...shadows.sm,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[4],
  },
  emptyText: {
    ...textStyles.h4,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  emptyHint: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    textAlign: "center",
  },

  // Section
  section: {
    marginTop: spacing[6],
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing[4],
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  sectionIconBlue: {
    backgroundColor: colors.infoLight,
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  sectionSubtitle: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },

  // Color Palette
  colorPalette: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.xl,
    padding: spacing[5],
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  colorGroup: {
    marginBottom: spacing[4],
  },
  colorGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  colorGroupTitle: {
    ...textStyles.label,
    color: colors.text.secondary,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
  },
  colorSwatchContainer: {
    alignItems: "center",
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    ...shadows.sm,
    marginBottom: spacing[1],
  },
  swatchBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.accent[500],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.neutral[0],
  },
  colorName: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    fontSize: 11,
  },
  colorDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[4],
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    marginTop: spacing[6],
    marginHorizontal: layout.screenPaddingHorizontal,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    padding: spacing[1],
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
  },
  tabActive: {
    backgroundColor: colors.neutral[0],
    ...shadows.sm,
  },
  tabText: {
    ...textStyles.captionMedium,
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.primary[600],
  },

  // Recommendation List
  recommendationList: {
    gap: spacing[3],
  },
  styleCard: {
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.sm,
  },
  styleCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing[4],
  },
  styleIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  styleText: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
  },

  // Tip Card
  tipCard: {
    flexDirection: "row",
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing[6],
    padding: spacing[4],
    backgroundColor: "#F5F3FF",
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...textStyles.label,
    color: "#5B21B6",
    marginBottom: spacing[1],
  },
  tipText: {
    ...textStyles.caption,
    color: "#5B21B6",
    lineHeight: 20,
  },

  // Products Section
  productsSection: {
    marginTop: spacing[8],
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  productsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  productsTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  productsSubtitle: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing[4],
  },
  productsScroll: {
    gap: spacing[3],
  },
});