/**
 * Food Daily Summary Screen
 * Shows aggregated daily food intake with AI verdict
 */

import { useState, useEffect, useCallback } from "react";
import {
    ScrollView,
    Text,
    View,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
    colors,
    textStyles,
    spacing,
    layout,
    radius,
    shadows,
} from "../theme";
import { apiService } from "../services/api";

interface DailySummary {
    date: string;
    totals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
        sugar: number;
    };
    health_score: number;
    meals_logged: number;
    breakdown: {
        healthy: number;
        moderate: number;
        unhealthy: number;
    };
    best_choice: string | null;
    worst_choice: string | null;
    has_data: boolean;
    verdict?: {
        overall_grade: string;
        verdict: string;
        pattern_warning?: string;
        consequences: string;
        tomorrow_advice: string;
        motivation: string;
    };
}

const getGradeColor = (grade: string) => {
    switch (grade) {
        case "A":
            return colors.accent[500];
        case "B":
            return colors.info;
        case "C":
            return colors.warning;
        case "D":
        case "F":
            return colors.error;
        default:
            return colors.neutral[400];
    }
};

const getScoreColor = (score: number) => {
    if (score >= 7) return colors.accent[500];
    if (score >= 5) return colors.warning;
    return colors.error;
};

export default function FoodSummary() {
    const router = useRouter();
    const [summary, setSummary] = useState<DailySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        try {
            setError(null);
            const data = await apiService.getDailySummary();
            setSummary(data);
        } catch (err: any) {
            console.error("Failed to fetch daily summary:", err);
            setError(err.message || "Failed to load summary");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchSummary();
    }, [fetchSummary]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return "Today";
        }
        return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safe} edges={["top"]}>
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Daily Summary</Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                    <Text style={styles.loadingText}>Calculating your day...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!summary?.has_data) {
        return (
            <SafeAreaView style={styles.safe} edges={["top"]}>
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Daily Summary</Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="restaurant-outline" size={64} color={colors.neutral[300]} />
                    <Text style={styles.emptyTitle}>No meals logged today</Text>
                    <Text style={styles.emptyText}>
                        Start logging your meals to see your daily summary
                    </Text>
                    <Pressable style={styles.logButton} onPress={() => router.back()}>
                        <Text style={styles.logButtonText}>Log a Meal</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const { totals, health_score, meals_logged, breakdown, verdict, best_choice, worst_choice } = summary;
    const gradeColor = verdict ? getGradeColor(verdict.overall_grade) : colors.neutral[400];
    const scoreColor = getScoreColor(health_score);

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </Pressable>
                <Text style={styles.headerTitle}>Daily Summary</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Date Badge */}
                <View style={styles.dateBadge}>
                    <Ionicons name="calendar" size={16} color={colors.primary[600]} />
                    <Text style={styles.dateText}>{formatDate(summary.date)}</Text>
                </View>

                {/* Grade Card */}
                {verdict && (
                    <LinearGradient
                        colors={[gradeColor, gradeColor + "DD"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradeCard}
                    >
                        <Text style={styles.gradeLabel}>Today's Grade</Text>
                        <Text style={styles.gradeValue}>{verdict.overall_grade}</Text>
                        <Text style={styles.gradeVerdict}>{verdict.verdict}</Text>
                    </LinearGradient>
                )}

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Ionicons name="flame" size={24} color={colors.error} />
                        <Text style={styles.statValue}>{totals.calories}</Text>
                        <Text style={styles.statLabel}>Calories</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="restaurant" size={24} color={colors.primary[500]} />
                        <Text style={styles.statValue}>{meals_logged}</Text>
                        <Text style={styles.statLabel}>Meals</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
                            <Text style={styles.scoreValue}>{health_score}</Text>
                        </View>
                        <Text style={styles.statLabel}>Health Score</Text>
                    </View>
                </View>

                {/* Macros Card */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Macros Breakdown</Text>
                    <View style={styles.macrosCard}>
                        <View style={styles.macroItem}>
                            <View style={[styles.macroIcon, { backgroundColor: colors.info + "20" }]}>
                                <Text style={[styles.macroEmoji]}>🥩</Text>
                            </View>
                            <Text style={styles.macroValue}>{totals.protein}g</Text>
                            <Text style={styles.macroLabel}>Protein</Text>
                        </View>
                        <View style={styles.macroItem}>
                            <View style={[styles.macroIcon, { backgroundColor: colors.warning + "20" }]}>
                                <Text style={styles.macroEmoji}>🍞</Text>
                            </View>
                            <Text style={styles.macroValue}>{totals.carbs}g</Text>
                            <Text style={styles.macroLabel}>Carbs</Text>
                        </View>
                        <View style={styles.macroItem}>
                            <View style={[styles.macroIcon, { backgroundColor: colors.error + "20" }]}>
                                <Text style={styles.macroEmoji}>🧈</Text>
                            </View>
                            <Text style={styles.macroValue}>{totals.fat}g</Text>
                            <Text style={styles.macroLabel}>Fat</Text>
                        </View>
                        <View style={styles.macroItem}>
                            <View style={[styles.macroIcon, { backgroundColor: colors.accent[500] + "20" }]}>
                                <Text style={styles.macroEmoji}>🥬</Text>
                            </View>
                            <Text style={styles.macroValue}>{totals.fiber}g</Text>
                            <Text style={styles.macroLabel}>Fiber</Text>
                        </View>
                    </View>
                </View>

                {/* Choices Breakdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Food Choices</Text>
                    <View style={styles.choicesCard}>
                        <View style={styles.choiceRow}>
                            <View style={[styles.choiceDot, { backgroundColor: colors.accent[500] }]} />
                            <Text style={styles.choiceLabel}>Healthy</Text>
                            <Text style={styles.choiceCount}>{breakdown.healthy}</Text>
                        </View>
                        <View style={styles.choiceRow}>
                            <View style={[styles.choiceDot, { backgroundColor: colors.warning }]} />
                            <Text style={styles.choiceLabel}>Moderate</Text>
                            <Text style={styles.choiceCount}>{breakdown.moderate}</Text>
                        </View>
                        <View style={styles.choiceRow}>
                            <View style={[styles.choiceDot, { backgroundColor: colors.error }]} />
                            <Text style={styles.choiceLabel}>Unhealthy</Text>
                            <Text style={styles.choiceCount}>{breakdown.unhealthy}</Text>
                        </View>
                    </View>
                </View>

                {/* Best & Worst */}
                {(best_choice || worst_choice) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Today's Highlights</Text>
                        <View style={styles.highlightsCard}>
                            {best_choice && (
                                <View style={styles.highlightRow}>
                                    <View style={[styles.highlightIcon, { backgroundColor: colors.accent[100] }]}>
                                        <Ionicons name="thumbs-up" size={16} color={colors.accent[600]} />
                                    </View>
                                    <View style={styles.highlightContent}>
                                        <Text style={styles.highlightLabel}>Best Choice</Text>
                                        <Text style={styles.highlightValue}>{best_choice}</Text>
                                    </View>
                                </View>
                            )}
                            {worst_choice && (
                                <View style={styles.highlightRow}>
                                    <View style={[styles.highlightIcon, { backgroundColor: colors.errorLight }]}>
                                        <Ionicons name="thumbs-down" size={16} color={colors.error} />
                                    </View>
                                    <View style={styles.highlightContent}>
                                        <Text style={styles.highlightLabel}>Needs Improvement</Text>
                                        <Text style={styles.highlightValue}>{worst_choice}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* AI Verdict */}
                {verdict && (
                    <>
                        {/* Consequences */}
                        {verdict.consequences && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>⚠️ Consequences</Text>
                                <View style={styles.warningCard}>
                                    <Text style={styles.warningText}>{verdict.consequences}</Text>
                                </View>
                            </View>
                        )}

                        {/* Tomorrow's Advice */}
                        {verdict.tomorrow_advice && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>📋 Tomorrow's Game Plan</Text>
                                <View style={styles.adviceCard}>
                                    <Text style={styles.adviceText}>{verdict.tomorrow_advice}</Text>
                                </View>
                            </View>
                        )}

                        {/* Motivation */}
                        {verdict.motivation && (
                            <View style={styles.motivationCard}>
                                <Ionicons name="flash" size={20} color={colors.warning} />
                                <Text style={styles.motivationText}>{verdict.motivation}</Text>
                            </View>
                        )}
                    </>
                )}

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
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: layout.screenPaddingHorizontal,
        paddingVertical: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: radius.lg,
        backgroundColor: colors.neutral[100],
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        ...textStyles.h4,
        color: colors.text.primary,
    },
    placeholder: {
        width: 40,
    },
    container: {
        padding: layout.screenPaddingHorizontal,
    },

    // Loading & Empty
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing[4],
    },
    loadingText: {
        ...textStyles.body,
        color: colors.text.tertiary,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing[8],
        gap: spacing[3],
    },
    emptyTitle: {
        ...textStyles.h4,
        color: colors.text.primary,
    },
    emptyText: {
        ...textStyles.body,
        color: colors.text.tertiary,
        textAlign: "center",
    },
    logButton: {
        backgroundColor: colors.primary[500],
        paddingHorizontal: spacing[6],
        paddingVertical: spacing[3],
        borderRadius: radius.lg,
        marginTop: spacing[4],
    },
    logButtonText: {
        ...textStyles.bodyMedium,
        color: colors.text.inverse,
    },

    // Date Badge
    dateBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        gap: spacing[2],
        backgroundColor: colors.primary[50],
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
        borderRadius: radius.full,
        marginBottom: spacing[4],
    },
    dateText: {
        ...textStyles.captionMedium,
        color: colors.primary[700],
    },

    // Grade Card
    gradeCard: {
        borderRadius: radius.xl,
        padding: spacing[6],
        alignItems: "center",
        marginBottom: spacing[6],
        ...shadows.md,
    },
    gradeLabel: {
        ...textStyles.caption,
        color: colors.neutral[200],
        marginBottom: spacing[1],
    },
    gradeValue: {
        fontSize: 64,
        fontWeight: "800",
        color: colors.neutral[0],
        marginBottom: spacing[2],
    },
    gradeVerdict: {
        ...textStyles.body,
        color: colors.neutral[100],
        textAlign: "center",
    },

    // Stats Grid
    statsGrid: {
        flexDirection: "row",
        gap: spacing[3],
        marginBottom: spacing[6],
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.neutral[0],
        borderRadius: radius.lg,
        padding: spacing[4],
        alignItems: "center",
        ...shadows.sm,
    },
    statValue: {
        ...textStyles.h3,
        color: colors.text.primary,
        marginTop: spacing[2],
    },
    statLabel: {
        ...textStyles.caption,
        color: colors.text.tertiary,
    },
    scoreBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    scoreValue: {
        ...textStyles.h4,
        color: colors.neutral[0],
    },

    // Sections
    section: {
        marginBottom: spacing[6],
    },
    sectionTitle: {
        ...textStyles.h4,
        color: colors.text.primary,
        marginBottom: spacing[3],
    },

    // Macros Card
    macrosCard: {
        flexDirection: "row",
        backgroundColor: colors.neutral[0],
        borderRadius: radius.xl,
        padding: spacing[4],
        ...shadows.sm,
    },
    macroItem: {
        flex: 1,
        alignItems: "center",
    },
    macroIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing[2],
    },
    macroEmoji: {
        fontSize: 18,
    },
    macroValue: {
        ...textStyles.bodyMedium,
        color: colors.text.primary,
    },
    macroLabel: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        fontSize: 10,
    },

    // Choices Card
    choicesCard: {
        backgroundColor: colors.neutral[0],
        borderRadius: radius.xl,
        padding: spacing[4],
        ...shadows.sm,
        gap: spacing[3],
    },
    choiceRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    choiceDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: spacing[3],
    },
    choiceLabel: {
        ...textStyles.body,
        color: colors.text.secondary,
        flex: 1,
    },
    choiceCount: {
        ...textStyles.h4,
        color: colors.text.primary,
    },

    // Highlights Card
    highlightsCard: {
        backgroundColor: colors.neutral[0],
        borderRadius: radius.xl,
        padding: spacing[4],
        ...shadows.sm,
        gap: spacing[3],
    },
    highlightRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    highlightIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing[3],
    },
    highlightContent: {
        flex: 1,
    },
    highlightLabel: {
        ...textStyles.caption,
        color: colors.text.tertiary,
    },
    highlightValue: {
        ...textStyles.bodyMedium,
        color: colors.text.primary,
    },

    // Warning Card
    warningCard: {
        backgroundColor: colors.errorLight,
        borderRadius: radius.lg,
        padding: spacing[4],
        borderLeftWidth: 4,
        borderLeftColor: colors.error,
    },
    warningText: {
        ...textStyles.body,
        color: colors.errorDark,
        lineHeight: 22,
    },

    // Advice Card
    adviceCard: {
        backgroundColor: colors.infoLight,
        borderRadius: radius.lg,
        padding: spacing[4],
        borderLeftWidth: 4,
        borderLeftColor: colors.info,
    },
    adviceText: {
        ...textStyles.body,
        color: colors.infoDark,
        lineHeight: 22,
    },

    // Motivation Card
    motivationCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[3],
        backgroundColor: colors.warningLight,
        borderRadius: radius.lg,
        padding: spacing[4],
    },
    motivationText: {
        ...textStyles.bodyMedium,
        color: colors.warningDark,
        flex: 1,
        fontStyle: "italic",
    },
});
