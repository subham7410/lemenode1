/**
 * Result Screen - Redesigned with Lemenode Design System
 * Premium analysis results with animated score and visual insights
 */

import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAnalysis } from "../context/AnalysisContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Button } from "../components/ui";
import {
  colors,
  textStyles,
  spacing,
  layout,
  radius,
  shadows,
  getScoreColor,
  getScoreLabel,
} from "../theme";

// Animated Score Circle
function ScoreCircle({ score }: { score: number }) {
  // Safety: ensure score is a valid number
  const safeScore = isNaN(score) || score === null || score === undefined ? 70 : score;

  const animatedValue = useRef(new Animated.Value(0)).current;
  const scoreColor = getScoreColor(safeScore);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: safeScore,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [safeScore]);

  const displayScore = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0', '100'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.scoreContainer}>
      <View style={[styles.scoreRing, { borderColor: scoreColor }]}>
        <LinearGradient
          colors={[scoreColor + '20', scoreColor + '05']}
          style={styles.scoreInner}
        >
          <Animated.Text style={[styles.scoreNumber, { color: scoreColor }]}>
            {Math.round(safeScore)}
          </Animated.Text>
          <Text style={styles.scoreMax}>/ 100</Text>
        </LinearGradient>
      </View>
      <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
        <Text style={styles.scoreBadgeText}>{getScoreLabel(score)}</Text>
      </View>
    </View>
  );
}

// Info pill component
function InfoPill({ icon, label, value, gradientColors }: {
  icon: string;
  label: string;
  value: string;
  gradientColors: readonly [string, string];
}) {
  return (
    <View style={styles.infoPill}>
      <LinearGradient colors={gradientColors} style={styles.infoPillIcon}>
        <Ionicons name={icon as any} size={18} color={colors.neutral[0]} />
      </LinearGradient>
      <View style={styles.infoPillContent}>
        <Text style={styles.infoPillLabel}>{label}</Text>
        <Text style={styles.infoPillValue}>{value}</Text>
      </View>
    </View>
  );
}

// Finding item
function FindingItem({ item, type }: { item: string; type: 'issue' | 'positive' }) {
  const isPositive = type === 'positive';
  const iconColor = isPositive ? colors.accent[500] : colors.warning;
  const bgColor = isPositive ? colors.accent[50] : colors.warningLight;

  return (
    <View style={[styles.findingItem, { backgroundColor: bgColor }]}>
      <View style={styles.findingIcon}>
        <Ionicons
          name={isPositive ? "checkmark-circle" : "alert-circle"}
          size={20}
          color={iconColor}
        />
      </View>
      <Text style={styles.findingText}>{item}</Text>
    </View>
  );
}

// Recommendation card
function RecommendationCard({ item, index }: { item: string; index: number }) {
  return (
    <View style={styles.recCard}>
      <View style={styles.recNumber}>
        <Text style={styles.recNumberText}>{index + 1}</Text>
      </View>
      <Text style={styles.recText}>{item}</Text>
    </View>
  );
}

