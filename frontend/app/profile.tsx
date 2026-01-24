/**
 * Profile Screen
 *
 * Shows user account info, subscription tier, and settings.
 * Accessible from the Me tab when authenticated.
 */

import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api";

type UsageData = {
    tier: string;
    scans_today: number;
    scans_limit: number;
    can_scan: boolean;
    history_days: number;
    features: string[];
};

export default function ProfileScreen() {
    const { user, signOut, isAuthenticated } = useAuth();
    const router = useRouter();
    const [usage, setUsage] = useState<UsageData | null>(null);
    const [loadingUsage, setLoadingUsage] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            loadUsage();
        } else {
            setLoadingUsage(false);
        }
    }, [isAuthenticated]);

    const loadUsage = async () => {
        try {
            const data = await apiService.getSubscription();
            setUsage(data);
        } catch (e) {
            console.error("Failed to load usage:", e);
        } finally {
            setLoadingUsage(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Sign Out",
                style: "destructive",
                onPress: async () => {
                    await signOut();
                    router.replace("/login");
                },
            },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "This will permanently delete your account and all scan history. This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await apiService.deleteAccount();
                            await signOut();
                            router.replace("/login");
                        } catch (e) {
                            Alert.alert("Error", "Failed to delete account. Please try again.");
                        }
                    },
                },
            ]
        );
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case "pro":
                return "#8b5cf6";
            case "unlimited":
                return "#f59e0b";
            default:
                return "#6b7280";
        }
    };

    const getTierIcon = (tier: string) => {
        switch (tier) {
            case "pro":
                return "star";
            case "unlimited":
                return "diamond";
            default:
                return "person";
        }
    };

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.guestContainer}>
                    <Ionicons name="person-circle-outline" size={80} color="#9ca3af" />
                    <Text style={styles.guestTitle}>Not Signed In</Text>
                    <Text style={styles.guestSubtitle}>
                        Sign in to save your scans and track progress
                    </Text>
                    <TouchableOpacity
                        style={styles.signInButton}
                        onPress={() => router.push("/login")}
                    >
                        <Text style={styles.signInButtonText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                {/* User Card */}
                <View style={styles.userCard}>
                    {user?.photo_url ? (
                        <Image source={{ uri: user.photo_url }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Ionicons name="person" size={40} color="#9ca3af" />
                        </View>
                    )}
                    <Text style={styles.userName}>{user?.display_name || "User"}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                {/* Subscription Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Subscription</Text>
                    </View>

                    {loadingUsage ? (
                        <ActivityIndicator style={{ padding: 20 }} />
                    ) : usage ? (
                        <>
                            <View style={styles.tierBadge}>
                                <View
                                    style={[
                                        styles.tierIcon,
                                        { backgroundColor: getTierColor(usage.tier) },
                                    ]}
                                >
                                    <Ionicons
                                        name={getTierIcon(usage.tier) as any}
                                        size={20}
                                        color="#fff"
                                    />
                                </View>
                                <View>
                                    <Text style={styles.tierName}>
                                        {usage.tier.charAt(0).toUpperCase() + usage.tier.slice(1)} Plan
                                    </Text>
                                    <Text style={styles.tierLimit}>
                                        {usage.scans_limit === -1
                                            ? "Unlimited scans"
                                            : `${usage.scans_today}/${usage.scans_limit} scans today`}
                                    </Text>
                                </View>
                            </View>

                            {/* Progress bar for free tier */}
                            {usage.tier === "free" && usage.scans_limit > 0 && (
                                <View style={styles.usageBar}>
                                    <View
                                        style={[
                                            styles.usageProgress,
                                            {
                                                width: `${Math.min(
                                                    (usage.scans_today / usage.scans_limit) * 100,
                                                    100
                                                )}%`,
                                            },
                                        ]}
                                    />
                                </View>
                            )}

                            {usage.tier === "free" && (
                                <TouchableOpacity
                                    style={styles.upgradeButton}
                                    onPress={() => {
                                        Alert.alert(
                                            "Upgrade",
                                            "Premium plans coming soon! You'll get unlimited scans and full history."
                                        );
                                    }}
                                >
                                    <Ionicons name="arrow-up-circle" size={20} color="#fff" />
                                    <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    ) : null}
                </View>

                {/* Settings */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Settings</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push("/weekly-report")}
                    >
                        <Ionicons name="document-text-outline" size={22} color="#374151" />
                        <Text style={styles.menuItemText}>Weekly Report</Text>
                        <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>NEW</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="notifications-outline" size={22} color="#374151" />
                        <Text style={styles.menuItemText}>Notifications</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push("/privacy-policy")}
                    >
                        <Ionicons name="shield-outline" size={22} color="#374151" />
                        <Text style={styles.menuItemText}>Privacy Policy</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push("/feedback")}
                    >
                        <Ionicons name="chatbubble-outline" size={22} color="#374151" />
                        <Text style={styles.menuItemText}>Send Feedback</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                </View>

                {/* Account Actions */}
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={handleSignOut}
                    >
                        <Ionicons name="log-out-outline" size={22} color="#f87171" />
                        <Text style={[styles.menuItemText, { color: "#f87171" }]}>
                            Sign Out
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomWidth: 0 }]}
                        onPress={handleDeleteAccount}
                    >
                        <Ionicons name="trash-outline" size={22} color="#ef4444" />
                        <Text style={[styles.menuItemText, { color: "#ef4444" }]}>
                            Delete Account
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#111827",
    },
    guestContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 16,
    },
    guestTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#374151",
    },
    guestSubtitle: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
    },
    signInButton: {
        backgroundColor: "#4F46E5",
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginTop: 8,
    },
    signInButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    userCard: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
    },
    avatarPlaceholder: {
        backgroundColor: "#e5e7eb",
        alignItems: "center",
        justifyContent: "center",
    },
    userName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: "#6b7280",
    },
    card: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    cardHeader: {
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
    },
    tierBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },
    tierIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    tierName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },
    tierLimit: {
        fontSize: 13,
        color: "#6b7280",
    },
    usageBar: {
        height: 6,
        backgroundColor: "#e5e7eb",
        borderRadius: 3,
        marginBottom: 16,
        overflow: "hidden",
    },
    usageProgress: {
        height: "100%",
        backgroundColor: "#4F46E5",
        borderRadius: 3,
    },
    upgradeButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#8b5cf6",
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    upgradeButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    menuItemText: {
        flex: 1,
        fontSize: 15,
        color: "#374151",
        marginLeft: 12,
    },
    newBadge: {
        backgroundColor: "#10B981",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginRight: 8,
    },
    newBadgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "700",
    },
});
