import { ScrollView, Text, View, StyleSheet, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAnalysis } from "../../context/AnalysisContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Profile() {
  const { user, analysis, clearAnalysis } = useAnalysis();
  const router = useRouter();

  const handleEditProfile = () => {
    router.push("/user-info");
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

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#6366F1", "#4F46E5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color="#fff" />
            </View>
          </View>
          <Text style={styles.headerTitle}>Your Profile</Text>
          {analysis && (
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>Score: {analysis.score}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Profile Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Ionicons name="calendar" size={24} color="#4F46E5" />
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{user.age || "—"} years</Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="person-outline" size={24} color="#10B981" />
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{user.gender || "—"}</Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="resize" size={24} color="#F59E0B" />
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>{user.height || "—"} cm</Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="fitness" size={24} color="#EF4444" />
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>{user.weight || "—"} kg</Text>
            </View>
          </View>

          {/* BMI Card */}
          {getBMI() && (
            <View style={styles.bmiCard}>
              <View style={styles.bmiIcon}>
                <Ionicons name="speedometer" size={24} color="#8B5CF6" />
              </View>
              <View style={styles.bmiContent}>
                <Text style={styles.bmiLabel}>Body Mass Index</Text>
                <Text style={styles.bmiValue}>{getBMI()}</Text>
              </View>
            </View>
          )}

          {/* Diet Info */}
          <View style={styles.dietCard}>
            <Ionicons name="restaurant" size={24} color="#10B981" />
            <View style={styles.dietContent}>
              <Text style={styles.dietLabel}>Diet Preference</Text>
              <Text style={styles.dietValue}>
                {user.diet === "veg" ? "🥗 Vegetarian" : "🍗 Non-Vegetarian"}
              </Text>
            </View>
          </View>

          {user.ethnicity && (
            <View style={styles.dietCard}>
              <Ionicons name="globe" size={24} color="#3B82F6" />
              <View style={styles.dietContent}>
                <Text style={styles.dietLabel}>Ethnicity</Text>
                <Text style={styles.dietValue}>{user.ethnicity}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Analysis Status */}
        {analysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Analysis</Text>
            <View style={styles.analysisCard}>
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Skin Type</Text>
                <Text style={styles.analysisValue}>{analysis.skin_type}</Text>
              </View>
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Skin Tone</Text>
                <Text style={styles.analysisValue}>{analysis.skin_tone}</Text>
              </View>
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Condition</Text>
                <Text style={styles.analysisValue}>{analysis.overall_condition}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <Pressable style={styles.actionButton} onPress={handleEditProfile}>
            <Ionicons name="create" size={24} color="#4F46E5" />
            <Text style={styles.actionText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleClearData}>
            <Ionicons name="trash" size={24} color="#EF4444" />
            <Text style={styles.actionText}>Clear Analysis Data</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          <Pressable style={styles.actionButton} onPress={() => {}}>
            <Ionicons name="help-circle" size={24} color="#10B981" />
            <Text style={styles.actionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          <Pressable style={styles.actionButton} onPress={() => {}}>
            <Ionicons name="shield-checkmark" size={24} color="#8B5CF6" />
            <Text style={styles.actionText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>SkinGlow AI v1.0.0</Text>
          <Text style={styles.appSubtext}>Made with ❤️ for healthy skin</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { paddingBottom: 20 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  scoreBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    textTransform: "capitalize",
  },
  bmiCard: {
    flexDirection: "row",
    backgroundColor: "#F5F3FF",
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    alignItems: "center",
  },
  bmiIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  bmiContent: {
    flex: 1,
  },
  bmiLabel: {
    fontSize: 13,
    color: "#5B21B6",
    marginBottom: 4,
  },
  bmiValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#5B21B6",
  },
  dietCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dietContent: {
    flex: 1,
    marginLeft: 12,
  },
  dietLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  dietValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    textTransform: "capitalize",
  },
  analysisCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  analysisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  analysisLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  analysisValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    textTransform: "capitalize",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 12,
  },
  appInfo: {
    alignItems: "center",
    marginTop: 32,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "600",
    marginBottom: 4,
  },
  appSubtext: {
    fontSize: 12,
    color: "#D1D5DB",
  },
});