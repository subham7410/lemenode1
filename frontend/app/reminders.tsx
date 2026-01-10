/**
 * Reminders Screen
 * Allows users to set skincare routine reminders
 */

import { useState, useEffect } from "react";
import {
    ScrollView,
    Text,
    View,
    StyleSheet,
    Pressable,
    Switch,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    colors,
    textStyles,
    spacing,
    layout,
    radius,
    shadows,
} from "../theme";

const REMINDERS_KEY = "@lemenode_reminders";

type ReminderSettings = {
    morningEnabled: boolean;
    morningTime: string;
    eveningEnabled: boolean;
    eveningTime: string;
    weeklyEnabled: boolean;
    weeklyDay: string;
};

const DEFAULT_SETTINGS: ReminderSettings = {
    morningEnabled: false,
    morningTime: "07:00",
    eveningEnabled: false,
    eveningTime: "21:00",
    weeklyEnabled: false,
    weeklyDay: "Sunday",
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIMES = [
    "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00",
    "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00",
];

// Reminder card component
function ReminderCard({
    icon,
    iconColor,
    title,
    description,
    enabled,
    onToggle,
    timeValue,
    times,
    onTimeChange,
}: {
    icon: string;
    iconColor: string;
    title: string;
    description: string;
    enabled: boolean;
    onToggle: (value: boolean) => void;
    timeValue?: string;
    times?: string[];
    onTimeChange?: (time: string) => void;
}) {
    return (
        <View style={styles.reminderCard}>
            <View style={styles.reminderHeader}>
                <View style={[styles.reminderIcon, { backgroundColor: iconColor + '15' }]}>
                    <Ionicons name={icon as any} size={24} color={iconColor} />
                </View>
                <View style={styles.reminderInfo}>
                    <Text style={styles.reminderTitle}>{title}</Text>
                    <Text style={styles.reminderDesc}>{description}</Text>
                </View>
                <Switch
                    value={enabled}
                    onValueChange={onToggle}
                    trackColor={{ false: colors.neutral[200], true: colors.primary[400] }}
                    thumbColor={enabled ? colors.primary[600] : colors.neutral[0]}
                />
            </View>

            {/* Time selector */}
            {enabled && times && onTimeChange && (
                <View style={styles.timeSelector}>
                    <Text style={styles.timeSelectorLabel}>Time:</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.timeOptions}
                    >
                        {times.map((time) => (
                            <Pressable
                                key={time}
                                style={[
                                    styles.timeOption,
                                    timeValue === time && styles.timeOptionSelected,
                                ]}
                                onPress={() => onTimeChange(time)}
                            >
                                <Text
                                    style={[
                                        styles.timeOptionText,
                                        timeValue === time && styles.timeOptionTextSelected,
                                    ]}
                                >
                                    {time}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

export default function Reminders() {
    const router = useRouter();
    const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    // Load settings
    useEffect(() => {
        async function load() {
            try {
                const stored = await AsyncStorage.getItem(REMINDERS_KEY);
                if (stored) {
                    setSettings(JSON.parse(stored));
                }
            } catch (e) {
                console.log("Error loading reminders:", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Save settings
    async function saveSettings(newSettings: ReminderSettings) {
        setSettings(newSettings);
        await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(newSettings));
    }

    const updateSetting = <K extends keyof ReminderSettings>(
        key: K,
        value: ReminderSettings[K]
    ) => {
        saveSettings({ ...settings, [key]: value });
    };

    const handleSave = () => {
        Alert.alert(
            "Reminders Saved! 🔔",
            "Note: Local notifications require a native app build. Your preferences are saved and will work when notifications are enabled.",
            [{ text: "OK", onPress: () => router.back() }]
        );
    };

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </Pressable>
                <Text style={styles.headerTitle}>Reminders</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Intro Card */}
                <View style={styles.introCard}>
                    <LinearGradient
                        colors={colors.gradients.style}
                        style={styles.introIcon}
                    >
                        <Ionicons name="notifications" size={28} color={colors.neutral[0]} />
                    </LinearGradient>
                    <Text style={styles.introTitle}>Skincare Reminders</Text>
                    <Text style={styles.introText}>
                        Set reminders for your daily skincare routine and weekly analysis
                    </Text>
                </View>

                {/* Morning Routine */}
                <ReminderCard
                    icon="sunny"
                    iconColor="#F59E0B"
                    title="Morning Routine"
                    description="Start your day with skincare"
                    enabled={settings.morningEnabled}
                    onToggle={(v) => updateSetting("morningEnabled", v)}
                    timeValue={settings.morningTime}
                    times={["06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00"]}
                    onTimeChange={(t) => updateSetting("morningTime", t)}
                />

                {/* Evening Routine */}
                <ReminderCard
                    icon="moon"
                    iconColor="#6366F1"
                    title="Evening Routine"
                    description="End your day with skincare"
                    enabled={settings.eveningEnabled}
                    onToggle={(v) => updateSetting("eveningEnabled", v)}
                    timeValue={settings.eveningTime}
                    times={["19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"]}
                    onTimeChange={(t) => updateSetting("eveningTime", t)}
                />

                {/* Weekly Analysis */}
                <ReminderCard
                    icon="calendar"
                    iconColor="#10B981"
                    title="Weekly Analysis"
                    description="Track your skin progress weekly"
                    enabled={settings.weeklyEnabled}
                    onToggle={(v) => updateSetting("weeklyEnabled", v)}
                />

                {/* Weekly day selector */}
                {settings.weeklyEnabled && (
                    <View style={styles.daySelector}>
                        <Text style={styles.daySelectorLabel}>Remind me on:</Text>
                        <View style={styles.dayOptions}>
                            {DAYS.map((day) => (
                                <Pressable
                                    key={day}
                                    style={[
                                        styles.dayOption,
                                        settings.weeklyDay === day && styles.dayOptionSelected,
                                    ]}
                                    onPress={() => updateSetting("weeklyDay", day)}
                                >
                                    <Text
                                        style={[
                                            styles.dayOptionText,
                                            settings.weeklyDay === day && styles.dayOptionTextSelected,
                                        ]}
                                    >
                                        {day.slice(0, 3)}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}

                {/* Info Note */}
                <View style={styles.infoNote}>
                    <Ionicons name="information-circle" size={20} color={colors.info} />
                    <Text style={styles.infoNoteText}>
                        Make sure to enable notifications in your device settings for reminders to work.
                    </Text>
                </View>

                {/* Save Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.saveButton,
                        pressed && { opacity: 0.9 },
                    ]}
                    onPress={handleSave}
                >
                    <LinearGradient
                        colors={colors.gradients.primary}
                        style={styles.saveGradient}
                    >
                        <Ionicons name="checkmark" size={20} color={colors.neutral[0]} />
                        <Text style={styles.saveText}>Save Preferences</Text>
                    </LinearGradient>
                </Pressable>

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

    // Intro Card
    introCard: {
        backgroundColor: colors.neutral[0],
        padding: spacing[6],
        borderRadius: radius.xl,
        alignItems: "center",
        marginBottom: spacing[6],
        ...shadows.md,
    },
    introIcon: {
        width: 60,
        height: 60,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing[4],
    },
    introTitle: {
        ...textStyles.h4,
        color: colors.text.primary,
        marginBottom: spacing[2],
    },
    introText: {
        ...textStyles.body,
        color: colors.text.secondary,
        textAlign: "center",
    },

    // Reminder Card
    reminderCard: {
        backgroundColor: colors.neutral[0],
        borderRadius: radius.lg,
        padding: spacing[4],
        marginBottom: spacing[3],
        ...shadows.sm,
    },
    reminderHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    reminderIcon: {
        width: 48,
        height: 48,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing[3],
    },
    reminderInfo: {
        flex: 1,
    },
    reminderTitle: {
        ...textStyles.bodyMedium,
        color: colors.text.primary,
    },
    reminderDesc: {
        ...textStyles.caption,
        color: colors.text.tertiary,
    },

    // Time Selector
    timeSelector: {
        marginTop: spacing[3],
        paddingTop: spacing[3],
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
    },
    timeSelectorLabel: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        marginBottom: spacing[2],
    },
    timeOptions: {
        flexDirection: "row",
        gap: spacing[2],
    },
    timeOption: {
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        borderRadius: radius.md,
        backgroundColor: colors.neutral[100],
    },
    timeOptionSelected: {
        backgroundColor: colors.primary[600],
    },
    timeOptionText: {
        ...textStyles.captionMedium,
        color: colors.text.secondary,
    },
    timeOptionTextSelected: {
        color: colors.neutral[0],
    },

    // Day Selector
    daySelector: {
        backgroundColor: colors.neutral[0],
        borderRadius: radius.lg,
        padding: spacing[4],
        marginBottom: spacing[3],
        ...shadows.sm,
    },
    daySelectorLabel: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        marginBottom: spacing[3],
    },
    dayOptions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing[2],
    },
    dayOption: {
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        borderRadius: radius.md,
        backgroundColor: colors.neutral[100],
    },
    dayOptionSelected: {
        backgroundColor: colors.primary[600],
    },
    dayOptionText: {
        ...textStyles.captionMedium,
        color: colors.text.secondary,
    },
    dayOptionTextSelected: {
        color: colors.neutral[0],
    },

    // Info Note
    infoNote: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing[2],
        backgroundColor: colors.infoLight,
        padding: spacing[4],
        borderRadius: radius.lg,
        marginTop: spacing[3],
        marginBottom: spacing[6],
    },
    infoNoteText: {
        ...textStyles.caption,
        color: colors.infoDark,
        flex: 1,
    },

    // Save Button
    saveButton: {
        borderRadius: radius.lg,
        overflow: "hidden",
    },
    saveGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing[2],
        paddingVertical: spacing[4],
    },
    saveText: {
        ...textStyles.buttonMedium,
        color: colors.neutral[0],
    },
});
