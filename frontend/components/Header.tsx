import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Header({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <Ionicons name="menu" size={24} />
      <Text style={styles.title}>{title}</Text>
      <Ionicons name="heart-outline" size={24} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
});
