import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAnalysis } from "../context/AnalysisContext";
import { useState } from "react";

export default function UserInfo() {
  const { setUser, user } = useAnalysis();
  const router = useRouter();

  const [age, setAge] = useState(user.age ? String(user.age) : "");
  const [height, setHeight] = useState(user.height ? String(user.height) : "");
  const [weight, setWeight] = useState(user.weight ? String(user.weight) : "");
  const [gender, setGender] = useState<
    "male" | "female" | "other" | null
  >(user.gender);
  const [diet, setDiet] = useState<"veg" | "non-veg" | null>(
    user.diet
  );
  const [ethnicity, setEthnicity] = useState(user.ethnicity ?? "");
  const [error, setError] = useState("");

  const save = async () => {
    if (!age || !height || !weight || !gender || !diet) {
      setError("Please fill all required fields");
      return;
    }

    setError("");

    await setUser({
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      gender,
      diet,
      ethnicity,
    });

    router.replace("/(tabs)/upload");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Tell us about you</Text>
        <Text style={styles.subtitle}>
          This helps us give accurate skin, food & health advice
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Age *"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />

        <TextInput
          style={styles.input}
          placeholder="Height (cm) *"
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
        />

        <TextInput
          style={styles.input}
          placeholder="Weight (kg) *"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />

        {/* GENDER */}
        <Text style={styles.label}>Gender *</Text>
        <View style={styles.row}>
          {["male", "female", "other"].map((g) => (
            <Pressable
              key={g}
              style={[
                styles.choice,
                gender === g && styles.active,
              ]}
              onPress={() => setGender(g as any)}
            >
              <Text
                style={[
                  styles.choiceText,
                  gender === g && styles.activeText,
                ]}
              >
                {g}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* DIET */}
        <Text style={styles.label}>Diet *</Text>
        <View style={styles.row}>
          {["veg", "non-veg"].map((d) => (
            <Pressable
              key={d}
              style={[
                styles.choice,
                diet === d && styles.active,
              ]}
              onPress={() => setDiet(d as any)}
            >
              <Text
                style={[
                  styles.choiceText,
                  diet === d && styles.activeText,
                ]}
              >
                {d}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Ethnicity (optional)"
          value={ethnicity}
          onChangeText={setEthnicity}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[
            styles.button,
            (!age || !height || !weight || !gender || !diet) && {
              opacity: 0.6,
            },
          ]}
          onPress={save}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/* =====================
   STYLES
===================== */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7FB" },
  container: { padding: 20 },

  title: { fontSize: 26, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 16 },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 8,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    marginBottom: 12,
  },

  choice: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },

  active: {
    backgroundColor: "#4F46E5",
  },

  choiceText: {
    fontWeight: "600",
    textTransform: "capitalize",
  },

  activeText: {
    color: "#fff",
  },

  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },

  button: {
    backgroundColor: "#4F46E5",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
