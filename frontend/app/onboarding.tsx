/**
 * Onboarding Screen - Redesigned with Lemenode Design System
 * Premium multi-step introduction with smooth animations
 */

import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  colors,
  textStyles,
  spacing,
  radius,
  shadows,
} from "../theme";

const { width, height } = Dimensions.get("window");

// Onboarding slides data
const SLIDES = [
  {
    id: "1",
    icon: "scan",
    title: "AI Skin Analysis",
    subtitle: "Smart Detection",
    description:
      "Advanced AI analyzes your skin texture, tone, and condition to provide personalized insights.",
    gradient: colors.gradients.primary,
    iconBg: "#818CF8",
  },
  {
    id: "2",
    icon: "nutrition",
    title: "Nutrition Guide",
    subtitle: "Eat for Your Skin",
    description:
      "Get customized food recommendations based on your skin type and dietary preferences.",
    gradient: colors.gradients.food,
    iconBg: "#34D399",
  },
  {
    id: "3",
    icon: "heart",
    title: "Health Routines",
    subtitle: "Daily Habits",
    description:
      "Follow personalized skincare routines and lifestyle habits for lasting improvements.",
    gradient: colors.gradients.health,
    iconBg: "#F472B6",
  },
  {
    id: "4",
    icon: "shirt",
    title: "Style Advice",
    subtitle: "Look Your Best",
    description:
      "Discover colors and styles that complement your natural beauty and skin tone.",
    gradient: colors.gradients.style,
    iconBg: "#A78BFA",
  },
];

// Single slide component
function Slide({ item, index, scrollX }: { item: typeof SLIDES[0]; index: number; scrollX: Animated.Value }) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.8, 1, 0.8],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.slideContent, { transform: [{ scale }], opacity }]}>
        {/* Icon Circle */}
        <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
          <Ionicons name={item.icon as any} size={48} color={colors.neutral[0]} />
        </View>

        {/* Subtitle Badge */}
        <View style={styles.subtitleBadge}>
          <Text style={styles.subtitleText}>{item.subtitle}</Text>
        </View>

        {/* Title */}
        <Text style={styles.slideTitle}>{item.title}</Text>

        {/* Description */}
        <Text style={styles.slideDescription}>{item.description}</Text>
      </Animated.View>
    </View>
  );
}

// Pagination dots
function Pagination({ scrollX, data }: { scrollX: Animated.Value; data: typeof SLIDES }) {
  return (
    <View style={styles.pagination}>
      {data.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const dotOpacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              { width: dotWidth, opacity: dotOpacity },
            ]}
          />
        );
      })}
    </View>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem("@onboarding_complete", "true");
    router.replace("/user-info");
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const currentSlide = SLIDES[currentIndex];
  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <LinearGradient
      colors={currentSlide.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="sparkles" size={24} color={colors.neutral[0]} />
            <Text style={styles.logoText}>SkinGlow AI</Text>
          </View>
          {!isLastSlide && (
            <Pressable style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          )}
        </View>

        {/* Slides */}
        <Animated.FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item, index }) => (
            <Slide item={item} index={index} scrollX={scrollX} />
          )}
        />

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <Pagination scrollX={scrollX} data={SLIDES} />

          {/* Action Button */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleNext}
          >
            <Text style={styles.actionButtonText}>
              {isLastSlide ? "Get Started" : "Next"}
            </Text>
            <Ionicons
              name={isLastSlide ? "arrow-forward" : "chevron-forward"}
              size={20}
              color={currentSlide.iconBg}
            />
          </Pressable>

          {/* Progress indicator text */}
          <Text style={styles.progressText}>
            {currentIndex + 1} of {SLIDES.length}
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  logoText: {
    ...textStyles.h4,
    color: colors.neutral[0],
  },
  skipButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: radius.full,
  },
  skipText: {
    ...textStyles.captionMedium,
    color: colors.neutral[0],
  },

  // Slide
  slide: {
    width,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing[8],
  },
  slideContent: {
    alignItems: "center",
    width: "100%",
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[6],
    ...shadows.lg,
  },
  subtitleBadge: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: radius.full,
    marginBottom: spacing[4],
  },
  subtitleText: {
    ...textStyles.captionMedium,
    color: colors.neutral[0],
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  slideTitle: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: colors.neutral[0],
    textAlign: "center",
    marginBottom: spacing[4],
  },
  slideDescription: {
    ...textStyles.body,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },

  // Bottom Section
  bottomSection: {
    paddingHorizontal: spacing[8],
    paddingBottom: spacing[8],
    alignItems: "center",
  },

  // Pagination
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[0],
  },

  // Action Button
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    backgroundColor: colors.neutral[0],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    borderRadius: radius.full,
    width: "100%",
    marginBottom: spacing[4],
    ...shadows.md,
  },
  actionButtonText: {
    ...textStyles.button,
    color: colors.text.primary,
  },

  // Progress text
  progressText: {
    ...textStyles.caption,
    color: "rgba(255,255,255,0.6)",
  },
});