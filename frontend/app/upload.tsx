import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  Pressable,
  useColorScheme,
  Animated,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useRouter } from "expo-router";

const API_URL = "http://192.168.10.6:8000";

export default function Upload() {
  const router = useRouter();
  const theme = useColorScheme();
  const isDark = theme === "dark";

  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  /* ================= ANIMATION ================= */
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* ================= IMAGE PICK ================= */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  /* ================= ANALYZE ================= */
  const analyzeImage = async () => {
    if (!image || uploading) return;

    setUploading(true);
    router.push("/loading");

    try {
      const formData = new FormData();
      formData.append("image", {
        uri: image,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      const res = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });

      router.replace({
        pathname: "/result",
        params: { data: JSON.stringify(res.data) },
      });
    } catch {
      router.replace("/upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0E0E10" : "#FFFFFF" },
      ]}
    >
      {/* ================= HEADER ================= */}
      <Text style={[styles.brand, { color: isDark ? "#FFF" : "#111" }]}>
        Lemenode
      </Text>
      <Text
        style={[styles.headline, { color: isDark ? "#DDD" : "#333" }]}
      >
        Personal skin insights
      </Text>
      <Text style={[styles.sub, { color: isDark ? "#AAA" : "#666" }]}>
        Understand your skin. Improve it step by step.
      </Text>

      {/* ================= FEATURE CHIPS ================= */}
      <View style={styles.chips}>
        <Chip text="Skin type" />
        <Chip text="Concerns" />
        <Chip text="Care routine" />
        <Chip text="Product help" />
      </View>

      {/* ================= ANIMATED UPLOAD ================= */}
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Pressable style={styles.uploadBox} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Text style={styles.uploadText}>📷 Upload face photo</Text>
          )}
        </Pressable>
      </Animated.View>

      {image && (
        <Button
          title={uploading ? "Analyzing..." : "Analyze Skin"}
          onPress={analyzeImage}
          disabled={uploading}
          color="#007AFF"
        />
      )}

      {/* ================= SOCIAL PROOF ================= */}
      <View style={styles.testimonial}>
        <Text style={styles.quote}>
          “This actually helped me understand what my skin needs.”
        </Text>
        <Text style={styles.author}>— Early user</Text>
      </View>

      {/* ================= LOGIN STUB ================= */}
      <Pressable style={styles.loginBox}>
        <Text style={styles.loginText}>👤 Sign in to track progress</Text>
      </Pressable>

      {/* ================= TRUST ================= */}
      <Text style={styles.trust}>
        🔒 Your photo is processed securely and not stored
      </Text>
    </View>
  );
}

/* ================= SMALL COMPONENTS ================= */

function Chip({ text }: { text: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },
  brand: {
    fontSize: 36,
    fontWeight: "800",
    marginTop: 40,
  },
  headline: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  },
  sub: {
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 20,
  },
  chip: {
    backgroundColor: "#F2F4F7",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin: 6,
  },
  chipText: {
    fontSize: 12,
    color: "#444",
  },
  uploadBox: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  uploadText: {
    fontSize: 14,
    color: "#007AFF",
    textAlign: "center",
  },
  image: {
    width: 210,
    height: 210,
    borderRadius: 105,
  },
  testimonial: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  quote: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#555",
    textAlign: "center",
  },
  author: {
    fontSize: 12,
    color: "#888",
    marginTop: 6,
    textAlign: "center",
  },
  loginBox: {
    marginTop: 30,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
  },
  loginText: {
    fontSize: 13,
    color: "#333",
  },
  trust: {
    fontSize: 11,
    color: "#888",
    marginTop: 24,
    textAlign: "center",
  },
});
