import { Redirect } from "expo-router";
import { useAnalysis } from "../context/AnalysisContext";
import { ActivityIndicator, View } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
    const { loading, user } = useAnalysis();
    const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

    useEffect(() => {
        AsyncStorage.getItem("@onboarding_complete")
            .then((completed) => setOnboardingComplete(completed === "true"))
            .catch(() => setOnboardingComplete(false));
    }, []);

    // Show loading while checking state
    if (loading || onboardingComplete === null) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FAFAFA" }}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    // First launch → onboarding
    if (!onboardingComplete) {
        return <Redirect href="/onboarding" />;
    }

    // Profile incomplete → user-info
    const profileIncomplete = !user.age || !user.gender || !user.height || !user.weight || !user.diet;
    if (profileIncomplete) {
        return <Redirect href="/user-info" />;
    }

    // Everything complete → main app
    return <Redirect href="/(tabs)/upload" />;
}
