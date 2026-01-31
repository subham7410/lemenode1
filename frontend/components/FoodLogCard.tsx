/**
 * FoodLogCard Component
 * Displays a single food entry with health score and AI verdict
 */

import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, textStyles, spacing, radius, shadows } from "../theme";

interface FoodLogCardProps {
    id: string;
    foodName: string;
    category: "healthy" | "moderate" | "unhealthy";
    healthScore: number;
    calories: number;
    macros: {
        protein: number;
        carbs: number;
        fat: number;
    };
    verdict: string;
    loggedAt: string;
    onDelete?: (id: string) => void;
    compact?: boolean;
}

const getCategoryColor = (category: string) => {
    switch (category) {
        case "healthy":
            return colors.accent[500];
        case "unhealthy":
            return colors.error;
        default:
            return colors.warning;
    }
};

const getCategoryIcon = (category: string) => {
    switch (category) {
        case "healthy":
            return "checkmark-circle";
        case "unhealthy":
            return "alert-circle";
        default:
            return "ellipse";
    }
};

const getCategoryLabel = (category: string) => {
    switch (category) {
        case "healthy":
            return "Good Choice";
        case "unhealthy":
            return "Not Great";
        default:
            return "Moderate";
    }
};

const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

export default function FoodLogCard({
    id,
    foodName,
    category,
    healthScore,
    calories,
    macros,
    verdict,
    loggedAt,
    onDelete,
    compact = false,
}: FoodLogCardProps) {
    const categoryColor = getCategoryColor(category);
    const categoryIcon = getCategoryIcon(category);
    const categoryLabel = getCategoryLabel(category);

    const handleDelete = () => {
        Alert.alert(
            "Delete Entry",
            `Remove "${foodName}" from your log?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => onDelete?.(id),
                },
            ]
        );
    };

    if (compact) {
        return (
            <View style={styles.compactCard}>
                <View style={[styles.compactIndicator, { backgroundColor: categoryColor }]} />
                <View style={styles.compactContent}>
                    <Text style={styles.compactName} numberOfLines={1}>{foodName}</Text>
                    <Text style={styles.compactMeta}>
                        {calories} cal • {formatTime(loggedAt)}
                    </Text>
                </View>
                <View style={[styles.compactScore, { backgroundColor: categoryColor + "20" }]}>
                    <Text style={[styles.compactScoreText, { color: categoryColor }]}>
                        {healthScore}/10
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.card, { borderLeftColor: categoryColor }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.categoryBadge, { backgroundColor: categoryColor + "20" }]}>
                    <Ionicons name={categoryIcon as any} size={14} color={categoryColor} />
                    <Text style={[styles.categoryText, { color: categoryColor }]}>
                        {categoryLabel}
                    </Text>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.time}>{formatTime(loggedAt)}</Text>
                    {onDelete && (
                        <Pressable style={styles.deleteButton} onPress={handleDelete}>
                            <Ionicons name="trash-outline" size={16} color={colors.error} />
                        </Pressable>
                    )}
                </View>
            </View>

            {/* Food Name */}
            <Text style={styles.foodName}>{foodName}</Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{calories}</Text>
                    <Text style={styles.statLabel}>cal</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{macros.protein}g</Text>
                    <Text style={styles.statLabel}>protein</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{macros.carbs}g</Text>
                    <Text style={styles.statLabel}>carbs</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{macros.fat}g</Text>
                    <Text style={styles.statLabel}>fat</Text>
                </View>
                <View style={styles.scoreContainer}>
                    <View style={[styles.scoreBadge, { backgroundColor: categoryColor }]}>
                        <Text style={styles.scoreText}>{healthScore}</Text>
                    </View>
                </View>
            </View>

            {/* Verdict */}
            {verdict && (
                <View style={styles.verdictContainer}>
                    <Ionicons name="chatbubble-ellipses" size={14} color={colors.text.tertiary} />
                    <Text style={styles.verdictText}>{verdict}</Text>
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.neutral[0],
        borderRadius: radius.lg,
        borderLeftWidth: 4,
        padding: spacing[4],
        ...shadows.sm,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing[2],
    },
    categoryBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[1],
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
        borderRadius: radius.full,
    },
    categoryText: {
        ...textStyles.caption,
        fontWeight: "600",
    },
    time: {
        ...textStyles.caption,
        color: colors.text.tertiary,
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[2],
    },
    foodName: {
        ...textStyles.h4,
        color: colors.text.primary,
        marginBottom: spacing[3],
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.neutral[50],
        borderRadius: radius.md,
        padding: spacing[3],
        marginBottom: spacing[3],
    },
    stat: {
        flex: 1,
        alignItems: "center",
    },
    statValue: {
        ...textStyles.bodyMedium,
        color: colors.text.primary,
    },
    statLabel: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        fontSize: 10,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: colors.neutral[200],
    },
    scoreContainer: {
        marginLeft: spacing[2],
    },
    scoreBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    scoreText: {
        ...textStyles.bodyMedium,
        color: colors.neutral[0],
        fontWeight: "700",
    },
    verdictContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing[2],
        backgroundColor: colors.neutral[50],
        padding: spacing[3],
        borderRadius: radius.md,
    },
    verdictText: {
        ...textStyles.caption,
        color: colors.text.secondary,
        flex: 1,
        lineHeight: 18,
    },
    deleteButton: {
        padding: spacing[1],
    },

    // Compact styles
    compactCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.neutral[0],
        borderRadius: radius.md,
        padding: spacing[3],
        ...shadows.sm,
    },
    compactIndicator: {
        width: 4,
        height: 32,
        borderRadius: 2,
        marginRight: spacing[3],
    },
    compactContent: {
        flex: 1,
    },
    compactName: {
        ...textStyles.bodyMedium,
        color: colors.text.primary,
    },
    compactMeta: {
        ...textStyles.caption,
        color: colors.text.tertiary,
    },
    compactScore: {
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
        borderRadius: radius.full,
    },
    compactScoreText: {
        ...textStyles.caption,
        fontWeight: "600",
    },
});
