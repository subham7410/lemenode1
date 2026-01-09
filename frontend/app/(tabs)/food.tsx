/**
 * Food Screen - Redesigned with Lemenode Design System
 * Personalized nutrition recommendations with interactive items
 */

import { ScrollView, Text, View, StyleSheet, Pressable, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAnalysis } from "../../context/AnalysisContext";
import ProductCard from "../../components/ProductCard";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import {
  colors,
  textStyles,
  spacing,
  layout,
  radius,
  shadows,
} from "../../theme";

// Food item with expandable details
interface FoodItemProps {
  item: string;
  type: "good" | "bad";
  index: number;
}

function FoodItem({ item, type, index }: FoodItemProps) {
  const [expanded, setExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    Animated.timing(animatedHeight, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const isGood = type === "good";
  const iconName = isGood ? "checkmark-circle" : "close-circle";
  const iconColor = isGood ? colors.accent[500] : colors.error;
  const bgColor = isGood ? colors.accent[50] : colors.errorLight;
  const borderColor = isGood ? colors.accent[200] : colors.error;

  // Extract food name and benefit if format is "Food - Benefit"
  const parts = item.split(" - ");
  const foodName = parts[0];
  const benefit = parts[1] || null;

  return (
    <Pressable onPress={toggleExpand}>
      <Animated.View
        style={[
          styles.foodItem,
          {
            backgroundColor: bgColor,
            borderLeftColor: borderColor,
            transform: [
              {
                scale: animatedHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.02],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.foodItemHeader}>
          <View style={[styles.foodIcon, { backgroundColor: isGood ? colors.accent[100] : colors.errorLight }]}>
            <Ionicons name={iconName} size={20} color={iconColor} />
          </View>
          <View style={styles.foodContent}>
            <Text style={styles.foodName}>{foodName}</Text>
            {benefit && !expanded && (
              <Text style={styles.foodBenefitPreview} numberOfLines={1}>
                {benefit}
              </Text>
            )}
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.neutral[400]}
          />
        </View>

        {expanded && benefit && (
          <View style={styles.foodExpanded}>
            <Text style={styles.foodBenefit}>{benefit}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
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
      <Text style={styles.emptyHint}>Complete your skin analysis to get personalized recommendations</Text>
    </View>
  );
}

export default function Food() {
  const { analysis } = useAnalysis();

  const eatMore: string[] = analysis?.food?.eat_more ?? [];
  const limit: string[] = analysis?.food?.limit ?? [];
  const hasData = eatMore.length > 0 || limit.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Compact Header */}
        <LinearGradient
          colors={colors.gradients.food}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="nutrition" size={24} color={colors.neutral[0]} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Nutrition Guide</Text>
              <Text style={styles.headerSubtitle}>
                Eat for glowing, healthy skin
              </Text>
            </View>
          </View>
        </LinearGradient>

        {!hasData ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="leaf-outline"
              message="No nutrition data yet"
            />
          </View>
        ) : (
          <>
            {/* Foods to Eat More */}
            {eatMore.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, styles.sectionIconGreen]}>
                    <Ionicons name="add-circle" size={20} color={colors.accent[600]} />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Foods to Embrace</Text>
                    <Text style={styles.sectionSubtitle}>
                      {eatMore.length} recommendations
                    </Text>
                  </View>
                </View>

                <View style={styles.foodList}>
                  {eatMore.map((item, i) => (
                    <FoodItem key={i} item={item} type="good" index={i} />
                  ))}
                </View>
              </View>
            )}

            {/* Foods to Limit */}
            {limit.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, styles.sectionIconRed]}>
                    <Ionicons name="remove-circle" size={20} color={colors.error} />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Foods to Limit</Text>
                    <Text style={styles.sectionSubtitle}>
                      {limit.length} items to avoid
                    </Text>
                  </View>
                </View>

                <View style={styles.foodList}>
                  {limit.map((item, i) => (
                    <FoodItem key={i} item={item} type="bad" index={i} />
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="time" size={20} color={colors.info} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Patience is Key</Text>
            <Text style={styles.infoText}>
              Dietary changes take 2-4 weeks to show visible effects on your skin. Stay consistent!
            </Text>
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <View style={styles.productsSectionHeader}>
            <Ionicons name="cart" size={22} color={colors.text.primary} />
            <Text style={styles.productsTitle}>Recommended Products</Text>
          </View>
          <Text style={styles.productsSubtitle}>
            Premium quality, skin-friendly nutrition
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsScroll}
          >
            <ProductCard
              title="Organic Green Tea"
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

  // Header
  header: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing[5],
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[4],
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    ...textStyles.h3,
    color: colors.neutral[0],
    marginBottom: spacing[0.5],
  },
  headerSubtitle: {
    ...textStyles.body,
    color: "rgba(255,255,255,0.9)",
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
  sectionIconGreen: {
    backgroundColor: colors.accent[100],
  },
  sectionIconRed: {
    backgroundColor: colors.errorLight,
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  sectionSubtitle: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },

  // Food List
  foodList: {
    gap: spacing[3],
  },
  foodItem: {
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    backgroundColor: colors.neutral[0],
    ...shadows.sm,
  },
  foodItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing[4],
  },
  foodIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  foodContent: {
    flex: 1,
  },
  foodName: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
  },
  foodBenefitPreview: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[0.5],
  },
  foodExpanded: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    paddingTop: 0,
    marginLeft: spacing[12],
  },
  foodBenefit: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },

  // Info Card
  infoCard: {
    flexDirection: "row",
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing[6],
    padding: spacing[4],
    backgroundColor: colors.infoLight,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...textStyles.label,
    color: colors.infoDark,
    marginBottom: spacing[1],
  },
  infoText: {
    ...textStyles.caption,
    color: colors.infoDark,
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