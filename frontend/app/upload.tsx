import { View, Button, Image, Text, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "expo-router";

// ✅ Change this to your computer's IP address
const API_URL = "http://192.168.10.6:8000";

export default function Upload() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const testConnection = async () => {
    try {
      console.log(`Testing: ${API_URL}`);
      const response = await axios.get(`${API_URL}/`, { timeout: 5000 });
      console.log("✅ SUCCESS:", response.data);
      Alert.alert(
        "Success! 🎉",
        `Backend is reachable!\n\n${JSON.stringify(response.data, null, 2)}`
      );
    } catch (error) {
      console.error("❌ FAILED:", error);
      Alert.alert(
        "Connection Failed ❌",
        `Cannot reach: ${API_URL}\n\nCheck:\n1. Backend running?\n2. Same WiFi?\n3. Firewall allowed?`
      );
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      console.log("Image selected:", result.assets[0].uri);
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      Alert.alert("No Image", "Please select an image first");
      return;
    }

    if (uploading) return;

    setUploading(true);

    try {
      console.log(`📤 Uploading to: ${API_URL}/analyze`);

      router.push("/loading");

      const formData = new FormData();
      formData.append("image", {
        uri: image,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });

      console.log("✅ SUCCESS:", response.data);

      router.replace({
        pathname: "/result",
        params: {
          data: JSON.stringify(response.data),
        },
      });
    } catch (error) {
      console.error("❌ FULL ERROR:", error);

      let errorMessage = "Failed to analyze image";

      if (axios.isAxiosError(error)) {
        console.log("Error code:", error.code);
        console.log("Error message:", error.message);
        console.log("Error response:", error.response?.data);

        if (error.code === "ECONNABORTED") {
          errorMessage =
            "Request timed out. Try with a smaller image or check your connection.";
        } else if (error.response) {
          errorMessage =
            error.response.data?.detail || `Server error: ${error.response.status}`;
        } else if (error.message === "Network Error") {
          errorMessage =
            "Cannot reach server. Check connection and ensure backend is running.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }

      Alert.alert("Error", errorMessage);
      router.replace("/upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skin Analysis</Text>
      <Text style={styles.subtitle}>Upload a clear photo of your face</Text>

      <Button
        title="🔌 Test Connection"
        onPress={testConnection}
        color="#007AFF"
      />

      <View style={styles.spacer} />

      <Button title="📷 Pick Image" onPress={pickImage} color="#5856D6" />

      {image && (
        <>
          <Image source={{ uri: image }} style={styles.image} />
          <Button
            title={uploading ? "⏳ Analyzing..." : "✨ Analyze Skin"}
            onPress={analyzeImage}
            disabled={uploading}
            color="#34C759"
          />
        </>
      )}

      <Text style={styles.info}>API: {API_URL}</Text>
      <Text style={styles.infoTip}>Ensure phone & PC on same WiFi</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  spacer: {
    height: 20,
  },
  image: {
    width: 250,
    height: 250,
    marginVertical: 20,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: "#34C759",
  },
  info: {
    position: "absolute",
    bottom: 50,
    fontSize: 10,
    color: "#999",
  },
  infoTip: {
    position: "absolute",
    bottom: 30,
    fontSize: 10,
    color: "#999",
    textAlign: "center",
  },
});