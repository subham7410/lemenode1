/**
 * Achievements Screen
 * Shows earned badges and progress toward locked achievements
 */

import { ScrollView, Text, View, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { useAnalysis } from "../context/AnalysisContext";
import {
    loadAchievements,
    checkAchievements,
    getUnlockedCount,
    calculateStreak,
    Achievement,
} from "../data/achievements";
import {
    colors,
    textStyles,
    spacing,
    layout,
    radius,
    shadows,
} from "../theme";

// Badge component
function AchievementBadge({ achievement }: { achievement: Achievement }) {
    const isUnlocked = achievement.unlocked;
    const progress = Math.min(achievement.progress / achievement.requirement, 1);

    return (
        <View
            style={[
                styles.badge,
                !isUnlocked && styles.badgeLocked,
            ]}
        >
            {/* Icon */}
            <View
                style={[
                    styles.badgeIcon,
                    { backgroundColor: isUnlocked ? achievement.color : colors.neutral[200] },
                ]}
            >
                <Ionicons
                    name={achievement.icon as any}
                    size={28}
                    color={isUnlocked ? colors.neutral[0] : colors.neutral[400]}
                />
                {isUnlocked && (
                    <View style={styles.checkMark}>
                        <Ionicons name="checkmark" size={12} color={colors.neutral[0]} />
                    </View>
                )}
            </View>

            {/* Info */}
            <Text style={[styles.badgeTitle, !isUnlocked && styles.textLocked]}>
                {achievement.title}
            </Text>
            <Text style={styles.badgeDesc} numberOfLines={2}>
                {achievement.description}
            </Text>

            {/* Progress bar for locked */}
            {!isUnlocked && achievement.type !== "special" && (
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${progress * 100}%`, backgroundColor: achievement.color },
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {achievement.progress}/{achievement.requirement}
                    </Text>
                </View>
            )}

            {/* Unlock date */}
            {isUnlocked && achievement.unlockedAt && (
                <Text style={styles.unlockDate}>
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                </Text>
            )}
        </View>
    );
}

export default function Achievements() {
    const router = useRouter();
    const { scoreHistory } = useAnalysis();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            // Calculate current stats
            const analysisCount = scoreHistory.length;
            const highScore = scoreHistory.length > 0
                ? Math.max(...scoreHistory.map((s) => s.score))
                : 0;
            const streak = calculateStreak(scoreHistory.map((s) => s.date));

            // Check achievements
            const updated = await checkAchievements(analysisCount, highScore, streak);
            setAchievements(updated);
            setLoading(false);
        }
        load();
    }, [scoreHistory]);

    const unlockedCount = getUnlockedCount(achievements);
    const totalCount = achievements.length;
    const unlockedAchievements = achievements.filter((a) => a.unlocked);
    const lockedAchievements = achievements.filter((a) => !a.unlocked);

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </Pressable>
                <Text style={styles.headerTitle}>Achievements</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats Card */}
                <LinearGradient
                    colors={colors.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statsCard}
                >
                    <View style={styles.statsIcon}>
                        <Ionicons name="trophy" size={32} color={colors.neutral[0]} />
                    </View>
                    <Text style={styles.statsTitle}>
                        {unlockedCount} / {totalCount}
                    </Text>
                    <Text style={styles.statsSubtitle}>Achievements Unlocked</Text>
                    <View style={styles.statsProgress}>
                        <View
                            style={[
                                styles.statsProgressFill,
                                { width: `${(unlockedCount / totalCount) * 100}%` },
                            ]}
                        />
                    </View>
                </LinearGradient>

                {/* Unlocked Section */}
                {unlockedAchievements.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="star" size={20} color={colors.warning} />
                            <Text style={styles.sectionTitle}>Unlocked</Text>
                        </View>
                        <View style={styles.badgeGrid}>
                            {unlockedAchievements.map((achievement) => (
                                <AchievementBadge key={achievement.id} achievement={achievement} />
                            ))}
                        </View>
                    </View>
                )}

                {/* Locked Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="lock-closed" size={20} color={colors.text.tertiary} />
                        <Text style={styles.sectionTitle}>In Progress</Text>
                    </View>
                    <View style={styles.badgeGrid}>
                        {lockedAchievements.map((achievement) => (
                            <AchievementBadge key={achievement.id} achievement={achievement} />
                        ))}
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

    // Stats Card
    statsCard: {
        borderRadius: radius.xl,
        padding: spacing[6],
        alignItems: "center",
        marginBottom: spacing[6],
    },
    statsIcon: {
        width: 64,
        height: 64,
        borderRadius: radius.full,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing[3],
    },
    statsTitle: {
        fontSize: 32,
        fontFamily: "Inter_900Black",
        color: colors.neutral[0],
        marginBottom: spacing[1],
    },
    statsSubtitle: {
        ...textStyles.body,
        color: "rgba(255,255,255,0.8)",
        marginBottom: spacing[4],
    },
    statsProgress: {
        width: "100%",
        height: 8,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: radius.full,
        overflow: "hidden",
    },
    statsProgressFill: {
        height: "100%",
        backgroundColor: colors.neutral[0],
        borderRadius: radius.full,
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

    // Badge Grid
    badgeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing[3],
    },

    // Badge
    badge: {
        width: "47%",
        backgroundColor: colors.neutral[0],
        borderRadius: radius.lg,
        padding: spacing[4],
        alignItems: "center",
        ...shadows.sm,
    },
    badgeLocked: {
        opacity: 0.7,
    },
    badgeIcon: {
        width: 56,
        height: 56,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing[3],
        position: "relative",
    },
    checkMark: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.accent[500],
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.neutral[0],
    },
    badgeTitle: {
        ...textStyles.bodyMedium,
        color: colors.text.primary,
        textAlign: "center",
        marginBottom: spacing[1],
    },
    textLocked: {
        color: colors.text.tertiary,
    },
    badgeDesc: {
        ...textStyles.caption,
        color: colors.text.secondary,
        textAlign: "center",
        marginBottom: spacing[2],
    },
    progressContainer: {
        width: "100%",
        alignItems: "center",
        gap: spacing[1],
    },
    progressBar: {
        width: "100%",
        height: 4,
        backgroundColor: colors.neutral[100],
        borderRadius: radius.full,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: radius.full,
    },
    progressText: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        fontSize: 10,
    },
    unlockDate: {
        ...textStyles.caption,
        color: colors.accent[500],
        fontSize: 10,
    },
});
