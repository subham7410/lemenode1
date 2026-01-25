/**
 * Food Screen - Redesigned with Food Tracking
 * Upload photos of meals for AI analysis and tracking
 */

import { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import FoodLogCard from "../../components/FoodLogCard";
import { apiService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  colors,
  textStyles,
  spacing,
  layout,
  radius,
  shadows,
} from "../../theme";

interface FoodLog {
  id: string;
  food_name: string;
  category: "healthy" | "moderate" | "unhealthy";
  health_score: number;
  calories: number;
  macros: { protein: number; carbs: number; fat: number };
  verdict: string;
  logged_at: string;
}

interface DailyStats {
  calories: number;
  healthScore: number;
  mealsLogged: number;
}

export default function Food() {
  const router = useRouter();
  const { user } = useAuth();
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [stats, setStats] = useState<DailyStats>({ calories: 0, healthScore: 0, mealsLogged: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTodaysData = useCallback(async () => {
    // Don't fetch if not logged in
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const [logsData, summaryData] = await Promise.all([
        apiService.getFoodLogs(today),
        apiService.getDailySummary(today),
      ]);

      setLogs(logsData.logs || []);
      setStats({
        calories: summaryData.totals?.calories || 0,
        healthScore: summaryData.health_score || 0,
        mealsLogged: summaryData.meals_logged || 0,
      });
    } catch (err: any) {
      console.error("Failed to fetch food data:", err);
      // Don't show error for 401 (not logged in)
      if (err.response?.status !== 401) {
        // Silent fail for initial load, just reset to empty state
        setLogs([]);
        setStats({ calories: 0, healthScore: 0, mealsLogged: 0 });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTodaysData();
  }, [fetchTodaysData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTodaysData();
  }, [fetchTodaysData]);

  const handleLogFood = async (source: "camera" | "gallery") => {
    try {
      let result;

      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permission Required", "Camera access is needed to log food");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsEditing: true,
          aspect: [4, 3],
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permission Required", "Gallery access is needed to log food");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsEditing: true,
          aspect: [4, 3],
        });
      }

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      setUploading(true);

      const response = await apiService.logFood(result.assets[0].uri);

      if (response.success) {
        // Show the analysis result
        const analysis = response.analysis;
        Alert.alert(
          `${analysis.food_name}`,
          `Score: ${analysis.health_score}/10 • ${analysis.calories} cal\n\n${analysis.verdict}`,
          [{ text: "Got it!", style: "default" }]
        );

        // Refresh the list
        fetchTodaysData();
      }
    } catch (err: any) {
      console.error("Failed to log food:", err);
      const status = err.response?.status;
      if (status === 401) {
        Alert.alert(
          "Session Expired",
          "Please sign in again to log your meals.",
          [{ text: "OK", onPress: () => router.push("/login") }]
        );
      } else {
        Alert.alert("Error", err.message || "Failed to analyze food. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      await apiService.deleteFoodLog(logId);
      setLogs(logs.filter((log) => log.id !== logId));
      fetchTodaysData(); // Refresh stats
    } catch (err) {
      console.error("Failed to delete log:", err);
      Alert.alert("Error", "Failed to delete entry");
    }
  };

  const showUploadOptions = () => {
    Alert.alert(
      "Log Your Meal",
      "Take a photo or choose from gallery",
      [
        { text: "Cancel", style: "cancel" },
        { text: "📷 Camera", onPress: () => handleLogFood("camera") },
        { text: "🖼️ Gallery", onPress: () => handleLogFood("gallery") },
      ]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return colors.accent[500];
    if (score >= 5) return colors.warning;
    return colors.error;
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with Premium Design */}
        <LinearGradient
          colors={["#1a1a2e", "#16213e", "#0f3460"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>🍽️</Text>
          </View>
          <Text style={styles.headerTitle}>NutriTrack</Text>
          <Text style={styles.headerSubtitle}>
            AI-Powered Food Analysis
          </Text>
          <View style={styles.headerDivider} />
          <Text style={styles.headerTagline}>
            No sugar coating. Just real feedback.
          </Text>
        </LinearGradient>

        {/* Login Prompt for unauthenticated users */}
        {!user && (
          <View style={styles.loginPrompt}>
            <Ionicons name="lock-closed" size={48} color={colors.neutral[300]} />
            <Text style={styles.loginPromptTitle}>Sign In Required</Text>
            <Text style={styles.loginPromptText}>
              Please sign in to track your meals and get personalized feedback
            </Text>
            <Pressable
              style={styles.loginButton}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </Pressable>
          </View>
        )}

        {/* Main content for authenticated users */}
        {user && (
          <>
            {/* Premium Upload Button */}
            <Pressable
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={showUploadOptions}
              disabled={uploading}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.uploadButtonGradient}
              >
                {uploading ? (
                  <>
                    <ActivityIndicator color={colors.neutral[0]} size="small" />
                    <Text style={styles.uploadButtonText}>Analyzing...</Text>
                  </>
                ) : (
                  <>
                    <View style={styles.uploadIconContainer}>
                      <Ionicons name="camera" size={22} color={colors.neutral[0]} />
                    </View>
                    <View style={styles.uploadTextContainer}>
                      <Text style={styles.uploadButtonText}>Log Your Meal</Text>
                      <Text style={styles.uploadButtonSubtext}>Tap to snap or upload</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {/* Today's Stats - Premium Cards */}
            <View style={styles.statsSection}>
              <Text style={styles.statsSectionTitle}>Today's Snapshot</Text>
              <View style={styles.statsRow}>
                <LinearGradient
                  colors={["#ff6b6b", "#ee5a5a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCardGradient}
                >
                  <Ionicons name="flame" size={20} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.statValueWhite}>{stats.calories}</Text>
                  <Text style={styles.statLabelWhite}>Calories</Text>
                </LinearGradient>

                <LinearGradient
                  colors={stats.mealsLogged > 0 && stats.healthScore >= 7
                    ? ["#00c9a7", "#00b894"]
                    : stats.mealsLogged > 0 && stats.healthScore >= 4
                      ? ["#ffc107", "#ffb300"]
                      : ["#adb5bd", "#868e96"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCardGradient}
                >
                  <Text style={styles.scoreEmoji}>
                    {stats.mealsLogged > 0
                      ? stats.healthScore >= 7 ? "🌟" : stats.healthScore >= 4 ? "⚡" : "⚠️"
                      : "➖"}
                  </Text>
                  <Text style={styles.statValueWhite}>
                    {stats.mealsLogged > 0 ? stats.healthScore.toFixed(1) : "-"}
                  </Text>
                  <Text style={styles.statLabelWhite}>Health Score</Text>
                </LinearGradient>

                <LinearGradient
                  colors={["#667eea", "#5a67d8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCardGradient}
                >
                  <Ionicons name="restaurant" size={20} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.statValueWhite}>{stats.mealsLogged}</Text>
                  <Text style={styles.statLabelWhite}>Meals</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Daily Summary Button */}
            {stats.mealsLogged > 0 && (
              <Pressable
                style={styles.summaryButton}
                onPress={() => router.push("/food-summary")}
              >
                <View style={styles.summaryIconContainer}>
                  <Ionicons name="analytics" size={18} color="#667eea" />
                </View>
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryButtonTitle}>Daily Analysis</Text>
                  <Text style={styles.summaryButtonSubtext}>View detailed breakdown →</Text>
                </View>
              </Pressable>
            )}

            {/* Today's Log */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Food Journal</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>{logs.length}</Text>
                  </View>
                </View>
                <Text style={styles.sectionDate}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </Text>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary[500]} />
                </View>
              ) : logs.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="leaf-outline" size={32} color="#667eea" />
                  </View>
                  <Text style={styles.emptyTitle}>Start Your Food Journey</Text>
                  <Text style={styles.emptyText}>
                    Log your first meal to begin tracking your nutrition and get personalized insights.
                  </Text>
                </View>
              ) : (
                <View style={styles.logsList}>
                  {logs.map((log) => (
                    <FoodLogCard
                      key={log.id}
                      id={log.id}
                      foodName={log.food_name}
                      category={log.category}
                      healthScore={log.health_score}
                      calories={log.calories}
                      macros={log.macros}
                      verdict={log.verdict}
                      loggedAt={log.logged_at}
                      onDelete={handleDeleteLog}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Info Card - Subtle Design */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconBubble}>
                <Ionicons name="sparkles" size={16} color="#667eea" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Powered by AI</Text>
                <Text style={styles.infoText}>
                  Snap a photo and get instant nutritional analysis with brutally honest feedback about your food choices.
                </Text>
              </View>
            </View>

            <View style={{ height: spacing[10] }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    paddingBottom: spacing[5],
  },

  // Premium Header
  header: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing[7],
    paddingBottom: spacing[8],
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "center",
  },
  headerBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[3],
  },
  headerBadgeText: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.neutral[0],
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: spacing[1],
    letterSpacing: 0.5,
  },
  headerDivider: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: spacing[3],
    borderRadius: 1,
  },
  headerTagline: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    fontStyle: "italic",
  },

  // Upload Button
  uploadButton: {
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: -spacing[5],
    borderRadius: 16,
    overflow: "hidden",
    ...shadows.lg,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
  },
  uploadIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  uploadTextContainer: {
    flex: 1,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[0],
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },

  // Stats Section
  statsSection: {
    marginTop: spacing[6],
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  statsSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing[3],
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing[3],
  },
  statCardGradient: {
    flex: 1,
    borderRadius: 16,
    padding: spacing[4],
    alignItems: "center",
    ...shadows.sm,
  },
  statValueWhite: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.neutral[0],
    marginTop: spacing[2],
  },
  statLabelWhite: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing[1],
  },
  scoreEmoji: {
    fontSize: 20,
  },

  // Summary Button
  summaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral[0],
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing[4],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.2)",
    ...shadows.xs,
  },
  summaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryButtonTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  summaryButtonSubtext: {
    fontSize: 12,
    color: "#667eea",
    marginTop: 1,
  },

  // Section
  section: {
    marginTop: spacing[6],
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[4],
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  sectionBadge: {
    backgroundColor: "#667eea",
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: spacing[2],
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.neutral[0],
  },
  sectionDate: {
    fontSize: 12,
    color: colors.text.tertiary,
  },

  // Logs List
  logsList: {
    gap: spacing[3],
  },

  // Loading
  loadingContainer: {
    padding: spacing[8],
    alignItems: "center",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    padding: spacing[8],
    backgroundColor: colors.neutral[0],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[4],
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  emptyText: {
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: "center",
    marginTop: spacing[2],
    lineHeight: 20,
    maxWidth: 260,
  },

  // Info Card
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing[6],
    padding: spacing[4],
    backgroundColor: colors.neutral[0],
    borderRadius: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#667eea",
  },
  infoIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  infoText: {
    fontSize: 12,
    color: colors.text.tertiary,
    lineHeight: 18,
  },

  // Login Prompt
  loginPrompt: {
    alignItems: "center",
    padding: spacing[8],
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing[6],
    backgroundColor: colors.neutral[0],
    borderRadius: 20,
    ...shadows.sm,
  },
  loginPromptTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  loginPromptText: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: "center",
    marginBottom: spacing[5],
  },
  loginButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[3],
    borderRadius: 12,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.inverse,
  },
});