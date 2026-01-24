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
      Alert.alert("Error", err.message || "Failed to analyze food. Please try again.");
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
        {/* Header */}
        <LinearGradient
          colors={colors.gradients.food}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="nutrition" size={24} color={colors.neutral[0]} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Food Tracker</Text>
              <Text style={styles.headerSubtitle}>
                Log meals • Track calories • Get honest feedback
              </Text>
            </View>
          </View>
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
            {/* Upload Button */}
            <Pressable
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={showUploadOptions}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <ActivityIndicator color={colors.neutral[0]} size="small" />
                  <Text style={styles.uploadButtonText}>Analyzing...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="camera" size={24} color={colors.neutral[0]} />
                  <Text style={styles.uploadButtonText}>Log Your Meal</Text>
                  <Ionicons name="add-circle" size={20} color={colors.neutral[0]} />
                </>
              )}
            </Pressable>

            {/* Today's Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="flame" size={24} color={colors.error} />
                <Text style={styles.statValue}>{stats.calories}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.scoreBadge,
                    { backgroundColor: stats.mealsLogged > 0 ? getScoreColor(stats.healthScore) : colors.neutral[300] },
                  ]}
                >
                  <Text style={styles.scoreValue}>
                    {stats.mealsLogged > 0 ? stats.healthScore.toFixed(1) : "-"}
                  </Text>
                </View>
                <Text style={styles.statLabel}>Health Score</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="restaurant" size={24} color={colors.primary[500]} />
                <Text style={styles.statValue}>{stats.mealsLogged}</Text>
                <Text style={styles.statLabel}>Meals</Text>
              </View>
            </View>

            {/* Daily Summary Button */}
            {stats.mealsLogged > 0 && (
              <Pressable
                style={styles.summaryButton}
                onPress={() => router.push("/food-summary")}
              >
                <Ionicons name="bar-chart" size={20} color={colors.primary[600]} />
                <Text style={styles.summaryButtonText}>View Daily Summary</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.primary[600]} />
              </Pressable>
            )}

            {/* Today's Log */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Log</Text>
                <Text style={styles.sectionCount}>{logs.length} entries</Text>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary[500]} />
                </View>
              ) : logs.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="restaurant-outline" size={48} color={colors.neutral[300]} />
                  <Text style={styles.emptyTitle}>No meals logged yet</Text>
                  <Text style={styles.emptyText}>
                    Tap the button above to log your first meal!
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

            {/* Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons name="information-circle" size={20} color={colors.info} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>How it works</Text>
                <Text style={styles.infoText}>
                  Take a photo of your meal. Our AI will analyze the food, estimate calories and macros, and give you honest feedback about your choices.
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
    backgroundColor: colors.background.primary,
  },
  container: {
    paddingBottom: spacing[5],
  },

  // Header
  header: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing[5],
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[4],
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    ...textStyles.h3,
    color: colors.neutral[0],
    marginBottom: spacing[0.5],
  },
  headerSubtitle: {
    ...textStyles.body,
    color: "rgba(255,255,255,0.9)",
  },

  // Upload Button
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[3],
    backgroundColor: colors.primary[500],
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing[6],
    paddingVertical: spacing[4],
    borderRadius: radius.xl,
    ...shadows.md,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    ...textStyles.h4,
    color: colors.neutral[0],
  },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    gap: spacing[3],
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing[6],
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing[4],
    alignItems: "center",
    ...shadows.sm,
  },
  statValue: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginTop: spacing[2],
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  scoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreValue: {
    ...textStyles.bodyMedium,
    color: colors.neutral[0],
    fontWeight: "700",
  },

  // Summary Button
  summaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    backgroundColor: colors.primary[50],
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing[4],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: radius.lg,
  },
  summaryButtonText: {
    ...textStyles.bodyMedium,
    color: colors.primary[600],
    flex: 1,
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
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  sectionCount: {
    ...textStyles.caption,
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
    borderRadius: radius.xl,
    ...shadows.sm,
  },
  emptyTitle: {
    ...textStyles.h4,
    color: colors.text.secondary,
    marginTop: spacing[3],
  },
  emptyText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    textAlign: "center",
    marginTop: spacing[1],
  },

  // Info Card
  infoCard: {
    flexDirection: "row",
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing[6],
    padding: spacing[4],
    backgroundColor: colors.infoLight,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...textStyles.label,
    color: colors.infoDark,
    marginBottom: spacing[1],
  },
  infoText: {
    ...textStyles.caption,
    color: colors.infoDark,
    lineHeight: 20,
  },

  // Login Prompt
  loginPrompt: {
    alignItems: "center",
    padding: spacing[8],
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing[6],
    backgroundColor: colors.neutral[0],
    borderRadius: radius.xl,
    ...shadows.sm,
  },
  loginPromptTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  loginPromptText: {
    ...textStyles.body,
    color: colors.text.tertiary,
    textAlign: "center",
    marginBottom: spacing[4],
  },
  loginButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
  },
  loginButtonText: {
    ...textStyles.bodyMedium,
    color: colors.text.inverse,
  },
});