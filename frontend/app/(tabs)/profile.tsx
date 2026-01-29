/**
 * Profile Screen - Redesigned with Lemenode Design System
 * User profile with stats, settings, and analysis history
 */

import { ScrollView, Text, View, StyleSheet, Pressable, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAnalysis } from "../../context/AnalysisContext";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  colors,
  textStyles,
  spacing,
  layout,
  radius,
  shadows,
  getScoreColor,
  getScoreLabel,
} from "../../theme";
import { StreakBadge } from "../../components/StreakBadge";
import Constants from "expo-constants";

const APP_VERSION = Constants.expoConfig?.version || "2.4.0";

// Stat card component
interface StatCardProps {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  label: string;
  value: string;
}

function StatCard({ icon, iconColor, iconBgColor, label, value }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: iconBgColor }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

// Action row component with gradient icon
interface ActionRowProps {
  icon: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  destructive?: boolean;
}

// Icon gradient mapping for visual variety
const iconGradients: Record<string, [string, string]> = {
  "analytics-outline": ["#10b981", "#059669"],
  "trophy-outline": ["#f59e0b", "#d97706"],
  "notifications-outline": ["#8B5CF6", "#7C3AED"],
  "create-outline": ["#3b82f6", "#2563eb"],
  "chatbubble-ellipses-outline": ["#06b6d4", "#0891b2"],
  "shield-checkmark-outline": ["#6366f1", "#4f46e5"],
  "trash-outline": ["#ef4444", "#dc2626"],
  "log-out-outline": ["#f43f5e", "#e11d48"],
};

function ActionRow({ icon, iconColor, title, subtitle, onPress, destructive }: ActionRowProps) {
  const gradient = iconGradients[icon] || ["#667eea", "#764ba2"];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionRow,
        pressed && styles.actionRowPressed,
      ]}
      onPress={onPress}
    >
      <LinearGradient
        colors={destructive ? ["#fecaca", "#fee2e2"] : gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.actionIcon}
      >
        <Ionicons name={icon as any} size={20} color={destructive ? colors.error : colors.neutral[0]} />
      </LinearGradient>
      <View style={styles.actionContent}>
        <Text style={[styles.actionTitle, destructive && styles.actionTitleDestructive]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.actionSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.actionArrow}>
        <Ionicons name="chevron-forward" size={16} color={colors.neutral[400]} />
      </View>
    </Pressable>
  );
}

