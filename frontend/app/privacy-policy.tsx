/**
 * Privacy Policy Screen
 * Displays terms of use, data handling, and legal disclaimers
 */

import { ScrollView, Text, View, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
    colors,
    textStyles,
    spacing,
    layout,
    radius,
    shadows,
} from "../theme";

// Section component
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionContent}>{children}</Text>
        </View>
    );
}

export default function PrivacyPolicy() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </Pressable>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Last Updated */}
                <View style={styles.updateBadge}>
                    <Ionicons name="time-outline" size={16} color={colors.text.tertiary} />
                    <Text style={styles.updateText}>Last updated: January 2026</Text>
                </View>

                {/* Introduction */}
                <View style={styles.introCard}>
                    <Ionicons name="shield-checkmark" size={32} color={colors.primary[600]} />
                    <Text style={styles.introText}>
                        Your privacy matters to us. This policy explains how SkinGlow AI handles your data.
                    </Text>
                </View>

                {/* Sections */}
                <Section title="1. Information We Collect">
                    We collect the following information when you use our app:{"\n\n"}
                    • Profile information (age, gender, height, weight, diet preference){"\n"}
                    • Photos you upload for skin analysis{"\n"}
                    • Device information for app functionality{"\n\n"}
                    We do NOT collect your name, email, phone number, or location unless you provide it voluntarily.
                </Section>

                <Section title="2. How We Use Your Data">
                    Your data is used solely to:{"\n\n"}
                    • Provide personalized skin analysis{"\n"}
                    • Generate health and lifestyle recommendations{"\n"}
                    • Improve our AI analysis accuracy{"\n\n"}
                    We do NOT sell or share your personal data with third parties for marketing purposes.
                </Section>

                <Section title="3. Photo Storage">
                    • Photos are processed temporarily for analysis{"\n"}
                    • Photos are NOT stored permanently on our servers{"\n"}
                    • Analysis results are stored locally on your device{"\n"}
                    • You can delete all your data anytime from your profile
                </Section>

                <Section title="4. AI Analysis Disclaimer">
                    ⚠️ Important: SkinGlow AI provides general wellness suggestions only.{"\n\n"}
                    • Our app is NOT a medical device{"\n"}
                    • Results are NOT medical diagnoses{"\n"}
                    • Always consult a dermatologist for medical concerns{"\n"}
                    • Do not replace professional medical advice with app suggestions
                </Section>

                <Section title="5. Data Security">
                    We protect your data using:{"\n\n"}
                    • Encrypted data transmission (HTTPS){"\n"}
                    • Secure cloud infrastructure (Google Cloud){"\n"}
                    • Regular security audits{"\n"}
                    • No permanent storage of sensitive images
                </Section>

                <Section title="6. Your Rights">
                    You have the right to:{"\n\n"}
                    • Access your stored data{"\n"}
                    • Delete your analysis history{"\n"}
                    • Opt out of data collection{"\n"}
                    • Request a copy of your data
                </Section>

                <Section title="7. Third-Party Services">
                    We use the following third-party services:{"\n\n"}
                    • Google Gemini AI for skin analysis{"\n"}
                    • Google Cloud for hosting{"\n"}
                    • Expo for app updates{"\n\n"}
                    These services have their own privacy policies.
                </Section>

                <Section title="8. Contact Us">
                    Questions about this policy?{"\n\n"}
                    📧 Email: support@lemenode.com{"\n"}
                    🌐 Website: www.lemenode.com
                </Section>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By using SkinGlow AI, you agree to this Privacy Policy.
                    </Text>
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
    updateBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[2],
        marginBottom: spacing[4],
    },
    updateText: {
        ...textStyles.caption,
        color: colors.text.tertiary,
    },
    introCard: {
        backgroundColor: colors.primary[50],
        padding: spacing[5],
        borderRadius: radius.xl,
        alignItems: "center",
        gap: spacing[3],
        marginBottom: spacing[6],
    },
    introText: {
        ...textStyles.body,
        color: colors.primary[700],
        textAlign: "center",
    },
    section: {
        marginBottom: spacing[6],
    },
    sectionTitle: {
        ...textStyles.h4,
        color: colors.text.primary,
        marginBottom: spacing[3],
    },
    sectionContent: {
        ...textStyles.body,
        color: colors.text.secondary,
        lineHeight: 24,
    },
    footer: {
        backgroundColor: colors.neutral[100],
        padding: spacing[4],
        borderRadius: radius.lg,
        marginTop: spacing[4],
    },
    footerText: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        textAlign: "center",
    },
});
