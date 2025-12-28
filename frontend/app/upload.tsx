import { View, Button, Image, Text, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "expo-router";

// ✅ YOUR IP ADDRESS
const API_URL = "http://192.168.10.6:8000";

export default function Upload() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // ✅ Test connection first
  const testConnection = async () => {
    try {
      console.log(`Testing: ${API_URL}`);
      const response = await axios.get(`${API_URL}/`, { timeout: 5000 });
      console.log("✅ SUCCESS:", response.data);
      Alert.alert("Success! 🎉", `Backend is reachable!\n\n${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      console.error("❌ FAILED:", error);
      Alert.alert(
        "Connection Failed ❌",
        `Cannot reach: ${API_URL}\n\n` +
        `Check:\n` +
        `1. Backend running?\n` +
        `2. Same WiFi network?\n` +
        `3. Windows Firewall?`
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
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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

      const response = await axios.post(
        `${API_URL}/analyze`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        }
      );

      console.log("✅ SUCCESS:", response.data);

      const query = new URLSearchParams({
        face_shape: response.data.face_shape,
        skin_type: response.data.skin_type,
        beard_suitable: String(response.data.beard_suitable),
      }).toString();

      router.replace(`/result?${query}`);
    } catch (error) {
      console.error("❌ ERROR:", error);
      
      let errorMessage = "Failed to analyze image";
      
      if (axios.isAxiosError(error)) {
        if (error.message === "Network Error") {
          errorMessage = 
            `Network Error!\n\n` +
            `Backend: ${API_URL}\n\n` +
            `Checklist:\n` +
            `✓ Backend running?\n` +
            `✓ Same WiFi?\n` +
            `✓ Firewall allowed?`;
        } else if (error.response) {
          errorMessage = error.response.data?.detail || "Server error";
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
      <Text style={styles.title}>Lemenode1 Analyzer</Text>
      
      <Button 
        title="🔌 Test Connection" 
        onPress={testConnection}
        color="#007AFF"
      />
      
      <View style={styles.spacer} />
      
      <Button title="📷 Pick Image" onPress={pickImage} />
      
      {image && (
        <>
          <Image source={{ uri: image }} style={styles.image} />
          <Button
            title={uploading ? "⏳ Analyzing..." : "✨ Analyze"}
            onPress={analyzeImage}
            disabled={uploading}
            color="#34C759"
          />
        </>
      )}
      
      <Text style={styles.info}>API: {API_URL}</Text>
      <Text style={styles.info}>Make sure phone & PC on same WiFi!</Text>
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  spacer: {
    height: 20,
  },
  image: {
    width: 250,
    height: 250,
    marginVertical: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  info: {
    position: "absolute",
    bottom: 40,
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
});