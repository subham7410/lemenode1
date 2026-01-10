/**
 * Progress Tracker Screen
 * Shows skin score history with visual trend chart
 */

import { ScrollView, Text, View, StyleSheet, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAnalysis, ScoreHistoryEntry } from "../context/AnalysisContext";
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_HEIGHT = 200;
const CHART_PADDING = 40;

// Simple line chart component
function ScoreChart({ data }: { data: ScoreHistoryEntry[] }) {
    if (data.length < 2) {
        return (
            <View style={styles.chartEmpty}>
                <Ionicons name="analytics-outline" size={48} color={colors.neutral[300]} />
                <Text style={styles.chartEmptyText}>
                    Need at least 2 analyses to show trend
                </Text>
            </View>
        );
    }

    // Chart area width (accounting for container padding and y-axis)
    const chartWidth = SCREEN_WIDTH - (layout.screenPaddingHorizontal * 2) - CHART_PADDING - 60;
    const scores = data.map(d => d.score);
    const minScore = Math.min(...scores, 50);
    const maxScore = Math.max(...scores, 100);
    const range = maxScore - minScore || 1;

    // Calculate points - keep within bounds
    const points = data.map((entry, index) => {
        const x = data.length === 1 ? chartWidth / 2 : (index / (data.length - 1)) * chartWidth;
        const y = CHART_HEIGHT - ((entry.score - minScore) / range) * (CHART_HEIGHT - 40) - 20;
        return { x, y, score: entry.score, date: entry.date };
    });

    // Create SVG path
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Calculate trend
    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    const trend = lastScore - firstScore;
    const trendColor = trend >= 0 ? colors.accent[500] : colors.error;
    const trendIcon = trend >= 0 ? "trending-up" : "trending-down";

    return (
        <View style={styles.chartContainer}>
            {/* Trend indicator */}
            <View style={[styles.trendBadge, { backgroundColor: trendColor + '20' }]}>
                <Ionicons name={trendIcon as any} size={18} color={trendColor} />
                <Text style={[styles.trendText, { color: trendColor }]}>
                    {trend >= 0 ? '+' : ''}{trend} points
                </Text>
            </View>

            {/* Chart area */}
            <View style={styles.chart}>
                {/* Y-axis labels */}
                <View style={styles.yAxis}>
                    <Text style={styles.axisLabel}>{maxScore}</Text>
                    <Text style={styles.axisLabel}>{Math.round((maxScore + minScore) / 2)}</Text>
                    <Text style={styles.axisLabel}>{minScore}</Text>
                </View>

                {/* Chart lines and points */}
                <View style={styles.chartArea}>
                    {/* Grid lines */}
                    <View style={[styles.gridLine, { top: 0 }]} />
                    <View style={[styles.gridLine, { top: '50%' }]} />
                    <View style={[styles.gridLine, { bottom: 20 }]} />

                    {/* Connecting lines */}
                    {points.map((point, index) => {
                        if (index === 0) return null;
                        const prevPoint = points[index - 1];
                        const dx = point.x - prevPoint.x;
                        const dy = point.y - prevPoint.y;
                        const length = Math.sqrt(dx * dx + dy * dy);
                        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                        return (
                            <View
                                key={`line-${index}`}
                                style={[
                                    styles.chartLine,
                                    {
                                        left: prevPoint.x,
                                        top: prevPoint.y,
                                        width: length,
                                        transform: [{ rotate: `${angle}deg` }],
                                    },
                                ]}
                            />
                        );
                    })}

                    {/* Data points */}
                    {points.map((point, index) => (
                        <View
                            key={`point-${index}`}
                            style={[
                                styles.dataPoint,
                                {
                                    left: point.x - 6,
                                    top: point.y - 6,
                                    backgroundColor: getScoreColor(point.score),
                                },
                            ]}
                        />
                    ))}
                </View>
            </View>

            {/* X-axis labels */}
            <View style={styles.xAxis}>
                {data.length <= 7 ? (
                    data.map((entry, index) => (
                        <Text key={index} style={styles.axisLabel}>
                            {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                    ))
                ) : (
                    <>
                        <Text style={styles.axisLabel}>
                            {new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                        <Text style={styles.axisLabel}>
                            {new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                    </>
                )}
            </View>
        </View>
    );
}

// History item
function HistoryItem({ entry }: { entry: ScoreHistoryEntry }) {
    const date = new Date(entry.date);
    const scoreColor = getScoreColor(entry.score);

    return (
        <View style={styles.historyItem}>
            <View style={styles.historyDate}>
                <Text style={styles.historyDay}>{date.getDate()}</Text>
                <Text style={styles.historyMonth}>
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                </Text>
            </View>
            <View style={styles.historyContent}>
                <View style={styles.historyRow}>
                    <View style={[styles.scoreCircle, { backgroundColor: scoreColor }]}>
                        <Text style={styles.scoreText}>{entry.score}</Text>
                    </View>
                    <View style={styles.historyDetails}>
                        <Text style={styles.historyLabel}>{getScoreLabel(entry.score)}</Text>
                        <Text style={styles.historyMeta}>
                            {entry.skinType || 'Unknown'} • {entry.condition || 'Unknown'}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default function ProgressTracker() {
    const router = useRouter();
    const { scoreHistory, clearHistory } = useAnalysis();

    // Sort by date (newest first for list, oldest first for chart)
    const sortedForList = [...scoreHistory].reverse();
    const sortedForChart = [...scoreHistory];

    // Calculate stats
    const avgScore = scoreHistory.length > 0
        ? Math.round(scoreHistory.reduce((sum, e) => sum + e.score, 0) / scoreHistory.length)
        : 0;
    const highScore = scoreHistory.length > 0
        ? Math.max(...scoreHistory.map(e => e.score))
        : 0;

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </Pressable>
                <Text style={styles.headerTitle}>Progress Tracker</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <LinearGradient
                            colors={colors.gradients.primary}
                            style={styles.statIcon}
                        >
                            <Ionicons name="analytics" size={20} color={colors.neutral[0]} />
                        </LinearGradient>
                        <Text style={styles.statValue}>{scoreHistory.length}</Text>
                        <Text style={styles.statLabel}>Analyses</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: colors.accent[100] }]}>
                            <Ionicons name="star" size={20} color={colors.accent[600]} />
                        </View>
                        <Text style={styles.statValue}>{avgScore}</Text>
                        <Text style={styles.statLabel}>Avg Score</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: colors.warningLight }]}>
                            <Ionicons name="trophy" size={20} color={colors.warning} />
                        </View>
                        <Text style={styles.statValue}>{highScore}</Text>
                        <Text style={styles.statLabel}>Best Score</Text>
                    </View>
                </View>

                {/* Chart Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Score Trend</Text>
                    <ScoreChart data={sortedForChart} />
                </View>

                {/* History List */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Analysis History</Text>
                        <Text style={styles.sectionCount}>{scoreHistory.length} entries</Text>
                    </View>

                    {sortedForList.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="time-outline" size={48} color={colors.neutral[300]} />
                            <Text style={styles.emptyText}>No analysis history yet</Text>
                            <Text style={styles.emptySubtext}>
                                Complete your first skin analysis to start tracking!
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.historyList}>
                            {sortedForList.slice(0, 10).map((entry) => (
                                <HistoryItem key={entry.id} entry={entry} />
                            ))}
                        </View>
                    )}
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

    // Section
    section: {
        marginBottom: spacing[6],
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing[4],
    },
    sectionTitle: {
        ...textStyles.h4,
        color: colors.text.primary,
        marginBottom: spacing[4],
    },
    sectionCount: {
        ...textStyles.caption,
        color: colors.text.tertiary,
    },

    // Chart
    chartContainer: {
        backgroundColor: colors.neutral[0],
        borderRadius: radius.xl,
        padding: spacing[4],
        ...shadows.sm,
    },
    chartEmpty: {
        height: CHART_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing[3],
    },
    chartEmptyText: {
        ...textStyles.body,
        color: colors.text.tertiary,
        textAlign: "center",
    },
    trendBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: spacing[1],
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[1],
        borderRadius: radius.full,
        marginBottom: spacing[4],
    },
    trendText: {
        ...textStyles.captionMedium,
    },
    chart: {
        height: CHART_HEIGHT,
        flexDirection: "row",
    },
    yAxis: {
        width: 30,
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    chartArea: {
        flex: 1,
        position: "relative",
        overflow: "hidden",
    },
    gridLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: colors.neutral[100],
    },
    chartLine: {
        position: "absolute",
        height: 3,
        backgroundColor: colors.primary[500],
        borderRadius: 2,
        transformOrigin: "left center",
    },
    dataPoint: {
        position: "absolute",
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.neutral[0],
    },
    xAxis: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: spacing[2],
        paddingHorizontal: CHART_PADDING / 2,
    },
    axisLabel: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        fontSize: 10,
    },

    // History
    historyList: {
        gap: spacing[3],
    },
    historyItem: {
        flexDirection: "row",
        backgroundColor: colors.neutral[0],
        borderRadius: radius.lg,
        overflow: "hidden",
        ...shadows.sm,
    },
    historyDate: {
        width: 60,
        backgroundColor: colors.primary[50],
        alignItems: "center",
        justifyContent: "center",
        padding: spacing[3],
    },
    historyDay: {
        ...textStyles.h3,
        color: colors.primary[700],
    },
    historyMonth: {
        ...textStyles.caption,
        color: colors.primary[600],
    },
    historyContent: {
        flex: 1,
        padding: spacing[3],
    },
    historyRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[3],
    },
    scoreCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    scoreText: {
        ...textStyles.bodyMedium,
        color: colors.neutral[0],
    },
    historyDetails: {
        flex: 1,
    },
    historyLabel: {
        ...textStyles.bodyMedium,
        color: colors.text.primary,
        textTransform: "capitalize",
    },
    historyMeta: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        textTransform: "capitalize",
    },

    // Empty
    emptyState: {
        alignItems: "center",
        padding: spacing[8],
        backgroundColor: colors.neutral[0],
        borderRadius: radius.xl,
        ...shadows.sm,
    },
    emptyText: {
        ...textStyles.bodyMedium,
        color: colors.text.secondary,
        marginTop: spacing[3],
    },
    emptySubtext: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        textAlign: "center",
        marginTop: spacing[1],
    },
});