export default function Profile() {
  const { user, analysis, clearAnalysis } = useAnalysis();
  const { user: authUser, isAuthenticated, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();

  const handleEditProfile = () => {
    router.push("/user-info");
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e: any) {
      Alert.alert("Sign In Failed", e.message || "Please try again");
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            Alert.alert("Success", "You have been signed out");
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear Analysis Data",
      "This will remove your current analysis results. Your profile will remain saved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearAnalysis();
            Alert.alert("Success", "Analysis data cleared");
          },
        },
      ]
    );
  };

  const getBMI = () => {
    if (!user.height || !user.weight) return null;
    const heightM = user.height / 100;
    const bmi = user.weight / (heightM * heightM);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number): { label: string; color: string } => {
    if (bmi < 18.5) return { label: "Underweight", color: colors.info };
    if (bmi < 25) return { label: "Normal", color: colors.accent[500] };
    if (bmi < 30) return { label: "Overweight", color: colors.warning };
    return { label: "Obese", color: colors.error };
  };

  // Helper to extract score (handles both old number format and new object format)
  const getScoreValue = (scoreData: any): number | null => {
    if (typeof scoreData === 'number') return scoreData;
    if (typeof scoreData === 'object' && scoreData?.total) return scoreData.total;
    return null;
  };

  const score = analysis ? getScoreValue(analysis.score) : null;
  const bmi = getBMI();
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Premium Header with User Info */}
        <LinearGradient
          colors={["#1a1a2e", "#16213e", "#0f3460"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.avatarContainer}>
            {authUser?.photo_url ? (
              <Image source={{ uri: authUser.photo_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={32} color={colors.neutral[0]} />
              </View>
            )}
            {score && (
              <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(score) }]}>
                <Text style={styles.scoreText}>{score}</Text>
              </View>
            )}
          </View>
          <Text style={styles.headerTitle}>
            {authUser?.display_name || "Guest User"}
          </Text>
          {authUser?.email && (
            <Text style={styles.headerEmail}>{authUser.email}</Text>
          )}
          {score && (
            <View style={styles.scoreStatus}>
              <Text style={styles.scoreStatusText}>Skin Score: {getScoreLabel(score)}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Compact Stats Row */}
        <View style={styles.compactStats}>
          <View style={styles.compactStatItem}>
            <Ionicons name="calendar" size={16} color={colors.primary[500]} />
            <Text style={styles.compactStatValue}>{user.age || "—"}</Text>
            <Text style={styles.compactStatLabel}>yrs</Text>
          </View>
          <View style={styles.compactStatDivider} />
          <View style={styles.compactStatItem}>
            <Ionicons name="person" size={16} color={colors.accent[500]} />
            <Text style={styles.compactStatValue}>
              {user.gender ? user.gender.charAt(0).toUpperCase() : "—"}
            </Text>
          </View>
          <View style={styles.compactStatDivider} />
          <View style={styles.compactStatItem}>
            <Ionicons name="resize" size={16} color={colors.warning} />
            <Text style={styles.compactStatValue}>{user.height || "—"}</Text>
            <Text style={styles.compactStatLabel}>cm</Text>
          </View>
          <View style={styles.compactStatDivider} />
          <View style={styles.compactStatItem}>
            <Ionicons name="fitness" size={16} color={colors.error} />
            <Text style={styles.compactStatValue}>{user.weight || "—"}</Text>
            <Text style={styles.compactStatLabel}>kg</Text>
          </View>
          {bmi && (
            <>
              <View style={styles.compactStatDivider} />
              <View style={styles.compactStatItem}>
                <Ionicons name="speedometer" size={16} color="#8B5CF6" />
                <Text style={styles.compactStatValue}>{bmi}</Text>
                <View style={[styles.bmiMiniTag, { backgroundColor: bmiCategory?.color }]}>
                  <Text style={styles.bmiMiniText}>{bmiCategory?.label}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Streak Section */}
        {authUser?.current_streak && authUser.current_streak > 0 ? (
          <View style={styles.streakSection}>
            <StreakBadge
              currentStreak={authUser.current_streak}
              longestStreak={authUser.longest_streak}
            />
          </View>
        ) : null}

        {/* Diet & Ethnicity */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: colors.accent[100] }]}>
              <Ionicons name="restaurant" size={20} color={colors.accent[600]} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Diet Preference</Text>
              <Text style={styles.infoValue}>
                {user.diet === "veg" ? "🥗 Vegetarian" : "🍗 Non-Vegetarian"}
              </Text>
            </View>
          </View>
          {user.ethnicity && (
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: colors.infoLight }]}>
                <Ionicons name="globe" size={20} color={colors.info} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ethnicity</Text>
                <Text style={styles.infoValue}>{user.ethnicity}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Current Analysis */}
        {
          analysis && (
            <View style={styles.analysisSection}>
              <Text style={styles.sectionTitle}>Current Analysis</Text>
              <View style={styles.analysisCard}>
                <View style={styles.analysisRow}>
                  <Text style={styles.analysisLabel}>Skin Type</Text>
                  <Text style={styles.analysisValue}>{analysis.skin_type || "—"}</Text>
                </View>
                <View style={styles.analysisDivider} />
                <View style={styles.analysisRow}>
                  <Text style={styles.analysisLabel}>Skin Tone</Text>
                  <Text style={styles.analysisValue}>{analysis.skin_tone || "—"}</Text>
                </View>
                <View style={styles.analysisDivider} />
                <View style={styles.analysisRow}>
                  <Text style={styles.analysisLabel}>Condition</Text>
                  <Text style={styles.analysisValue}>{analysis.overall_condition || "—"}</Text>
                </View>
              </View>
            </View>
          )
        }

        {/* Account Section */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.actionsCard}>
            {isAuthenticated ? (
              <>
                <View style={styles.accountRow}>
                  {authUser?.photo_url ? (
                    <Image source={{ uri: authUser.photo_url }} style={styles.accountAvatar} />
                  ) : (
                    <View style={[styles.accountAvatar, styles.accountAvatarPlaceholder]}>
                      <Ionicons name="person" size={20} color={colors.neutral[400]} />
                    </View>
                  )}
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{authUser?.display_name || "Signed In"}</Text>
                    <Text style={styles.accountEmail}>{authUser?.email}</Text>
                    <View style={styles.tierBadge}>
                      <Ionicons
                        name={authUser?.tier === "pro" ? "star" : authUser?.tier === "unlimited" ? "diamond" : "person"}
                        size={12}
                        color={colors.neutral[0]}
                      />
                      <Text style={styles.tierText}>{authUser?.tier?.toUpperCase() || "FREE"}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.actionDivider} />
                <ActionRow
                  icon="log-out-outline"
                  iconColor={colors.error}
                  title="Sign Out"
                  subtitle="Sign out of your account"
                  onPress={handleSignOut}
                  destructive
                />
              </>
            ) : (
              <View style={{ padding: spacing[4], alignItems: "center" }}>
                <Ionicons name="person-circle-outline" size={48} color={colors.primary[200]} />
                <Text style={{ ...textStyles.bodyMedium, color: colors.text.secondary, marginTop: spacing[2] }}>
                  Guest Mode Active
                </Text>
                <Text style={{ ...textStyles.caption, color: colors.text.tertiary, marginTop: spacing[1], textAlign: 'center' }}>
                  Sign in features coming in next update.
                  Your scans are saved on this device.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.actionsCard}>
            <ActionRow
              icon="analytics-outline"
              iconColor={colors.accent[600]}
              title="Progress Tracker"
              subtitle="View your skin score history"
              onPress={() => router.push("/progress-tracker")}
            />
            <View style={styles.actionDivider} />
            <ActionRow
              icon="trophy-outline"
              iconColor="#FBBF24"
              title="Achievements"
              subtitle="Earn badges and track milestones"
              onPress={() => router.push("/achievements")}
            />
            <View style={styles.actionDivider} />
            <ActionRow
              icon="notifications-outline"
              iconColor="#8B5CF6"
              title="Reminders"
              subtitle="Set skincare routine reminders"
              onPress={() => router.push("/reminders")}
            />
            <View style={styles.actionDivider} />
            <ActionRow
              icon="create-outline"
              iconColor={colors.primary[600]}
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={handleEditProfile}
            />
            <View style={styles.actionDivider} />
            <ActionRow
              icon="chatbubble-ellipses-outline"
              iconColor={colors.accent[600]}
              title="Send Feedback"
              subtitle="Report bugs or suggest features"
              onPress={() => router.push("/feedback")}
            />
            <View style={styles.actionDivider} />
            <ActionRow
              icon="shield-checkmark-outline"
              iconColor="#8B5CF6"
              title="Privacy Policy"
              subtitle="How we protect your data"
              onPress={() => router.push("/privacy-policy")}
            />
            <View style={styles.actionDivider} />
            <ActionRow
              icon="trash-outline"
              iconColor={colors.error}
              title="Clear Analysis Data"
              onPress={handleClearData}
              destructive
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.appLogo}>
            <Ionicons name="sparkles" size={24} color={colors.primary[500]} />
          </View>
          <Text style={styles.appName}>Lemenode</Text>
          <View style={styles.versionRow}>
            <Text style={styles.appVersion}>Version {APP_VERSION}</Text>
            <View style={styles.updateBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.accent[500]} />
              <Text style={styles.updateBadgeText}>Up to date</Text>
            </View>
          </View>
          <Text style={styles.appTagline}>Made with ❤️ for healthy skin</Text>
        </View>

        <View style={{ height: spacing[10] }} />
      </ScrollView >
    </SafeAreaView >
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
    alignItems: "center",
    paddingVertical: spacing[8],
    paddingHorizontal: layout.screenPaddingHorizontal,
    borderBottomLeftRadius: radius["2xl"],
    borderBottomRightRadius: radius["2xl"],
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing[4],
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.neutral[0],
  },
  scoreBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.neutral[0],
  },
  scoreText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: colors.neutral[0],
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.neutral[0],
    marginBottom: spacing[1],
  },
  headerEmail: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginBottom: spacing[3],
  },
  scoreStatus: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: radius.full,
  },
  scoreStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[0],
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.neutral[0],
  },

  // Compact Stats Row
  compactStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral[0],
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: -spacing[5],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 16,
    gap: spacing[2],
    ...shadows.md,
  },
  compactStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  compactStatValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
  compactStatLabel: {
    fontSize: 10,
    color: colors.text.tertiary,
  },
  compactStatDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border.light,
  },
  bmiMiniTag: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: spacing[1],
  },
  bmiMiniText: {
    fontSize: 9,
    fontWeight: "600",
    color: colors.neutral[0],
  },

  // Stats Grid (kept for reference)
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginTop: -spacing[6],
    gap: spacing[3],
  },
  statCard: {
    width: "47%",
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing[3],
    alignItems: "center",
    ...shadows.sm,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[2],
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginBottom: spacing[0.5],
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    textTransform: "capitalize",
  },

  // Streak Section
  streakSection: {
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing[4],
  },

  // BMI Card
  bmiCard: {
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing[5],
    backgroundColor: "#F5F3FF",
    borderRadius: radius.xl,
    padding: spacing[5],
    ...shadows.sm,
  },
  bmiContent: {
    marginBottom: spacing[4],
  },
  bmiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  bmiTitle: {
    ...textStyles.label,
    color: "#5B21B6",
  },
  bmiValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  bmiValue: {
    fontSize: 36,
    fontFamily: "Inter_900Black",
    color: "#5B21B6",
  },
  bmiCategoryBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  bmiCategoryText: {
    ...textStyles.captionMedium,
    color: colors.neutral[0],
  },
  bmiScale: {
    paddingTop: spacing[2],
  },
  bmiScaleBar: {
    height: 8,
    backgroundColor: "#E9D5FF",
    borderRadius: radius.full,
    position: "relative",
  },
  bmiIndicator: {
    position: "absolute",
    top: -4,
    width: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: "#8B5CF6",
    borderWidth: 3,
    borderColor: colors.neutral[0],
    marginLeft: -8,
  },
  bmiLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing[2],
    paddingHorizontal: spacing[2],
  },
  bmiLabel: {
    ...textStyles.caption,
    color: "#7C3AED",
    fontSize: 11,
  },

  // Info Section
  infoSection: {
    marginTop: spacing[5],
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing[3],
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing[4],
    ...shadows.sm,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing[0.5],
  },
  infoValue: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
  },

  // Analysis Section
  analysisSection: {
    marginTop: spacing[6],
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  analysisCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    ...shadows.sm,
    overflow: "hidden",
  },
  analysisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing[4],
  },
  analysisLabel: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  analysisValue: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    textTransform: "capitalize",
  },
  analysisDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing[4],
  },

  // Actions Section
  actionsSection: {
    marginTop: spacing[6],
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  actionsCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    ...shadows.sm,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing[4],
  },
  actionRowPressed: {
    backgroundColor: colors.neutral[50],
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  actionTitleDestructive: {
    color: colors.error,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: spacing[0.5],
  },
  actionArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: spacing[16],
  },

  // App Info
  appInfo: {
    alignItems: "center",
    marginTop: spacing[10],
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  appLogo: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[3],
  },
  appName: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  appVersion: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  appTagline: {
    ...textStyles.caption,
    color: colors.text.disabled,
  },
  versionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  updateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
    backgroundColor: colors.accent[50],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  updateBadgeText: {
    ...textStyles.caption,
    color: colors.accent[600],
    fontSize: 10,
  },

  // Account Section
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing[4],
  },
  accountAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing[3],
  },
  accountAvatarPlaceholder: {
    backgroundColor: colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
  },
  accountEmail: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[0.5],
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: radius.full,
    marginTop: spacing[2],
    alignSelf: "flex-start",
  },
  tierText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.neutral[0],
  },
});