/**
 * User Info Screen - Redesigned with Lemenode Design System
 * Multi-step profile setup wizard with premium styling
 */

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAnalysis } from "../context/AnalysisContext";
import { Button } from "../components/ui";
import {
  colors,
  textStyles,
  spacing,
  radius,
  shadows,
} from "../theme";

// Selection option component
function SelectOption({
  label,
  icon,
  selected,
  onPress,
  emoji,
}: {
  label: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
  emoji?: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.selectOption,
        selected && styles.selectOptionSelected,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
      onPress={onPress}
    >
      {emoji ? (
        <Text style={styles.selectEmoji}>{emoji}</Text>
      ) : icon ? (
        <Ionicons
          name={icon as any}
          size={24}
          color={selected ? colors.primary[600] : colors.neutral[400]}
        />
      ) : null}
      <Text style={[styles.selectLabel, selected && styles.selectLabelSelected]}>
        {label}
      </Text>
      {selected && (
        <View style={styles.checkMark}>
          <Ionicons name="checkmark" size={16} color={colors.neutral[0]} />
        </View>
      )}
    </Pressable>
  );
}

// Input field with icon
function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  icon,
  suffix,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "numeric";
  icon: string;
  suffix?: string;
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Ionicons
          name={icon as any}
          size={20}
          color={colors.primary[500]}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[400]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />
        {suffix && <Text style={styles.inputSuffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

export default function UserInfo() {
  const router = useRouter();
  const { user, setUser } = useAnalysis();

  // Form state
  const [age, setAge] = useState(user.age?.toString() || "");
  const [height, setHeight] = useState(user.height?.toString() || "");
  const [weight, setWeight] = useState(user.weight?.toString() || "");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">(user.gender || "");
  const [diet, setDiet] = useState<"veg" | "non-veg" | "">(user.diet || "");
  const [ethnicity, setEthnicity] = useState(user.ethnicity || "");
  const [error, setError] = useState("");

  const validateAndSave = async () => {
    // Validation
    if (!age || !height || !weight || !gender || !diet) {
      setError("Please fill in all required fields");
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

  // Calculate BMI for preview
  const getBMI = () => {
    const h = Number(height);
    const w = Number(weight);
    if (h > 0 && w > 0) {
      const bmi = w / ((h / 100) * (h / 100));
      return bmi.toFixed(1);
    }
    return null;
  };

  const bmi = getBMI();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerIcon}>
              <Ionicons name="person" size={32} color={colors.neutral[0]} />
            </View>
            <Text style={styles.headerTitle}>Your Profile</Text>
            <Text style={styles.headerSubtitle}>
              Help us personalize your recommendations
            </Text>
          </LinearGradient>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Basic Info */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle" size={20} color={colors.primary[600]} />
                <Text style={styles.sectionTitle}>Basic Information</Text>
              </View>

              <InputField
                label="Age"
                placeholder="Enter your age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                icon="calendar"
                suffix="years"
              />

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <InputField
                    label="Height"
                    placeholder="Height"
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                    icon="resize-outline"
                    suffix="cm"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <InputField
                    label="Weight"
                    placeholder="Weight"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    icon="fitness"
                    suffix="kg"
                  />
                </View>
              </View>

              {/* BMI Preview */}
              {bmi && (
                <View style={styles.bmiPreview}>
                  <Ionicons name="speedometer" size={18} color={colors.accent[600]} />
                  <Text style={styles.bmiText}>
                    Your BMI: <Text style={styles.bmiValue}>{bmi}</Text>
                  </Text>
                </View>
              )}
            </View>

            {/* Gender */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="people" size={20} color={colors.primary[600]} />
                <Text style={styles.sectionTitle}>Gender</Text>
              </View>

              <View style={styles.optionsRow}>
                <SelectOption
                  label="Male"
                  emoji="👨"
                  selected={gender === "male"}
                  onPress={() => setGender("male")}
                />
                <SelectOption
                  label="Female"
                  emoji="👩"
                  selected={gender === "female"}
                  onPress={() => setGender("female")}
                />
                <SelectOption
                  label="Other"
                  emoji="🧑"
                  selected={gender === "other"}
                  onPress={() => setGender("other")}
                />
              </View>
            </View>

            {/* Diet */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="restaurant" size={20} color={colors.primary[600]} />
                <Text style={styles.sectionTitle}>Diet Preference</Text>
              </View>

              <View style={styles.optionsRow}>
                <SelectOption
                  label="Vegetarian"
                  emoji="🥗"
                  selected={diet === "veg"}
                  onPress={() => setDiet("veg")}
                />
                <SelectOption
                  label="Non-Vegetarian"
                  emoji="🍗"
                  selected={diet === "non-veg"}
                  onPress={() => setDiet("non-veg")}
                />
              </View>
            </View>

            {/* Ethnicity (Optional) */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="globe" size={20} color={colors.primary[600]} />
                <Text style={styles.sectionTitle}>Ethnicity</Text>
                <Text style={styles.optionalBadge}>Optional</Text>
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="earth"
                  size={20}
                  color={colors.primary[500]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., South Asian, Caucasian"
                  placeholderTextColor={colors.neutral[400]}
                  value={ethnicity}
                  onChangeText={setEthnicity}
                />
              </View>
              <Text style={styles.helperText}>
                Helps us provide more accurate skin tone analysis
              </Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="Continue to Analysis"
                onPress={validateAndSave}
                rightIcon="arrow-forward"
                fullWidth
              />
            </View>
          </View>
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
  keyboardView: {
    flex: 1,
  },
  container: {
    paddingBottom: spacing[10],
  },

  // Header
  header: {
    alignItems: "center",
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[5],
    borderBottomLeftRadius: radius["2xl"],
    borderBottomRightRadius: radius["2xl"],
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[4],
  },
  headerTitle: {
    ...textStyles.h2,
    color: colors.neutral[0],
    marginBottom: spacing[2],
  },
  headerSubtitle: {
    ...textStyles.body,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },

  // Form Section
  formSection: {
    padding: spacing[5],
    marginTop: -spacing[4],
  },

  // Section
  section: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.xl,
    padding: spacing[5],
    marginBottom: spacing[4],
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...textStyles.label,
    color: colors.text.primary,
    flex: 1,
  },
  optionalBadge: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: radius.sm,
  },

  // Input
  inputContainer: {
    marginBottom: spacing[4],
  },
  inputLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border.light,
    paddingHorizontal: spacing[4],
    height: 56,
  },
  inputIcon: {
    marginRight: spacing[3],
  },
  input: {
    flex: 1,
    ...textStyles.body,
    color: colors.text.primary,
    height: "100%",
  },
  inputSuffix: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginLeft: spacing[2],
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing[3],
  },
  inputHalf: {
    flex: 1,
  },
  helperText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[2],
  },

  // BMI Preview
  bmiPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    backgroundColor: colors.accent[50],
    padding: spacing[3],
    borderRadius: radius.md,
    marginTop: spacing[2],
  },
  bmiText: {
    ...textStyles.caption,
    color: colors.accent[700],
  },
  bmiValue: {
    fontFamily: "Inter_700Bold",
  },

  // Options Row
  optionsRow: {
    flexDirection: "row",
    gap: spacing[3],
  },
  selectOption: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border.light,
    position: "relative",
  },
  selectOptionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  selectEmoji: {
    fontSize: 28,
    marginBottom: spacing[2],
  },
  selectLabel: {
    ...textStyles.captionMedium,
    color: colors.text.secondary,
    textAlign: "center",
  },
  selectLabelSelected: {
    color: colors.primary[600],
  },
  checkMark: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
  },

  // Error Box
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    backgroundColor: colors.errorLight,
    padding: spacing[4],
    borderRadius: radius.lg,
    marginBottom: spacing[4],
  },
  errorText: {
    ...textStyles.body,
    color: colors.error,
    flex: 1,
  },

  // Button Container
  buttonContainer: {
    marginTop: spacing[4],
  },
});