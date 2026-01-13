/**
 * Feedback Screen
 * Allows users to submit feedback, report bugs, or request features
 */

import { useState } from "react";
import {
    ScrollView,
    Text,
    View,
    StyleSheet,
    Pressable,
    TextInput,
    Alert,
    Linking,
    KeyboardAvoidingView,
    Platform,
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

type FeedbackType = "general" | "bug" | "feature" | "other";

const feedbackTypes: { type: FeedbackType; label: string; icon: string; color: string }[] = [
    { type: "general", label: "General", icon: "chatbubble", color: colors.primary[600] },
    { type: "bug", label: "Bug Report", icon: "bug", color: colors.error },
    { type: "feature", label: "Feature Request", icon: "bulb", color: colors.warning },
    { type: "other", label: "Other", icon: "ellipsis-horizontal", color: colors.info },
];

export default function Feedback() {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<FeedbackType>("general");
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) {
            Alert.alert("Missing Feedback", "Please enter your feedback message.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Option 1: Open email client with pre-filled message
            const subject = `SkinGlow AI Feedback: ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`;
            const body = `Feedback Type: ${selectedType}\n\nMessage:\n${message}\n\nUser Email: ${email || "Not provided"}`;
            const mailtoUrl = `mailto:support@lemenode.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            const canOpen = await Linking.canOpenURL(mailtoUrl);
            if (canOpen) {
                await Linking.openURL(mailtoUrl);
            }

            // Show success
            Alert.alert(
                "Thank You! 🎉",
                "Your feedback has been prepared. Please send the email to complete submission.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            setMessage("");
                            setEmail("");
                            router.back();
                        },
                    },
                ]
            );
        } catch (error) {
            Alert.alert("Error", "Could not open email client. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Send Feedback</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.container}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Intro */}
                    <View style={styles.introCard}>
                        <LinearGradient
                            colors={colors.gradients.primary}
                            style={styles.introIcon}
                        >
                            <Ionicons name="heart" size={28} color={colors.neutral[0]} />
                        </LinearGradient>
                        <Text style={styles.introTitle}>We'd love to hear from you!</Text>
                        <Text style={styles.introText}>
                            Your feedback helps us improve SkinGlow AI for everyone.
                        </Text>
                    </View>

                    {/* Feedback Type Selection */}
                    <Text style={styles.label}>What's this about?</Text>
                    <View style={styles.typeGrid}>
                        {feedbackTypes.map((item) => (
                            <Pressable
                                key={item.type}
                                style={[
                                    styles.typeCard,
                                    selectedType === item.type && styles.typeCardSelected,
                                    selectedType === item.type && { borderColor: item.color },
                                ]}
                                onPress={() => setSelectedType(item.type)}
                            >
                                <View
                                    style={[
                                        styles.typeIcon,
                                        { backgroundColor: item.color + "20" },
                                    ]}
                                >
                                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                                </View>
                                <Text
                                    style={[
                                        styles.typeLabel,
                                        selectedType === item.type && { color: item.color },
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Message Input */}
                    <Text style={styles.label}>Your Feedback</Text>
                    <TextInput
                        style={styles.messageInput}
                        placeholder="Tell us what's on your mind..."
                        placeholderTextColor={colors.text.disabled}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        textAlignVertical="top"
                    />

                    {/* Email (Optional) */}
                    <Text style={styles.label}>
                        Your Email <Text style={styles.optional}>(optional)</Text>
                    </Text>
                    <TextInput
                        style={styles.emailInput}
                        placeholder="email@example.com"
                        placeholderTextColor={colors.text.disabled}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Text style={styles.hint}>
                        Only if you'd like us to respond to your feedback.
                    </Text>

                    {/* Submit Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.submitButton,
                            pressed && styles.submitButtonPressed,
                            isSubmitting && styles.submitButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <LinearGradient
                            colors={colors.gradients.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitGradient}
                        >
                            <Ionicons name="send" size={20} color={colors.neutral[0]} />
                            <Text style={styles.submitText}>
                                {isSubmitting ? "Preparing..." : "Send Feedback"}
                            </Text>
                        </LinearGradient>
                    </Pressable>

                    {/* Alternative Contact */}
                    <View style={styles.altContact}>
                        <Text style={styles.altText}>Or reach us directly:</Text>
                        <Pressable
                            style={styles.emailLink}
                            onPress={() => Linking.openURL("mailto:support@lemenode.com")}
                        >
                            <Ionicons name="mail" size={18} color={colors.primary[600]} />
                            <Text style={styles.emailLinkText}>support@lemenode.com</Text>
                        </Pressable>
                    </View>

                    <View style={{ height: spacing[10] }} />
                </ScrollView>
            </KeyboardAvoidingView>
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
    label: {
        ...textStyles.label,
        color: colors.text.primary,
        marginBottom: spacing[3],
    },
    optional: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        fontWeight: "400",
    },
    typeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing[3],
        marginBottom: spacing[6],
    },
    typeCard: {
        width: "47%",
        flexDirection: "row",
        alignItems: "center",
        padding: spacing[4],
        backgroundColor: colors.neutral[0],
        borderRadius: radius.lg,
        borderWidth: 2,
        borderColor: colors.neutral[100],
        ...shadows.sm,
    },
    typeCardSelected: {
        borderWidth: 2,
        backgroundColor: colors.primary[50],
    },
    typeIcon: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing[3],
    },
    typeLabel: {
        ...textStyles.bodyMedium,
        color: colors.text.primary,
    },
    messageInput: {
        backgroundColor: colors.neutral[0],
        borderRadius: radius.lg,
        padding: spacing[4],
        height: 150,
        ...textStyles.body,
        color: colors.text.primary,
        marginBottom: spacing[6],
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    emailInput: {
        backgroundColor: colors.neutral[0],
        borderRadius: radius.lg,
        padding: spacing[4],
        ...textStyles.body,
        color: colors.text.primary,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    hint: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        marginTop: spacing[2],
        marginBottom: spacing[6],
    },
    submitButton: {
        borderRadius: radius.lg,
        overflow: "hidden",
        marginBottom: spacing[6],
    },
    submitButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing[2],
        paddingVertical: spacing[4],
        paddingHorizontal: spacing[6],
    },
    submitText: {
        ...textStyles.buttonMedium,
        color: colors.neutral[0],
    },
    altContact: {
        alignItems: "center",
        gap: spacing[3],
    },
    altText: {
        ...textStyles.caption,
        color: colors.text.tertiary,
    },
    emailLink: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[2],
        padding: spacing[3],
        backgroundColor: colors.primary[50],
        borderRadius: radius.lg,
    },
    emailLinkText: {
        ...textStyles.bodyMedium,
        color: colors.primary[600],
    },
});
