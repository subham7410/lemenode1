import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_SLIDES = [
  {
    icon: "camera",
    title: "Analyze Your Skin",
    description: "Take a photo and get instant AI-powered skin analysis with personalized recommendations",
    color: ["#4F46E5", "#7C3AED"],
  },
  {
    icon: "restaurant",
    title: "Personalized Nutrition",
    description: "Get custom food recommendations based on your skin type, age, and dietary preferences",
    color: ["#10B981", "#059669"],
  },
  {
    icon: "heart",
    title: "Daily Skincare Routine",
    description: "Follow a tailored skincare routine designed specifically for your skin needs",
    color: ["#EF4444", "#DC2626"],
  },
  {
    icon: "trending-up",
    title: "Track Your Progress",
    description: "Monitor improvements over time and adjust your routine for optimal results",
    color: ["#F59E0B", "#D97706"],
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = async () => {
  if (currentSlide < ONBOARDING_SLIDES.length - 1) {
    setCurrentSlide(currentSlide + 1);
  } else {
    await AsyncStorage.setItem("@onboarding_complete", "true");
    router.replace("/(tabs)");
  }
};

const handleSkip = async () => {
  await AsyncStorage.setItem("@onboarding_complete", "true");
  router.replace("/(tabs)");
};


  const slide = ONBOARDING_SLIDES[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={slide.color as [string, string]}
        style={styles.gradient}
      >
        {/* Skip Button */}
        {currentSlide < ONBOARDING_SLIDES.length - 1 && (
          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name={slide.icon as any} size={80} color="#fff" />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {ONBOARDING_SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentSlide < ONBOARDING_SLIDES.length - 1 ? "Next" : "Get Started"}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#4F46E5" />
        </Pressable>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  skipButton: {
    alignSelf: "flex-end",
    padding: 12,
  },
  skipText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  iconContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  activeDot: {
    width: 24,
    backgroundColor: "#fff",
  },
  nextButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  nextText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#4F46E5",
  },
});