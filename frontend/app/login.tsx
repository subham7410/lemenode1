/**
 * Login Screen
 *
 * Clean login interface with Google Sign-In button.
 * Shows on app launch if user is not authenticated.
 */

import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
    const { signInWithGoogle, isLoading } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        try {
            setError(null);
            await signInWithGoogle();
            // Navigation is handled by _layout.tsx based on auth state
        } catch (e: any) {
            setError(e.message || "Sign in failed. Please try again.");
        }
    };

    const handleContinueAsGuest = () => {
        // Allow limited usage without login
        router.replace("/onboarding");
    };

    return (
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
                <View style={styles.logoContainer}>
                    <Ionicons name="sparkles" size={64} color="#fff" />
                </View>
                <Text style={styles.title}>SkinGlow AI</Text>
                <Text style={styles.subtitle}>
                    Your personal AI skincare consultant
                </Text>
            </View>

            {/* Login Section */}
            <View style={styles.loginSection}>
                {error && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="warning" size={20} color="#ef4444" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Google Sign-In Button */}
                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleSignIn}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#4285F4" />
                    ) : (
                        <>
                            <Image
                                source={{
                                    uri: "https://developers.google.com/identity/images/g-logo.png",
                                }}
                                style={styles.googleIcon}
                            />
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Guest Mode */}
                <TouchableOpacity
                    style={styles.guestButton}
                    onPress={handleContinueAsGuest}
                >
                    <Text style={styles.guestButtonText}>Continue as Guest</Text>
                </TouchableOpacity>

                <Text style={styles.guestNote}>
                    Guest mode: 5 scans/min, history not saved
                </Text>

                {/* Benefits */}
                <View style={styles.benefits}>
                    <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                        <Text style={styles.benefitText}>Save your scan history</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                        <Text style={styles.benefitText}>Track skin progress</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                        <Text style={styles.benefitText}>Sync across devices</Text>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={() => router.push("/privacy-policy")}>
                    <Text style={styles.footerLink}>Privacy Policy</Text>
                </TouchableOpacity>
                <Text style={styles.footerDot}>•</Text>
                <TouchableOpacity>
                    <Text style={styles.footerLink}>Terms of Service</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 40,
    },
    logoSection: {
        alignItems: "center",
        marginBottom: 48,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#fff",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(255,255,255,0.8)",
        textAlign: "center",
    },
    loginSection: {
        flex: 1,
        justifyContent: "center",
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    errorText: {
        color: "#fecaca",
        fontSize: 14,
    },
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    googleIcon: {
        width: 24,
        height: 24,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(255,255,255,0.3)",
    },
    dividerText: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 14,
    },
    guestButton: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.15)",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },
    guestButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    guestNote: {
        textAlign: "center",
        color: "rgba(255,255,255,0.6)",
        fontSize: 12,
        marginTop: 8,
    },
    benefits: {
        marginTop: 32,
        gap: 12,
    },
    benefitItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    benefitText: {
        color: "#fff",
        fontSize: 14,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    footerLink: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 12,
    },
    footerDot: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 12,
    },
});
