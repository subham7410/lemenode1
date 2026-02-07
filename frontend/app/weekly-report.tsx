/**
 * Weekly Health Report Screen
 * Shows aggregated skin health data from the past 7 days
 */

import { useState, useEffect, useCallback } from "react";
import {
    ScrollView,
    Text,
    View,
    StyleSheet,
    Pressable,
    Dimensions,
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
    getScoreColor,
} from "../theme";
import { apiService } from "../services/api";
import { CorrelationInsightCard, CorrelationInsight } from "../components/CorrelationInsightCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_HEIGHT = 180;

// Types
interface DailyScore {
    date: string;
    score: number;
    scan_count: number;
}

interface TopIssue {
    issue: string;
    frequency: number;
}

interface ReportSummary {
    total_scans: number;
    scans_change: number;
    avg_score: number;
    score_change: number;
    best_score: number;
    prev_week_scans: number;
    prev_week_avg: number;
}

interface ReportInsights {
    trend: string;
    emoji: string;
    message: string;
    activity_message: string;
}

interface DietCorrelations {
    has_data: boolean;
    message?: string;
    correlations: CorrelationInsight[];
    stats: {
        food_logs_count: number;
        scans_count: number;
        days_analyzed: number;
        avg_health_score?: number;
        avg_skin_score?: number;
    };
}

interface WeeklyReport {
    period: {
        start: string;
        end: string;
    };
    summary: ReportSummary;
    daily_scores: DailyScore[];
    top_issues: TopIssue[];
    recommendations: string[];
    insights: ReportInsights;
    diet_correlations?: DietCorrelations;
    generated_at: string;
}

