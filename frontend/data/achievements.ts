/**
 * Achievements System - Gamification for user engagement
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const ACHIEVEMENTS_KEY = "@lemenode_achievements";

export type Achievement = {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    requirement: number;
    type: "analyses" | "score" | "streak" | "special";
    unlocked: boolean;
    unlockedAt?: string;
    progress: number;
};

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, "unlocked" | "unlockedAt" | "progress">[] = [
    // Analysis count achievements
    {
        id: "first_analysis",
        title: "First Step",
        description: "Complete your first skin analysis",
        icon: "sparkles",
        color: "#4F46E5",
        requirement: 1,
        type: "analyses",
    },
    {
        id: "five_analyses",
        title: "Getting Serious",
        description: "Complete 5 skin analyses",
        icon: "ribbon",
        color: "#8B5CF6",
        requirement: 5,
        type: "analyses",
    },
    {
        id: "ten_analyses",
        title: "Dedicated",
        description: "Complete 10 skin analyses",
        icon: "medal",
        color: "#F59E0B",
        requirement: 10,
        type: "analyses",
    },
    {
        id: "twentyfive_analyses",
        title: "Skin Expert",
        description: "Complete 25 skin analyses",
        icon: "trophy",
        color: "#10B981",
        requirement: 25,
        type: "analyses",
    },

    // Score achievements
    {
        id: "score_80",
        title: "Glowing!",
        description: "Achieve a score of 80 or higher",
        icon: "sunny",
        color: "#FBBF24",
        requirement: 80,
        type: "score",
    },
    {
        id: "score_90",
        title: "Radiant Skin",
        description: "Achieve a score of 90 or higher",
        icon: "star",
        color: "#F472B6",
        requirement: 90,
        type: "score",
    },

    // Streak achievements
    {
        id: "streak_3",
        title: "Consistent",
        description: "Analyze your skin 3 days in a row",
        icon: "flame",
        color: "#EF4444",
        requirement: 3,
        type: "streak",
    },
    {
        id: "streak_7",
        title: "Week Warrior",
        description: "Analyze your skin 7 days in a row",
        icon: "fitness",
        color: "#F97316",
        requirement: 7,
        type: "streak",
    },

    // Special achievements
    {
        id: "night_owl",
        title: "Night Owl",
        description: "Complete an analysis after 10 PM",
        icon: "moon",
        color: "#6366F1",
        requirement: 1,
        type: "special",
    },
    {
        id: "early_bird",
        title: "Early Bird",
        description: "Complete an analysis before 7 AM",
        icon: "sunny-outline",
        color: "#EC4899",
        requirement: 1,
        type: "special",
    },
];

/**
 * Load achievements from storage
 */
export async function loadAchievements(): Promise<Achievement[]> {
    try {
        const stored = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.log("Error loading achievements:", e);
    }

    // Initialize with default state
    return ACHIEVEMENT_DEFINITIONS.map((def) => ({
        ...def,
        unlocked: false,
        progress: 0,
    }));
}

/**
 * Save achievements to storage
 */
export async function saveAchievements(achievements: Achievement[]): Promise<void> {
    try {
        await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    } catch (e) {
        console.log("Error saving achievements:", e);
    }
}

/**
 * Check and update achievements based on new analysis
 */
export async function checkAchievements(
    analysisCount: number,
    currentScore: number,
    streakDays: number
): Promise<Achievement[]> {
    const achievements = await loadAchievements();
    const now = new Date();
    const hour = now.getHours();
    let updated = false;

    achievements.forEach((achievement) => {
        if (achievement.unlocked) return;

        let shouldUnlock = false;
        let progress = 0;

        switch (achievement.type) {
            case "analyses":
                progress = analysisCount;
                shouldUnlock = analysisCount >= achievement.requirement;
                break;
            case "score":
                progress = currentScore;
                shouldUnlock = currentScore >= achievement.requirement;
                break;
            case "streak":
                progress = streakDays;
                shouldUnlock = streakDays >= achievement.requirement;
                break;
            case "special":
                if (achievement.id === "night_owl" && hour >= 22) {
                    shouldUnlock = true;
                    progress = 1;
                }
                if (achievement.id === "early_bird" && hour < 7) {
                    shouldUnlock = true;
                    progress = 1;
                }
                break;
        }

        achievement.progress = progress;

        if (shouldUnlock && !achievement.unlocked) {
            achievement.unlocked = true;
            achievement.unlockedAt = now.toISOString();
            updated = true;
        }
    });

    if (updated) {
        await saveAchievements(achievements);
    }

    return achievements;
}

/**
 * Get count of unlocked achievements
 */
export function getUnlockedCount(achievements: Achievement[]): number {
    return achievements.filter((a) => a.unlocked).length;
}

/**
 * Calculate streak from score history
 */
export function calculateStreak(dates: string[]): number {
    if (dates.length === 0) return 0;

    const uniqueDates = [...new Set(dates.map((d) => new Date(d).toDateString()))];
    uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    // Check if most recent is today or yesterday
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
        return 0;
    }

    for (let i = 0; i < uniqueDates.length; i++) {
        const expected = new Date(Date.now() - i * 86400000).toDateString();
        if (uniqueDates[i] === expected) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}
