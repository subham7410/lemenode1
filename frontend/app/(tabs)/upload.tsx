import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import { useAnalysis } from "../../context/AnalysisContext";

// ✅ Cloud Run backend URL (FINAL)
const API_URL ="https://lemenode-backend-466053387222.asia-south1.run.app";

export default function Upload() {
  const router = useRouter();
  const { user, setAnalysis, analysis } = useAnalysis();

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔒 Force user profile setup
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

  // 📁 Pick image from gallery
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

  // 📷 Take photo
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

  // 🚀 Send image to backend
  const analyze = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s

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

  // 🔁 View last result
  const viewPreviousResult = () => {
    if (analysis) router.push("/result");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Skin Analysis</Text>
        <Text style={styles.subtitle}>
          Upload a clear face photo for AI analysis
        </Text>

        {/* IMAGE PREVIEW */}
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera" size={48} color="#9CA3AF" />
              <Text style={styles.placeholderText}>
                No image selected
              </Text>
            </View>
          )}
        </View>

        {/* PICK BUTTONS */}
        <View style={styles.buttonRow}>
          <Pressable style={styles.iconButton} onPress={takePhoto}>
            <Ionicons name="camera" size={22} color="#4F46E5" />
            <Text style={styles.iconText}>Camera</Text>
          </Pressable>

          <Pressable style={styles.iconButton} onPress={pickImage}>
            <Ionicons name="images" size={22} color="#4F46E5" />
            <Text style={styles.iconText}>Gallery</Text>
          </Pressable>
        </View>

        {/* ERROR */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* PHOTO TIPS */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>📸 Photo Tips</Text>
          <Text style={styles.tip}>• Face camera directly</Text>
          <Text style={styles.tip}>• Natural lighting</Text>
          <Text style={styles.tip}>• No filters or makeup</Text>
          <Text style={styles.tip}>• Neutral expression</Text>
        </View>

        {/* ANALYZE */}
        <Pressable
          style={[
            styles.analyzeButton,
            (!image || loading) && styles.disabled,
          ]}
          onPress={analyze}
          disabled={!image || loading}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.buttonText}>Analyzing…</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Analyze My Skin</Text>
          )}
        </Pressable>

        {/* PREVIOUS */}
        {analysis && !loading && (
          <Pressable onPress={viewPreviousResult}>
            <Text style={styles.linkText}>
              View Previous Result
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7FB" },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "700", color: "#111827" },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 20,
  },
  imageContainer: {
    height: 320,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  image: { width: "100%", height: "100%" },
  placeholder: { alignItems: "center" },
  placeholderText: {
    marginTop: 10,
    fontSize: 15,
    color: "#9CA3AF",
  },
  buttonRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  iconButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconText: {
    marginTop: 6,
    fontWeight: "600",
    color: "#4F46E5",
  },
  errorBox: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorText: { color: "#DC2626", flex: 1 },
  tipCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  tipTitle: {
    fontWeight: "600",
    marginBottom: 8,
    color: "#111827",
  },
  tip: { fontSize: 14, color: "#4B5563", marginBottom: 4 },
  analyzeButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 6,
  },
  disabled: { opacity: 0.5 },
  loadingRow: { flexDirection: "row", gap: 10 },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  linkText: {
    textAlign: "center",
    marginTop: 14,
    color: "#4F46E5",
    fontWeight: "600",
  },
});
