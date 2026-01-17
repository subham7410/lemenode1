/**
 * Upload Screen - Redesigned with Lemenode Design System
 * Premium skin analysis photo capture experience
 */

import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useAnalysis } from "../../context/AnalysisContext";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui";
import { AnnouncementBanner } from "../../components/AnnouncementBanner";
import { StreakBadge } from "../../components/StreakBadge";
import {
  colors,
  textStyles,
  spacing,
  layout,
  radius,
  shadows,
} from "../../theme";
import { getTipOfTheDay } from "../../data/skinTips";

// Cloud Run backend URL
const API_URL = "https://lemenode-backend-466053387222.asia-south1.run.app";

export default function Upload() {
  const router = useRouter();
  const { user, setAnalysis, analysis } = useAnalysis();
  const { user: authUser } = useAuth();

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing...");
  const [error, setError] = useState<string | null>(null);
  const [tipsExpanded, setTipsExpanded] = useState(false);

  // Force user profile setup
  useEffect(() => {
    if (
      !user.age ||
      !user.gender ||
      !user.height ||
      !user.weight ||
      !user.diet
    ) {
      router.replace("/user-info");
    }
  }, [user, router]);

  // Animate loading messages
  useEffect(() => {
    if (!loading) return;

    const messages = [
      "Analyzing skin texture...",
      "Detecting skin type...",
      "Identifying concerns...",
      "Generating recommendations...",
    ];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingMessage(messages[index]);
    }, 2500);

    return () => clearInterval(interval);
  }, [loading]);

  // Pick image from gallery
  const pickImage = async () => {
    setError(null);

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow photo access to continue."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
      exif: false,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Take photo
  const takePhoto = async () => {
    setError(null);

    const permission =
      await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow camera access to continue."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
      exif: false,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Send image to backend
  const analyze = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);
    setLoadingMessage("Preparing image...");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const formData = new FormData();

      formData.append("image", {
        uri: image,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      formData.append("user", JSON.stringify(user));

      console.log("Calling backend:", `${API_URL}/analyze`);

      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Server error ${response.status}`);
      }

      const data = await response.json();

      await setAnalysis(data);
      router.push("/result");
    } catch (err: any) {
      clearTimeout(timeout);

      if (err.name === "AbortError") {
        setError("Analysis timed out. Please try again.");
        Alert.alert(
          "Timeout",
          "The analysis took too long. Please try again."
        );
      } else {
        setError(err.message || "Analysis failed.");
        Alert.alert(
          "Analysis Failed",
          err.message || "Could not analyze image."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // View last result
  const viewPreviousResult = () => {
    if (analysis) router.push("/result");
  };

  // Clear current image
  const clearImage = () => {
    setImage(null);
    setError(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Announcement Banner */}
      <AnnouncementBanner />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Streak Badge */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Skin Analysis</Text>
              {authUser?.current_streak ? (
                <StreakBadge
                  currentStreak={authUser.current_streak}
                  compact
                  onPress={() => router.push("/(tabs)/profile")}
                />
              ) : null}
            </View>
            <Text style={styles.subtitle}>
              Upload a clear face photo for AI-powered analysis
            </Text>
          </View>

          {/* Image Preview Area */}
          <View style={styles.imageSection}>
            {image ? (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.image} />
                {!loading && (
                  <Pressable style={styles.clearButton} onPress={clearImage}>
                    <Ionicons name="close" size={20} color={colors.neutral[0]} />
                  </Pressable>
                )}
                {loading && (
                  <View style={styles.loadingOverlay}>
                    <View style={styles.loadingContent}>
                      <ActivityIndicator size="large" color={colors.neutral[0]} />
                      <Text style={styles.loadingText}>{loadingMessage}</Text>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <Pressable style={styles.placeholder} onPress={takePhoto}>
                <View style={styles.placeholderIcon}>
                  <Ionicons name="scan-outline" size={40} color={colors.primary[400]} />
                </View>
                <Text style={styles.placeholderTitle}>Tap to capture</Text>
                <Text style={styles.placeholderHint}>or use buttons below</Text>

                {/* Face guide overlay hint */}
                <View style={styles.faceGuide}>
                  <View style={styles.faceGuideCorner} />
                  <View style={[styles.faceGuideCorner, styles.faceGuideTopRight]} />
                  <View style={[styles.faceGuideCorner, styles.faceGuideBottomLeft]} />
                  <View style={[styles.faceGuideCorner, styles.faceGuideBottomRight]} />
                </View>
              </Pressable>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable
              style={styles.actionButton}
              onPress={takePhoto}
              disabled={loading}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="camera" size={24} color={colors.neutral[0]} />
              </LinearGradient>
              <Text style={styles.actionButtonText}>Camera</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={pickImage}
              disabled={loading}
            >
              <View style={styles.actionButtonOutline}>
                <Ionicons name="images" size={24} color={colors.primary[600]} />
              </View>
              <Text style={styles.actionButtonText}>Gallery</Text>
            </Pressable>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={() => setError(null)}>
                <Ionicons name="close" size={18} color={colors.error} />
              </Pressable>
            </View>
          )}

          {/* Daily Skin Tip - Compact */}
          {(() => {
            const tip = getTipOfTheDay();
            return (
              <Pressable style={[styles.dailyTipCard, { borderLeftColor: tip.color }]}>
                <View style={[styles.dailyTipIcon, { backgroundColor: tip.color + '15' }]}>
                  <Ionicons name={tip.icon as any} size={18} color={tip.color} />
                </View>
                <View style={styles.dailyTipContent}>
                  <Text style={styles.dailyTipLabel}>💡 {tip.title}</Text>
                  <Text style={styles.dailyTipText} numberOfLines={2}>{tip.tip}</Text>
                </View>
              </Pressable>
            );
          })()}

          {/* Expandable Photo Tips */}
          <Pressable
            style={styles.tipsCard}
            onPress={() => setTipsExpanded(!tipsExpanded)}
          >
            <View style={styles.tipsHeader}>
              <Ionicons name="camera" size={18} color={colors.warning} />
              <Text style={styles.tipsTitle}>Photo Tips</Text>
              <Ionicons
                name={tipsExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.neutral[400]}
              />
            </View>
            {tipsExpanded && (
              <View style={styles.tipsContent}>
                <Text style={styles.tipText}>• Face camera directly • Natural lighting</Text>
                <Text style={styles.tipText}>• No filters/makeup • Neutral expression</Text>
              </View>
            )}
          </Pressable>
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View style={styles.bottomBar}>
          <Button
            title={loading ? "Analyzing..." : "Analyze Skin"}
            onPress={analyze}
            disabled={!image || loading}
            loading={loading}
            leftIcon={loading ? undefined : "sparkles"}
            fullWidth
          />

          {/* Previous Result Link */}
          {analysis && !loading && (
            <Pressable style={styles.previousLink} onPress={viewPreviousResult}>
              <Text style={styles.previousLinkText}>View Previous Result</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary[600]} />
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPaddingHorizontal,
    paddingBottom: spacing[4],
  },
  bottomBar: {
    padding: layout.screenPaddingHorizontal,
    paddingBottom: spacing[4],
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  // Header
  header: {
    marginBottom: spacing[4],
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[1],
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
  },

  // Image Section
  imageSection: {
    marginBottom: spacing[4],
  },
  imageWrapper: {
    height: 260,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.neutral[200],
  },
  image: {
    width: "100%",
    height: "100%",
  },
  clearButton: {
    position: "absolute",
    top: spacing[3],
    right: spacing[3],
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContent: {
    alignItems: "center",
    gap: spacing[3],
  },
  loadingText: {
    ...textStyles.bodyMedium,
    color: colors.neutral[0],
  },

  // Placeholder
  placeholder: {
    height: 260,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.primary[200],
    borderStyle: "dashed",
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  placeholderIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[3],
  },
  placeholderTitle: {
    ...textStyles.h4,
    color: colors.primary[600],
    marginBottom: spacing[1],
  },
  placeholderHint: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },

  // Face guide corners
  faceGuide: {
    position: "absolute",
    width: 180,
    height: 220,
  },
  faceGuideCorner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: colors.primary[300],
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
    top: 0,
    left: 0,
  },
  faceGuideTopRight: {
    left: undefined,
    right: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 8,
  },
  faceGuideBottomLeft: {
    top: undefined,
    bottom: 0,
    borderTopWidth: 0,
    borderBottomWidth: 3,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 8,
  },
  faceGuideBottomRight: {
    top: undefined,
    bottom: 0,
    left: undefined,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 8,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
  },
  actionButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[2],
    ...shadows.md,
  },
  actionButtonOutline: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary[200],
    backgroundColor: colors.neutral[0],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[2],
  },
  actionButtonText: {
    ...textStyles.captionMedium,
    color: colors.text.secondary,
  },

  // Error Box
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    backgroundColor: colors.errorLight,
    padding: spacing[3],
    borderRadius: radius.md,
    marginBottom: spacing[4],
  },
  errorText: {
    ...textStyles.caption,
    color: colors.error,
    flex: 1,
  },

  // Tips Card
  tipsCard: {
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  tipsTitle: {
    ...textStyles.captionMedium,
    color: colors.warningDark,
    flex: 1,
  },
  tipsContent: {
    marginTop: spacing[2],
  },
  tipText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },

  // Previous Result Link
  previousLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    paddingVertical: spacing[4],
  },
  previousLinkText: {
    ...textStyles.label,
    color: colors.primary[600],
  },

  // Daily Tip Card
  dailyTipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral[0],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[2],
    borderLeftWidth: 3,
    ...shadows.sm,
  },
  dailyTipIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  dailyTipContent: {
    flex: 1,
  },
  dailyTipLabel: {
    ...textStyles.captionMedium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  dailyTipText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
});
