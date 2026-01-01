import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";

import { useAnalysis } from "../../context/AnalysisContext";

export default function Upload() {
  const router = useRouter();
  const { user, setAnalysis } = useAnalysis();

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* 🔐 Force user profile first */
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
  }, [user]);

  /* 📷 Pick image */
  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  /* 🤖 Send image to backend */
  const analyze = async () => {
    if (!image) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", {
        uri: image,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      formData.append("user", JSON.stringify(user));

      const res = await fetch("http://192.168.10.6:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      await setAnalysis(data);

      router.replace("/result");
    } catch (e) {
      console.error("Analysis failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Skin Analysis</Text>
        <Text style={styles.subtitle}>
          Upload a clear front-facing photo for best results
        </Text>

        {/* IMAGE PREVIEW */}
        <Pressable style={styles.imageBox} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Text style={styles.placeholder}>
              Tap to select a photo
            </Text>
          )}
        </Pressable>

        {/* TIPS */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>📸 Photo Tips</Text>
          <Text style={styles.tip}>• Face the camera straight</Text>
          <Text style={styles.tip}>• Good natural lighting</Text>
          <Text style={styles.tip}>• No filters or makeup</Text>
        </View>

        {/* BUTTON */}
        <Pressable
          style={[
            styles.button,
            (!image || loading) && { opacity: 0.6 },
          ]}
          onPress={analyze}
          disabled={!image || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              Analyze My Photo
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/* ======================
   STYLES
====================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  imageBox: {
    height: 260,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    color: "#555",
    fontSize: 16,
  },
  tipCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  tip: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },
  button: {
    backgroundColor: "#4F46E5",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
