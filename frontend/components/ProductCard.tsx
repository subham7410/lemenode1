import { View, Text, Image, Pressable, StyleSheet, Linking } from "react-native";

type Props = {
  title: string;
  price: string;
  image: string;
  link: string;
};

export default function ProductCard({ title, price, image, link }: Props) {
  return (
    <Pressable style={styles.card} onPress={() => Linking.openURL(link)}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.buy}>View Product →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
    overflow: "hidden",
  },
  image: {
    width: 90,
    height: 90,
    backgroundColor: "#eee",
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  price: {
    fontSize: 14,
    color: "#16A34A",
    fontWeight: "600",
  },
  buy: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "600",
  },
});
