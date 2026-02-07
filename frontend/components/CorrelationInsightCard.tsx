/**
 * CorrelationInsightCard - Displays a diet-skin correlation insight
 * Shows how specific foods or eating patterns affect skin health
 */

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
    colors,
    textStyles,
    spacing,
    radius,
    shadows,
} from "../theme";

export interface CorrelationInsight {
    type: string;
    trigger: string;
    icon: string;
    impact: string;
    impact_value: number;
    timeframe: string;
    description: string;
    recommendation: string;
    confidence: number;
}

interface CorrelationInsightCardProps {
    insight: CorrelationInsight;
    onPress?: () => void;
}

// Get gradient colors based on correlation type
function getGradientColors(type: string): [string, string] {
    switch (type) {
        case "category_impact":
            return ["#ff6b6b", "#ee5a5a"]; // Red for negative impact
        case "food_trigger":
            return ["#ffc107", "#ffb300"]; // Yellow/Orange for warnings
        case "healthy_streak":
            return ["#00c9a7", "#00b894"]; // Green for positive
        default:
            return ["#667eea", "#5a67d8"]; // Default purple
    }
}

// Get icon name with Ionicons format
function getIconName(icon: string): keyof typeof Ionicons.glyphMap {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
        "fast-food": "fast-food",
        "warning": "warning",
        "leaf": "leaf",
        "restaurant": "restaurant",
        "nutrition": "nutrition",
    };
    return iconMap[icon] || "analytics";
}

export function CorrelationInsightCard({ insight, onPress }: CorrelationInsightCardProps) {
    const gradientColors = getGradientColors(insight.type);
    const iconName = getIconName(insight.icon);
    const isPositive = insight.impact_value > 0 || insight.type === "healthy_streak";

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
            ]}
            onPress={onPress}
        >
            {/* Header with icon and trigger */}
            <View style={styles.header}>
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconContainer}
                >
                    <Ionicons name={iconName} size={20} color={colors.neutral[0]} />
                </LinearGradient>
                <View style={styles.headerText}>
                    <Text style={styles.trigger}>{insight.trigger}</Text>
                    <Text style={styles.timeframe}>{insight.timeframe}</Text>
                </View>
                <View style={[
                    styles.impactBadge,
                    { backgroundColor: isPositive ? colors.accent[100] : colors.errorLight }
                ]}>
                    <Ionicons
                        name={isPositive ? "arrow-up" : "arrow-down"}
                        size={12}
                        color={isPositive ? colors.accent[600] : colors.error}
                    />
                    <Text style={[
                        styles.impactText,
                        { color: isPositive ? colors.accent[600] : colors.error }
                    ]}>
                        {insight.impact}
                    </Text>
                </View>
            </View>

            {/* Description */}
            <Text style={styles.description}>{insight.description}</Text>

            {/* Recommendation */}
            <View style={styles.recommendationContainer}>
                <Ionicons name="bulb-outline" size={14} color={colors.primary[600]} />
                <Text style={styles.recommendation}>{insight.recommendation}</Text>
            </View>

            {/* Confidence indicator */}
            <View style={styles.footer}>
                <View style={styles.confidenceBar}>
                    <View
                        style={[
                            styles.confidenceFill,
                            { width: `${insight.confidence * 100}%` },
                        ]}
                    />
                </View>
                <Text style={styles.confidenceText}>
                    {Math.round(insight.confidence * 100)}% confidence
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.neutral[0],
        borderRadius: radius.xl,
        padding: spacing[4],
        marginBottom: spacing[3],
        ...shadows.md,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing[3],
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing[3],
    },
    headerText: {
        flex: 1,
    },
    trigger: {
        ...textStyles.bodyMedium,
        color: colors.text.primary,
    },
    timeframe: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        marginTop: 2,
    },
    impactBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[1],
        borderRadius: radius.full,
        gap: 4,
    },
    impactText: {
        ...textStyles.captionMedium,
    },
    description: {
        ...textStyles.body,
        color: colors.text.secondary,
        lineHeight: 22,
        marginBottom: spacing[3],
    },
    recommendationContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: colors.primary[50],
        padding: spacing[3],
        borderRadius: radius.md,
        gap: spacing[2],
        marginBottom: spacing[3],
    },
    recommendation: {
        ...textStyles.caption,
        color: colors.primary[700],
        flex: 1,
        lineHeight: 18,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[3],
    },
    confidenceBar: {
        flex: 1,
        height: 4,
        backgroundColor: colors.neutral[100],
        borderRadius: 2,
        overflow: "hidden",
    },
    confidenceFill: {
        height: "100%",
        backgroundColor: colors.primary[400],
        borderRadius: 2,
    },
    confidenceText: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        fontSize: 10,
    },
});

export default CorrelationInsightCard;
