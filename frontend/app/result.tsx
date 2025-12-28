import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Result() {
  const { face_shape, skin_type, beard_suitable } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Analysis Result
      </Text>

      <Text>Face Shape: {face_shape}</Text>
      <Text>Skin Type: {skin_type}</Text>
      <Text>Beard Suitable: {beard_suitable}</Text>
    </View>
  );
}
