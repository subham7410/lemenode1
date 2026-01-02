import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAnalysis } from "../context/AnalysisContext";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function UserInfo() {
  const { setUser, user } = useAnalysis();
  const router = useRouter();

  const [age, setAge] = useState(user.age ? String(user.age) : "");
  const [height, setHeight] = useState(user.height ? String(user.height) : "");
  const [weight, setWeight] = useState(user.weight ? String(user.weight) : "");
  const [gender, setGender] = useState<"male" | "female" | "other" | null>(
    user.gender
  );
  const [diet, setDiet] = useState<"veg" | "non-veg" | null>(user.diet);
  const [ethnicity, setEthnicity] = useState(user.ethnicity ?? "");
  const [error, setError] = useState("");

  const validateAndSave = async () => {
    // Validation
    if (!age || !height || !weight || !gender || !diet) {
      setError("Please fill all required fields (marked with *)");
      return;
    }

    const ageNum = Number(age);
    const heightNum = Number(height);
    const weightNum = Number(weight);

    if (ageNum < 13 || ageNum > 100) {
      setError("Age must be between 13 and 100");
      return;
    }

    if (heightNum < 100 || heightNum > 250) {
      setError("Height must be between 100 and 250 cm");
      return;
    }

    if (weightNum < 30 || weightNum > 300) {
      setError("Weight must be between 30 and 300 kg");
      return;
    }

    setError("");

    await setUser({
      age: ageNum,
      height: heightNum,
      weight: weightNum,
      gender,
      diet,
      ethnicity: ethnicity.trim() || null,
    });

    router.replace("/(tabs)/upload");
  };

  const isComplete = age && height && weight && gender && diet;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerSection}>
            <Ionicons name="person-circle" size={64} color="#4F46E5" />
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Help us personalize your skin care recommendations
            </Text>
          </View>

          {/* Age Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your age (13-100)"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
              maxLength={3}
            />
          </View>

          {/* Height Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Height (cm) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter height in cm (e.g., 170)"
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
              maxLength={3}
            />
          </View>

          {/* Weight Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (kg) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter weight in kg (e.g., 65)"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              maxLength={3}
            />
          </View>

          {/* Gender Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender *</Text>
            <View style={styles.optionRow}>
              {(["male", "female", "other"] as const).map((g) => (
                <Pressable
                  key={g}
                  style={[styles.option, gender === g && styles.optionActive]}
                  onPress={() => setGender(g)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      gender === g && styles.optionTextActive,
                    ]}
                  >
                    {g === "male" ? "Male" : g === "female" ? "Female" : "Other"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Diet Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Diet Preference *</Text>
            <View style={styles.optionRow}>
              {(["veg", "non-veg"] as const).map((d) => (
                <Pressable
                  key={d}
                  style={[styles.option, diet === d && styles.optionActive]}
                  onPress={() => setDiet(d)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      diet === d && styles.optionTextActive,
                    ]}
                  >
                    {d === "veg" ? "🥗 Vegetarian" : "🍗 Non-Vegetarian"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Ethnicity (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ethnicity (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Asian, Caucasian, etc."
              value={ethnicity}
              onChangeText={setEthnicity}
              autoCapitalize="words"
            />
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={24} color="#4F46E5" />
            <Text style={styles.infoText}>
              Your information is private and used only for personalized
              recommendations
            </Text>
          </View>

          {/* Continue Button */}
          <Pressable
            style={[styles.button, !isComplete && styles.buttonDisabled]}
            onPress={validateAndSave}
            disabled={!isComplete}
          >
            <Text style={styles.buttonText}>Continue to Analysis</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  optionRow: {
    flexDirection: "row",
    gap: 10,
  },
  option: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  optionActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  optionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  optionTextActive: {
    color: "#fff",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#EEF2FF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
    gap: 12,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#4338CA",
    lineHeight: 18,
  },
  button: {
    backgroundColor: "#4F46E5",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});