// Quick action chips
function QuickAction({ icon, label, color, onPress }: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickAction,
        pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }
      ]}
      onPress={onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

export default function Result() {
  const { analysis } = useAnalysis();
  const router = useRouter();

  // Helper to extract score (handles both old number format and new object format)
  const getScore = (scoreData: any): number => {
    // Handle object format: {total: 78, breakdown: {...}}
    if (scoreData && typeof scoreData === 'object' && typeof scoreData.total === 'number') {
      return scoreData.total;
    }
    // Handle direct number format
    if (typeof scoreData === 'number' && !isNaN(scoreData)) {
      return scoreData;
    }
    // Fallback
    return 70;
  };

  // Share result
  const handleShare = async () => {
    const scoreValue = analysis ? getScore(analysis.score) : 0;
    try {
      await Share.share({
        message: `My skin health score is ${scoreValue}/100 (${getScoreLabel(scoreValue)})! Analyzed with SkinGlow AI 🌟`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  if (!analysis) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="scan-outline" size={48} color={colors.neutral[300]} />
          </View>
          <Text style={styles.emptyTitle}>No Analysis Yet</Text>
          <Text style={styles.emptySubtitle}>
            Upload a photo to get your personalized skin analysis
          </Text>
          <Button
            title="Start Analysis"
            onPress={() => router.replace("/(tabs)/upload")}
            leftIcon="camera"
          />
        </View>
      </SafeAreaView>
    );
  }

  const score = getScore(analysis.score);
  const scoreColor = getScoreColor(score);
  const scoreBreakdown = typeof analysis.score === 'object' ? analysis.score.breakdown : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Your Results</Text>
          <Pressable style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={colors.primary[600]} />
          </Pressable>
        </View>

        {/* Score Section */}
        <ScoreCircle score={score} />

        {/* Skin Info Pills */}
        <View style={styles.infoPills}>
          <InfoPill
            icon="water"
            label="Skin Type"
            value={analysis.skin_type || "Unknown"}
            gradientColors={colors.gradients.primary}
          />
          <InfoPill
            icon="color-palette"
            label="Skin Tone"
            value={analysis.skin_tone || "Unknown"}
            gradientColors={colors.gradients.style}
          />
        </View>

        {/* Condition */}
        {analysis.overall_condition && (
          <View style={styles.conditionCard}>
            <Ionicons name="medical" size={20} color={colors.info} />
            <Text style={styles.conditionText}>{analysis.overall_condition}</Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <QuickAction
            icon="heart"
            label="Health"
            color={colors.error}
            onPress={() => router.push("/(tabs)/health")}
          />
          <QuickAction
            icon="nutrition"
            label="Food"
            color={colors.accent[500]}
            onPress={() => router.push("/(tabs)/food")}
          />
          <QuickAction
            icon="shirt"
            label="Style"
            color="#8B5CF6"
            onPress={() => router.push("/(tabs)/style")}
          />
        </View>

        {/* Findings Section */}
        {((analysis.visible_issues?.length ?? 0) > 0 || (analysis.positive_aspects?.length ?? 0) > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="eye" size={20} color={colors.text.primary} />
              <Text style={styles.sectionTitle}>What We Found</Text>
            </View>

            <View style={styles.findingsContainer}>
              {analysis.positive_aspects?.map((item, i) => (
                <FindingItem key={`pos-${i}`} item={item} type="positive" />
              ))}
              {analysis.visible_issues?.map((item, i) => (
                <FindingItem key={`issue-${i}`} item={item} type="issue" />
              ))}
            </View>
          </View>
        )}

        {/* Recommendations Section */}
        {(analysis.recommendations?.length ?? 0) > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb" size={20} color={colors.warning} />
              <Text style={styles.sectionTitle}>Recommendations</Text>
            </View>

            <View style={styles.recContainer}>
              {analysis.recommendations?.slice(0, 5).map((item, i) => (
                <RecommendationCard key={i} item={item} index={i} />
              ))}
            </View>
          </View>
        )}

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Button
            title="View Full Health Plan"
            onPress={() => router.push("/(tabs)/health")}
            leftIcon="heart"
            fullWidth
          />
          <Pressable
            style={styles.newAnalysisLink}
            onPress={() => router.replace("/(tabs)/upload")}
          >
            <Ionicons name="refresh" size={18} color={colors.primary[600]} />
            <Text style={styles.newAnalysisText}>Take New Photo</Text>
          </Pressable>
        </View>
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
    padding: layout.screenPaddingHorizontal,
    paddingBottom: spacing[10],
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[6],
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  headerTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
  },

  // Score Circle
  scoreContainer: {
    alignItems: "center",
    marginBottom: spacing[6],
  },
  scoreRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[4],
    ...shadows.lg,
  },
  scoreInner: {
    width: 156,
    height: 156,
    borderRadius: 78,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    fontSize: 52,
    fontFamily: "Inter_900Black",
  },
  scoreMax: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  scoreBadge: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
  },
  scoreBadgeText: {
    ...textStyles.label,
    color: colors.neutral[0],
  },

  // Info Pills
  infoPills: {
    flexDirection: "row",
    gap: spacing[3],
    marginBottom: spacing[5],
  },
  infoPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral[0],
    padding: spacing[3],
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  infoPillIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  infoPillContent: {
    flex: 1,
  },
  infoPillLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  infoPillValue: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    textTransform: "capitalize",
  },

  // Condition Card
  conditionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    backgroundColor: colors.infoLight,
    padding: spacing[4],
    borderRadius: radius.lg,
    marginBottom: spacing[5],
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  conditionText: {
    ...textStyles.body,
    color: colors.infoDark,
    flex: 1,
  },

  // Quick Actions
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.neutral[0],
    padding: spacing[4],
    borderRadius: radius.xl,
    marginBottom: spacing[6],
    ...shadows.sm,
  },
  quickAction: {
    alignItems: "center",
    gap: spacing[2],
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    ...textStyles.captionMedium,
    color: colors.text.secondary,
  },

  // Section
  section: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },

  // Findings
  findingsContainer: {
    gap: spacing[3],
  },
  findingItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing[4],
    borderRadius: radius.lg,
  },
  findingIcon: {
    marginRight: spacing[3],
    marginTop: 2,
  },
  findingText: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 22,
  },

  // Recommendations
  recContainer: {
    gap: spacing[3],
  },
  recCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.neutral[0],
    padding: spacing[4],
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  recNumber: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  recNumberText: {
    ...textStyles.captionMedium,
    color: colors.primary[600],
  },
  recText: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 22,
  },

  // Bottom Actions
  bottomActions: {
    marginTop: spacing[4],
    gap: spacing[4],
  },
  newAnalysisLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    paddingVertical: spacing[3],
  },
  newAnalysisText: {
    ...textStyles.label,
    color: colors.primary[600],
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: layout.screenPaddingHorizontal,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[6],
  },
  emptyTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  emptySubtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing[6],
  },
});