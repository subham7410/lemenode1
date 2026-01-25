/**
 * Health Screen - Redesigned with Lemenode Design System
 * Skincare routines with checkable habits and progress tracking
 */

import { ScrollView, Text, View, StyleSheet, Pressable, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAnalysis } from "../../context/AnalysisContext";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  colors,
  textStyles,
  spacing,
  layout,
  radius,
  shadows,
} from "../../theme";

// Checkable habit component with animation
interface HabitCardProps {
  item: string;
  index: number;
  isChecked: boolean;
  onToggle: () => void;
}

function HabitCard({ item, index, isChecked, onToggle }: HabitCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(isChecked ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(checkAnim, {
      toValue: isChecked ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isChecked]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle();
  };

  const checkboxBg = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.neutral[200], colors.accent[500]],
  });

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.habitCard,
          { transform: [{ scale: scaleAnim }] },
          isChecked && styles.habitCardChecked,
        ]}
      >
        <View style={styles.habitNumber}>
          <Text style={styles.habitNumberText}>{index + 1}</Text>
        </View>
        <Text style={[styles.habitText, isChecked && styles.habitTextChecked]}>
          {item}
        </Text>
        <Animated.View style={[styles.checkbox, { backgroundColor: checkboxBg }]}>
          {isChecked && (
            <Ionicons name="checkmark" size={16} color={colors.neutral[0]} />
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

// Routine card with time-based styling
interface RoutineCardProps {
  item: string;
  index: number;
}

function RoutineCard({ item, index }: RoutineCardProps) {
  const isAM = item.toLowerCase().includes("morning") || item.toLowerCase().includes("am");
  const isPM = item.toLowerCase().includes("evening") || item.toLowerCase().includes("pm") || item.toLowerCase().includes("night");
  const isWeekly = item.toLowerCase().includes("week");

  let gradientColors: readonly [string, string] = colors.gradients.primary;
  let icon: string = "calendar-outline";
  let label = "Daily";

  if (isAM) {
    gradientColors = ["#FBBF24", "#F59E0B"];
    icon = "sunny";
    label = "Morning";
  } else if (isPM) {
    gradientColors = ["#8B5CF6", "#7C3AED"];
    icon = "moon";
    label = "Evening";
  } else if (isWeekly) {
    gradientColors = colors.gradients.food;
    icon = "calendar";
    label = "Weekly";
  }

  return (
    <View style={styles.routineCard}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.routineGradient}
      >
        <Ionicons name={icon as any} size={22} color={colors.neutral[0]} />
      </LinearGradient>
      <View style={styles.routineContent}>
        <Text style={styles.routineLabel}>{label}</Text>
        <Text style={styles.routineText}>{item}</Text>
      </View>
    </View>
  );
}

// Progress ring component
function ProgressRing({ progress, label, color }: { progress: number; label: string; color: string }) {
  return (
    <View style={styles.progressRing}>
      <View style={[styles.progressCircle, { borderColor: color }]}>
        <Text style={[styles.progressNumber, { color }]}>{progress}%</Text>
      </View>
      <Text style={styles.progressLabel}>{label}</Text>
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
      <Text style={styles.emptyHint}>Complete your skin analysis to get a personalized routine</Text>
    </View>
  );
}

export default function Health() {
  const { analysis } = useAnalysis();
  const [checkedHabits, setCheckedHabits] = useState<Record<number, boolean>>({});

  const dailyHabits: string[] = analysis?.health?.daily_habits ?? [];
  const routine: string[] = analysis?.health?.routine ?? [];
  const hasData = dailyHabits.length > 0 || routine.length > 0;

  // Load checked state from storage
  useEffect(() => {
    const loadChecked = async () => {
      try {
        const stored = await AsyncStorage.getItem("@checked_habits");
        if (stored) {
          setCheckedHabits(JSON.parse(stored));
        }
      } catch (e) {
        console.log("Failed to load habits", e);
      }
    };
    loadChecked();
  }, []);

  // Save checked state
  const toggleHabit = async (index: number) => {
    const newChecked = {
      ...checkedHabits,
      [index]: !checkedHabits[index],
    };
    setCheckedHabits(newChecked);
    try {
      await AsyncStorage.setItem("@checked_habits", JSON.stringify(newChecked));
    } catch (e) {
      console.log("Failed to save habits", e);
    }
  };

  // Calculate progress
  const checkedCount = Object.values(checkedHabits).filter(Boolean).length;
  const totalHabits = dailyHabits.length;
  const progressPercent = totalHabits > 0 ? Math.round((checkedCount / totalHabits) * 100) : 0;

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
            <Text style={styles.headerBadgeText}>💪</Text>
          </View>
          <Text style={styles.headerTitle}>Wellness Hub</Text>
          <Text style={styles.headerSubtitle}>
            Personalized Skincare Routine
          </Text>
          <View style={styles.headerDivider} />
          <Text style={styles.headerTagline}>
            Build habits that transform your skin
          </Text>
        </LinearGradient>

        {!hasData ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="fitness-outline"
              message="No health data yet"
            />
          </View>
        ) : (
          <>
            {/* Progress Section */}
            {dailyHabits.length > 0 && (
              <View style={styles.progressSection}>
                <View style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <Ionicons name="trending-up" size={20} color={colors.accent[600]} />
                    <Text style={styles.progressTitle}>Today's Progress</Text>
                  </View>
                  <View style={styles.progressStats}>
                    <View style={styles.progressMain}>
                      <Text style={styles.progressBig}>{checkedCount}</Text>
                      <Text style={styles.progressOf}>of {totalHabits}</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${progressPercent}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressPercent}>{progressPercent}% complete</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Daily Habits Section */}
            {dailyHabits.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, styles.sectionIconAmber]}>
                    <Ionicons name="sunny" size={20} color={colors.warning} />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Daily Habits</Text>
                    <Text style={styles.sectionSubtitle}>
                      Tap to mark as complete
                    </Text>
                  </View>
                </View>

                <View style={styles.habitList}>
                  {dailyHabits.map((item, i) => (
                    <HabitCard
                      key={i}
                      item={item}
                      index={i}
                      isChecked={!!checkedHabits[i]}
                      onToggle={() => toggleHabit(i)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Skincare Routine Section */}
            {routine.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, styles.sectionIconPurple]}>
                    <Ionicons name="sparkles" size={20} color="#8B5CF6" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Skincare Routine</Text>
                    <Text style={styles.sectionSubtitle}>
                      Follow consistently for best results
                    </Text>
                  </View>
                </View>

                <View style={styles.routineList}>
                  {routine.map((item, i) => (
                    <RoutineCard key={i} item={item} index={i} />
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="bulb" size={20} color={colors.warning} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Why Consistency Matters</Text>
            <Text style={styles.infoText}>
              Skin cells regenerate every 28 days. Follow your routine for 2-4 weeks to see visible improvements.
            </Text>
          </View>
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

  // Progress Section
  progressSection: {
    marginTop: spacing[5],
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  progressCard: {
    backgroundColor: colors.accent[50],
    borderRadius: radius.xl,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.accent[200],
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  progressTitle: {
    ...textStyles.label,
    color: colors.accent[700],
  },
  progressStats: {
    alignItems: "center",
  },
  progressMain: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: spacing[3],
  },
  progressBig: {
    fontSize: 48,
    fontFamily: "Inter_900Black",
    color: colors.accent[600],
  },
  progressOf: {
    ...textStyles.body,
    color: colors.accent[500],
    marginLeft: spacing[2],
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: colors.accent[200],
    borderRadius: radius.full,
    overflow: "hidden",
    marginBottom: spacing[2],
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent[500],
    borderRadius: radius.full,
  },
  progressPercent: {
    ...textStyles.caption,
    color: colors.accent[600],
  },
  progressRing: {
    alignItems: "center",
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral[0],
    marginBottom: spacing[2],
  },
  progressNumber: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  progressLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
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
  sectionIconAmber: {
    backgroundColor: colors.warningLight,
  },
  sectionIconPurple: {
    backgroundColor: "#EDE9FE",
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  sectionSubtitle: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },

  // Habit List
  habitList: {
    gap: spacing[3],
  },
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing[4],
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  habitCardChecked: {
    backgroundColor: colors.accent[50],
    borderColor: colors.accent[200],
  },
  habitNumber: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  habitNumberText: {
    ...textStyles.captionMedium,
    color: colors.primary[600],
  },
  habitText: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
  },
  habitTextChecked: {
    color: colors.text.secondary,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  // Routine List
  routineList: {
    gap: spacing[3],
  },
  routineCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing[4],
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  routineGradient: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  routineContent: {
    flex: 1,
  },
  routineLabel: {
    ...textStyles.overline,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
  routineText: {
    ...textStyles.body,
    color: colors.text.primary,
    lineHeight: 22,
  },

  // Info Card
  infoCard: {
    flexDirection: "row",
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing[6],
    padding: spacing[4],
    backgroundColor: colors.warningLight,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...textStyles.label,
    color: colors.warningDark,
    marginBottom: spacing[1],
  },
  infoText: {
    ...textStyles.caption,
    color: colors.warningDark,
    lineHeight: 20,
  },
});