import { ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAnalysis } from "../../context/AnalysisContext";
import { Ionicons } from "@expo/vector-icons";

export default function Health() {
  const { analysis } = useAnalysis();

  const dailyHabits = analysis?.health?.daily_habits ?? [];
  const routine = analysis?.health?.routine ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={["#EF4444", "#DC2626"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerIcon}>
            <Ionicons name="heart" size={32} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Health & Skincare</Text>
          <Text style={styles.headerSubtitle}>
            Your personalized routine for radiant skin
          </Text>
        </LinearGradient>

        {/* Daily Habits Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconBadge}>
              <Ionicons name="sunny" size={24} color="#F59E0B" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Daily Habits</Text>
              <Text style={styles.sectionSubtitle}>
                Small changes that make a big difference
              </Text>
            </View>
          </View>

          {dailyHabits.length > 0 ? (
            dailyHabits.map((item: string, i: number) => (
              <View key={i} style={styles.habitCard}>
                <View style={styles.habitNumber}>
                  <Text style={styles.habitNumberText}>{i + 1}</Text>
                </View>
                <View style={styles.habitContent}>
                  <Text style={styles.habitText}>{item}</Text>
                  <View style={styles.habitCheckbox}>
                    <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="time-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                Complete your analysis for personalized daily habits
              </Text>
            </View>
          )}
        </View>

        {/* Routine Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBadge, styles.iconBadgePurple]}>
              <Ionicons name="sparkles" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Skincare Routine</Text>
              <Text style={styles.sectionSubtitle}>
                Follow consistently for best results
              </Text>
            </View>
          </View>

          {routine.length > 0 ? (
            <View style={styles.routineContainer}>
              {routine.map((item: string, i: number) => {
                const isAM = item.toLowerCase().includes("morning") || item.toLowerCase().includes("am");
                const isPM = item.toLowerCase().includes("evening") || item.toLowerCase().includes("pm") || item.toLowerCase().includes("night");
                const isWeekly = item.toLowerCase().includes("week");
                const isMonthly = item.toLowerCase().includes("month");

                return (
                  <View key={i} style={styles.routineCard}>
                    <LinearGradient
                      colors={
                        isAM ? ["#FBBF24", "#F59E0B"] :
                        isPM ? ["#8B5CF6", "#7C3AED"] :
                        isWeekly ? ["#10B981", "#059669"] :
                        ["#3B82F6", "#2563EB"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.routineGradient}
                    >
                      <Ionicons 
                        name={
                          isAM ? "sunny" :
                          isPM ? "moon" :
                          isWeekly ? "calendar" :
                          "calendar-outline"
                        }
                        size={24}
                        color="#fff"
                      />
                    </LinearGradient>
                    <View style={styles.routineContent}>
                      <Text style={styles.routineLabel}>
                        {isAM ? "Morning" :
                         isPM ? "Evening" :
                         isWeekly ? "Weekly" :
                         isMonthly ? "Monthly" : "Routine"}
                      </Text>
                      <Text style={styles.routineText}>{item}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="water-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                Get your personalized skincare routine
              </Text>
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="bulb" size={24} color="#F59E0B" />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Why consistency matters</Text>
            <Text style={styles.infoText}>
              Skin cells regenerate every 28 days. Following your routine for 2-4 weeks will show visible improvements in texture, tone, and clarity.
            </Text>
          </View>
        </View>

        {/* Progress Tracker */}
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Track Your Progress</Text>
          <View style={styles.progressCards}>
            <View style={styles.progressCard}>
              <LinearGradient
                colors={["#3B82F6", "#2563EB"]}
                style={styles.progressGradient}
              >
                <Ionicons name="calendar" size={28} color="#fff" />
                <Text style={styles.progressNumber}>7</Text>
                <Text style={styles.progressLabel}>Days Streak</Text>
              </LinearGradient>
            </View>
            <View style={styles.progressCard}>
              <LinearGradient
                colors={["#10B981", "#059669"]}
                style={styles.progressGradient}
              >
                <Ionicons name="checkmark-done" size={28} color="#fff" />
                <Text style={styles.progressNumber}>85%</Text>
                <Text style={styles.progressLabel}>Completed</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: "#F9FAFB" 
  },
  container: { 
    paddingBottom: 20 
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconBadgePurple: {
    backgroundColor: "#EDE9FE",
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  habitCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  habitNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  habitNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3B82F6",
  },
  habitContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  habitText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  habitCheckbox: {
    marginLeft: 8,
  },
  routineContainer: {
    gap: 12,
  },
  routineCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  routineGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  routineContent: {
    flex: 1,
  },
  routineLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  routineText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 12,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },
  progressSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  progressCards: {
    flexDirection: "row",
    gap: 12,
  },
  progressCard: {
    flex: 1,
  },
  progressGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  progressNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginVertical: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
});