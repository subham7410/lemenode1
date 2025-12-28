import { View, Button, Image, Text, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "expo-router";

// ✅ Configuration - Change this based on your environment
const API_URL = __DEV__ 
  ? "http://192.168.1.5:8000" // Replace with your local IP for physical devices
  : "https://your-production-url.com";

export default function Upload() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    // ✅ Request permissions first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8, // ✅ Reduced from 1 to save bandwidth
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

    if (uploading) {
      return;
    }

    setUploading(true);

    try {
      // Navigate to loading screen
      router.push("/loading");

      // Prepare form data
      const formData = new FormData();
      formData.append("image", {
        uri: image,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      // ✅ Add timeout to prevent hanging
      const response = await axios.post(
        `${API_URL}/analyze`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 second timeout
        }
      );

      // ✅ Validate response data
      if (!response.data || !response.data.face_shape) {
        throw new Error("Invalid response from server");
      }

      // Navigate to results
      const query = new URLSearchParams({
        face_shape: response.data.face_shape,
        skin_type: response.data.skin_type,
        beard_suitable: String(response.data.beard_suitable),
      }).toString();

      router.replace(`/result?${query}`);
    } catch (error) {
      console.error("Upload error:", error);
      
      // ✅ Better error messages
      let errorMessage = "Failed to analyze image. Please try again.";
      
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          errorMessage = "Request timed out. Please check your connection.";
        } else if (error.response) {
          errorMessage = error.response.data?.detail || "Server error occurred";
        } else if (error.request) {
          errorMessage = "Cannot reach server. Please check your connection.";
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
      <Text style={styles.title}>Select a photo</Text>
      
      <Button title="Pick Image" onPress={pickImage} />
      
      {image && (
        <>
          <Image source={{ uri: image }} style={styles.image} />
          <Button
            title={uploading ? "Analyzing..." : "Analyze"}
            onPress={analyzeImage}
            disabled={uploading}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
  },
});