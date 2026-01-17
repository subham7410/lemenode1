/**
 * StreakBadge - Display user's daily scan streak
 * 
 * Compact fire emoji badge showing current streak count.
 * Animates when streak is extended.
 */

import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, radius, textStyles } from "../theme";

interface StreakBadgeProps {
    currentStreak: number;
    longestStreak?: number;
    compact?: boolean;
    onPress?: () => void;
}

export function StreakBadge({
    currentStreak,
    longestStreak,
    compact = false,
    onPress
}: StreakBadgeProps) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fireAnim = useRef(new Animated.Value(0)).current;

    // Pulse animation when streak exists
    useEffect(() => {
        if (currentStreak > 0) {
            // Fire flicker animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(fireAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fireAnim, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // Initial pulse
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.15,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.spring(pulseAnim, {
                    toValue: 1,
                    friction: 3,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [currentStreak]);

    const fireScale = fireAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.1],
    });

    if (currentStreak === 0) {
        return null; // Don't show if no streak
    }

    if (compact) {
        return (
            <Pressable onPress={onPress}>
                <Animated.View style={[styles.compactBadge, { transform: [{ scale: pulseAnim }] }]}>
                    <Animated.Text style={[styles.fireEmoji, { transform: [{ scale: fireScale }] }]}>
                        🔥
                    </Animated.Text>
                    <Text style={styles.compactCount}>{currentStreak}</Text>
                </Animated.View>
            </Pressable>
        );
    }

    return (
        <Pressable onPress={onPress}>
            <LinearGradient
                colors={["#FF6B35", "#F7C59F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fullBadge}
            >
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <View style={styles.streakContent}>
                        <Animated.Text style={[styles.fireEmojiLarge, { transform: [{ scale: fireScale }] }]}>
                            🔥
                        </Animated.Text>
                        <View style={styles.streakText}>
                            <Text style={styles.streakCount}>{currentStreak}</Text>
                            <Text style={styles.streakLabel}>
                                {currentStreak === 1 ? "Day Streak" : "Day Streak"}
                            </Text>
                        </View>
                    </View>
                    {longestStreak && longestStreak > currentStreak && (
                        <Text style={styles.bestStreak}>
                            Best: {longestStreak} days 🏆
                        </Text>
                    )}
                </Animated.View>
            </LinearGradient>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    // Compact badge (for header)
    compactBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 107, 53, 0.15)",
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
        borderRadius: radius.full,
        gap: spacing[1],
    },
    fireEmoji: {
        fontSize: 16,
    },
    compactCount: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FF6B35",
    },

    // Full badge (for profile)
    fullBadge: {
        borderRadius: radius.lg,
        padding: spacing[4],
        marginVertical: spacing[2],
    },
    streakContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    fireEmojiLarge: {
        fontSize: 40,
        marginRight: spacing[3],
    },
    streakText: {
        flex: 1,
    },
    streakCount: {
        fontSize: 32,
        fontWeight: "800",
        color: "#fff",
    },
    streakLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "rgba(255, 255, 255, 0.9)",
    },
    bestStreak: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.8)",
        marginTop: spacing[2],
        textAlign: "center",
    },
});

export default StreakBadge;
