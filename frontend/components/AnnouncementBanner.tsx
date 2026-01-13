/**
 * AnnouncementBanner - Developer News Banner Component
 * 
 * Displays important announcements, app updates, and developer news
 * at the top of the screen. Dismissible and persists state in AsyncStorage.
 */

import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, radius, textStyles } from "../theme";

// Key for storing dismissed announcements
const DISMISSED_ANNOUNCEMENTS_KEY = "@skinglow_dismissed_announcements";

// Announcement type
export interface Announcement {
    id: string;
    title: string;
    message: string;
    type: "info" | "update" | "warning" | "promo";
    actionLabel?: string;
    actionUrl?: string;
    expiresAt?: string;
}

// Default announcements (can be fetched from backend later)
const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
    {
        id: "v2.5.0-release",
        title: "🎉 New Version Available!",
        message: "Version 2.5.0 brings improved skin analysis and new health tips. Update now for the best experience!",
        type: "update",
        actionLabel: "Learn More",
        actionUrl: "https://github.com/lemenode/skinglow-ai/releases",
    },
];

// Props
interface AnnouncementBannerProps {
    announcements?: Announcement[];
}

export function AnnouncementBanner({ announcements = DEFAULT_ANNOUNCEMENTS }: AnnouncementBannerProps) {
    const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);
    const slideAnim = useState(new Animated.Value(-100))[0];

    // Load dismissed announcements on mount
    useEffect(() => {
        loadDismissedAnnouncements();
    }, []);

    // Show first non-dismissed announcement
    useEffect(() => {
        const activeAnnouncements = announcements.filter(a => {
            // Filter out dismissed
            if (dismissedIds.includes(a.id)) return false;
            // Filter out expired
            if (a.expiresAt && new Date(a.expiresAt) < new Date()) return false;
            return true;
        });

        if (activeAnnouncements.length > 0) {
            setCurrentAnnouncement(activeAnnouncements[0]);
            // Animate in
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }).start();
        } else {
            setCurrentAnnouncement(null);
        }
    }, [announcements, dismissedIds]);

    const loadDismissedAnnouncements = async () => {
        try {
            const stored = await AsyncStorage.getItem(DISMISSED_ANNOUNCEMENTS_KEY);
            if (stored) {
                setDismissedIds(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load dismissed announcements:", e);
        }
    };

    const dismissAnnouncement = async (id: string) => {
        try {
            // Animate out
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 200,
                useNativeDriver: true,
            }).start();

            // Update state
            const newDismissedIds = [...dismissedIds, id];
            setDismissedIds(newDismissedIds);
            await AsyncStorage.setItem(DISMISSED_ANNOUNCEMENTS_KEY, JSON.stringify(newDismissedIds));
        } catch (e) {
            console.error("Failed to dismiss announcement:", e);
        }
    };

    const handleAction = () => {
        if (currentAnnouncement?.actionUrl) {
            Linking.openURL(currentAnnouncement.actionUrl);
        }
    };

    const getGradientColors = (type: Announcement["type"]): readonly [string, string] => {
        switch (type) {
            case "update":
                return ["#667eea", "#764ba2"] as const;
            case "warning":
                return ["#f59e0b", "#d97706"] as const;
            case "promo":
                return ["#10b981", "#059669"] as const;
            default:
                return ["#3b82f6", "#1d4ed8"] as const;
        }
    };

    const getIcon = (type: Announcement["type"]) => {
        switch (type) {
            case "update":
                return "sparkles";
            case "warning":
                return "warning";
            case "promo":
                return "gift";
            default:
                return "information-circle";
        }
    };

    if (!currentAnnouncement) return null;

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
            <LinearGradient
                colors={getGradientColors(currentAnnouncement.type)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={getIcon(currentAnnouncement.type) as any}
                            size={24}
                            color="#fff"
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{currentAnnouncement.title}</Text>
                        <Text style={styles.message} numberOfLines={2}>
                            {currentAnnouncement.message}
                        </Text>
                        {currentAnnouncement.actionLabel && (
                            <TouchableOpacity onPress={handleAction} style={styles.actionButton}>
                                <Text style={styles.actionText}>{currentAnnouncement.actionLabel}</Text>
                                <Ionicons name="arrow-forward" size={14} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => dismissAnnouncement(currentAnnouncement.id)}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Ionicons name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        elevation: 10,
    },
    gradient: {
        paddingTop: spacing[2],
        paddingBottom: spacing[3],
        paddingHorizontal: spacing[4],
    },
    content: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: radius.lg,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing[3],
    },
    textContainer: {
        flex: 1,
        marginRight: spacing[2],
    },
    title: {
        fontSize: 14,
        fontWeight: "700",
        color: "#fff",
        marginBottom: spacing[1],
    },
    message: {
        fontSize: 12,
        color: "rgba(255,255,255,0.9)",
        lineHeight: 18,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: spacing[2],
        gap: spacing[1],
    },
    actionText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
        textDecorationLine: "underline",
    },
    closeButton: {
        padding: spacing[1],
    },
});

export default AnnouncementBanner;