// Mini bar chart for daily scores
function DailyScoreChart({ data }: { data: DailyScore[] }) {
    if (data.length === 0) {
        return (
            <View style={styles.chartEmpty}>
                <Ionicons name="bar-chart-outline" size={48} color={colors.neutral[300]} />
                <Text style={styles.chartEmptyText}>
                    No scans recorded this week
                </Text>
            </View>
        );
    }

    const maxScore = 100;
    const barWidth = (SCREEN_WIDTH - layout.screenPaddingHorizontal * 2 - spacing[8]) / 7 - 8;

    // Create all 7 days of the week
    const today = new Date();
    const weekDays = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const dayData = data.find(d => d.date === dateStr);
        weekDays.push({
            date: dateStr,
            score: dayData?.score || 0,
            scan_count: dayData?.scan_count || 0,
            dayName: date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0),
        });
    }

    return (
        <View style={styles.chartContainer}>
            <View style={styles.barsContainer}>
                {weekDays.map((day, index) => {
                    const barHeight = day.score > 0 ? (day.score / maxScore) * (CHART_HEIGHT - 40) : 4;
                    const barColor = day.score > 0 ? getScoreColor(day.score) : colors.neutral[200];

                    return (
                        <View key={index} style={styles.barWrapper}>
                            <View style={styles.barColumn}>
                                {day.score > 0 && (
                                    <Text style={styles.barValue}>{day.score}</Text>
                                )}
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: barHeight,
                                            backgroundColor: barColor,
                                            width: barWidth,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={styles.barLabel}>{day.dayName}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

// Issue pill component
function IssuePill({ issue, frequency }: TopIssue) {
    return (
        <View style={styles.issuePill}>
            <Text style={styles.issueText}>{issue}</Text>
            <View style={styles.issueBadge}>
                <Text style={styles.issueBadgeText}>{frequency}x</Text>
            </View>
        </View>
    );
}

// Recommendation item
function RecommendationItem({ text, index }: { text: string; index: number }) {
    return (
        <View style={styles.recItem}>
            <View style={styles.recNumber}>
                <Text style={styles.recNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.recText}>{text}</Text>
        </View>
    );
}

export default function WeeklyReport() {
    const router = useRouter();
    const [report, setReport] = useState<WeeklyReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReport = useCallback(async () => {
        try {
            setError(null);
            const data = await apiService.getWeeklyReport();
            setReport(data);
        } catch (err: any) {
            console.error("Failed to fetch weekly report:", err);
            setError(err.message || "Failed to load report");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchReport();
    }, [fetchReport]);

    const formatDateRange = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
        return `${startDate.toLocaleDateString("en-US", options)} - ${endDate.toLocaleDateString("en-US", options)}`;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safe} edges={["top"]}>
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Weekly Report</Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                    <Text style={styles.loadingText}>Generating your report...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !report) {
        return (
            <SafeAreaView style={styles.safe} edges={["top"]}>
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Weekly Report</Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.neutral[300]} />
                    <Text style={styles.errorText}>{error || "Unable to load report"}</Text>
                    <Pressable style={styles.retryButton} onPress={fetchReport}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const { summary, insights, daily_scores, top_issues, recommendations, period } = report;
    const trendColor = insights.trend === "improving"
        ? colors.accent[500]
        : insights.trend === "declining"
            ? colors.error
            : colors.info;

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </Pressable>
                <Text style={styles.headerTitle}>Weekly Report</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Period Badge */}
                <View style={styles.periodBadge}>
                    <Ionicons name="calendar-outline" size={16} color={colors.primary[600]} />
                    <Text style={styles.periodText}>
                        {formatDateRange(period.start, period.end)}
                    </Text>
                </View>

                {/* Insight Card */}
                <LinearGradient
                    colors={colors.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.insightCard}
                >
                    <Text style={styles.insightEmoji}>{insights.emoji}</Text>
                    <Text style={styles.insightMessage}>{insights.message}</Text>
                    <Text style={styles.insightActivity}>{insights.activity_message}</Text>
                </LinearGradient>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: colors.primary[100] }]}>
                            <Ionicons name="scan" size={20} color={colors.primary[600]} />
                        </View>
                        <Text style={styles.statValue}>{summary.total_scans}</Text>
                        <Text style={styles.statLabel}>Scans</Text>
                        {summary.scans_change !== 0 && (
                            <View style={[styles.changeBadge, {
                                backgroundColor: summary.scans_change > 0 ? colors.accent[100] : colors.errorLight
                            }]}>
                                <Ionicons
                                    name={summary.scans_change > 0 ? "arrow-up" : "arrow-down"}
                                    size={12}
                                    color={summary.scans_change > 0 ? colors.accent[600] : colors.error}
                                />
                                <Text style={[styles.changeText, {
                                    color: summary.scans_change > 0 ? colors.accent[600] : colors.error
                                }]}>
                                    {Math.abs(summary.scans_change)}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: colors.accent[100] }]}>
                            <Ionicons name="analytics" size={20} color={colors.accent[600]} />
                        </View>
                        <Text style={styles.statValue}>{summary.avg_score}</Text>
                        <Text style={styles.statLabel}>Avg Score</Text>
                        {summary.score_change !== 0 && (
                            <View style={[styles.changeBadge, {
                                backgroundColor: summary.score_change > 0 ? colors.accent[100] : colors.errorLight
                            }]}>
                                <Ionicons
                                    name={summary.score_change > 0 ? "arrow-up" : "arrow-down"}
                                    size={12}
                                    color={summary.score_change > 0 ? colors.accent[600] : colors.error}
                                />
                                <Text style={[styles.changeText, {
                                    color: summary.score_change > 0 ? colors.accent[600] : colors.error
                                }]}>
                                    {Math.abs(summary.score_change)}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: colors.warningLight }]}>
                            <Ionicons name="trophy" size={20} color={colors.warning} />
                        </View>
                        <Text style={styles.statValue}>{summary.best_score}</Text>
                        <Text style={styles.statLabel}>Best</Text>
                    </View>
                </View>

                {/* Daily Scores Chart */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Daily Activity</Text>
                    <View style={styles.card}>
                        <DailyScoreChart data={daily_scores} />
                    </View>
                </View>

                {/* Diet Impact Section */}
                {report.diet_correlations && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="nutrition" size={20} color={colors.primary[600]} />
                            <Text style={styles.sectionTitle}>Diet Impact</Text>
                        </View>
                        {report.diet_correlations.has_data ? (
                            <View>
                                {report.diet_correlations.correlations.map((insight, index) => (
                                    <CorrelationInsightCard key={index} insight={insight} />
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyDietCard}>
                                <Ionicons name="leaf-outline" size={32} color={colors.neutral[300]} />
                                <Text style={styles.emptyDietText}>
                                    {report.diet_correlations.message || "Log more meals and scans to see correlations"}
                                </Text>
                                <Text style={styles.emptyDietHint}>
                                    {report.diet_correlations.stats.food_logs_count} meals · {report.diet_correlations.stats.scans_count} scans
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Top Issues */}
                {top_issues.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Common Issues</Text>
                        <View style={styles.issuesContainer}>
                            {top_issues.map((issue, index) => (
                                <IssuePill key={index} {...issue} />
                            ))}
                        </View>
                    </View>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Top Recommendations</Text>
                        <View style={styles.card}>
                            {recommendations.slice(0, 5).map((rec, index) => (
                                <RecommendationItem key={index} text={rec} index={index} />
                            ))}
                        </View>
                    </View>
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

    // Loading/Error states
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
    errorContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing[4],
        padding: spacing[8],
    },
    errorText: {
        ...textStyles.body,
        color: colors.text.tertiary,
        textAlign: "center",
    },
    retryButton: {
        backgroundColor: colors.primary[500],
        paddingHorizontal: spacing[6],
        paddingVertical: spacing[3],
        borderRadius: radius.lg,
    },
    retryButtonText: {
        ...textStyles.bodyMedium,
        color: colors.text.inverse,
    },

    // Period Badge
    periodBadge: {
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
    periodText: {
        ...textStyles.captionMedium,
        color: colors.primary[700],
    },

    // Insight Card
    insightCard: {
        borderRadius: radius.xl,
        padding: spacing[6],
        alignItems: "center",
        marginBottom: spacing[6],
        ...shadows.md,
    },
    insightEmoji: {
        fontSize: 48,
        marginBottom: spacing[3],
    },
    insightMessage: {
        ...textStyles.h4,
        color: colors.text.inverse,
        textAlign: "center",
        marginBottom: spacing[2],
    },
    insightActivity: {
        ...textStyles.body,
        color: colors.neutral[200],
        textAlign: "center",
    },

    // Stats
    statsRow: {
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
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing[2],
    },
    statValue: {
        ...textStyles.h3,
        color: colors.text.primary,
    },
    statLabel: {
        ...textStyles.caption,
        color: colors.text.tertiary,
    },
    changeBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        paddingHorizontal: spacing[2],
        paddingVertical: 2,
        borderRadius: radius.full,
        marginTop: spacing[1],
    },
    changeText: {
        ...textStyles.caption,
        fontSize: 10,
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
    card: {
        backgroundColor: colors.neutral[0],
        borderRadius: radius.xl,
        padding: spacing[4],
        ...shadows.sm,
    },

    // Chart
    chartContainer: {
        height: CHART_HEIGHT,
    },
    chartEmpty: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing[3],
    },
    chartEmptyText: {
        ...textStyles.body,
        color: colors.text.tertiary,
        textAlign: "center",
    },
    barsContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingTop: spacing[4],
    },
    barWrapper: {
        alignItems: "center",
    },
    barColumn: {
        alignItems: "center",
        justifyContent: "flex-end",
        height: CHART_HEIGHT - 40,
    },
    bar: {
        borderRadius: radius.sm,
        minHeight: 4,
    },
    barValue: {
        ...textStyles.caption,
        fontSize: 10,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    barLabel: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        marginTop: spacing[2],
    },

    // Issues
    issuesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing[2],
    },
    issuePill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.neutral[0],
        borderRadius: radius.full,
        paddingLeft: spacing[4],
        paddingRight: spacing[2],
        paddingVertical: spacing[2],
        gap: spacing[2],
        ...shadows.sm,
    },
    issueText: {
        ...textStyles.bodyMedium,
        color: colors.text.primary,
        textTransform: "capitalize",
    },
    issueBadge: {
        backgroundColor: colors.error + "20",
        paddingHorizontal: spacing[2],
        paddingVertical: 2,
        borderRadius: radius.full,
    },
    issueBadgeText: {
        ...textStyles.caption,
        fontSize: 10,
        color: colors.error,
    },

    // Recommendations
    recItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing[3],
        paddingVertical: spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    recNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary[100],
        alignItems: "center",
        justifyContent: "center",
    },
    recNumberText: {
        ...textStyles.caption,
        color: colors.primary[700],
        fontWeight: "600",
    },
    recText: {
        flex: 1,
        ...textStyles.body,
        color: colors.text.secondary,
    },

    // Section Header (for icons)
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[2],
        marginBottom: spacing[3],
    },

    // Empty Diet Card
    emptyDietCard: {
        backgroundColor: colors.neutral[0],
        borderRadius: radius.xl,
        padding: spacing[6],
        alignItems: "center",
        ...shadows.sm,
    },
    emptyDietText: {
        ...textStyles.body,
        color: colors.text.tertiary,
        textAlign: "center",
        marginTop: spacing[3],
    },
    emptyDietHint: {
        ...textStyles.caption,
        color: colors.neutral[400],
        marginTop: spacing[2],
    },
});
