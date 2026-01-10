/**
 * Daily Skin Tips - Curated tips database
 * Rotating tips based on day of year for variety
 */

export type SkinTip = {
    id: number;
    category: "hydration" | "nutrition" | "lifestyle" | "protection" | "routine";
    title: string;
    tip: string;
    icon: string;
    color: string;
};

export const SKIN_TIPS: SkinTip[] = [
    // Hydration tips
    {
        id: 1,
        category: "hydration",
        title: "Water is Key",
        tip: "Drink at least 8 glasses of water daily. Hydrated skin looks plumper and more radiant.",
        icon: "water",
        color: "#3B82F6",
    },
    {
        id: 2,
        category: "hydration",
        title: "Moisturize Damp Skin",
        tip: "Apply moisturizer right after washing your face while still damp to lock in moisture.",
        icon: "water-outline",
        color: "#06B6D4",
    },
    {
        id: 3,
        category: "hydration",
        title: "Humidifier Help",
        tip: "Use a humidifier in dry weather to prevent skin from losing moisture overnight.",
        icon: "cloud",
        color: "#0EA5E9",
    },

    // Nutrition tips
    {
        id: 4,
        category: "nutrition",
        title: "Vitamin C Boost",
        tip: "Eat citrus fruits, bell peppers, and berries for vitamin C which helps produce collagen.",
        icon: "nutrition",
        color: "#F97316",
    },
    {
        id: 5,
        category: "nutrition",
        title: "Omega-3 Glow",
        tip: "Include salmon, walnuts, or flaxseeds for omega-3 fatty acids that reduce inflammation.",
        icon: "fish",
        color: "#EAB308",
    },
    {
        id: 6,
        category: "nutrition",
        title: "Antioxidant Power",
        tip: "Green tea, dark chocolate, and berries are rich in antioxidants that fight skin aging.",
        icon: "leaf",
        color: "#22C55E",
    },
    {
        id: 7,
        category: "nutrition",
        title: "Limit Sugar",
        tip: "Excess sugar can cause glycation, leading to wrinkles and dull skin. Opt for natural sweeteners.",
        icon: "warning",
        color: "#EF4444",
    },

    // Lifestyle tips
    {
        id: 8,
        category: "lifestyle",
        title: "Beauty Sleep",
        tip: "Aim for 7-9 hours of sleep. Your skin repairs itself at night, producing collagen and increasing blood flow.",
        icon: "moon",
        color: "#8B5CF6",
    },
    {
        id: 9,
        category: "lifestyle",
        title: "Stress Less",
        tip: "High stress increases cortisol, leading to breakouts. Try meditation or deep breathing daily.",
        icon: "heart",
        color: "#EC4899",
    },
    {
        id: 10,
        category: "lifestyle",
        title: "Exercise Glow",
        tip: "Regular exercise increases blood flow, nourishing skin cells and carrying away waste products.",
        icon: "fitness",
        color: "#10B981",
    },
    {
        id: 11,
        category: "lifestyle",
        title: "Change Pillowcases",
        tip: "Change your pillowcase every few days to prevent bacteria and oil buildup that causes breakouts.",
        icon: "bed",
        color: "#6366F1",
    },

    // Protection tips
    {
        id: 12,
        category: "protection",
        title: "Sunscreen Daily",
        tip: "Apply SPF 30+ sunscreen every day, even when cloudy. UV rays cause 80% of visible skin aging.",
        icon: "sunny",
        color: "#FBBF24",
    },
    {
        id: 13,
        category: "protection",
        title: "Reapply Often",
        tip: "Reapply sunscreen every 2 hours when outdoors, especially after swimming or sweating.",
        icon: "refresh",
        color: "#F59E0B",
    },
    {
        id: 14,
        category: "protection",
        title: "Blue Light Care",
        tip: "Screen time emits blue light. Consider a blue light screen protector or protective skincare.",
        icon: "phone-portrait",
        color: "#3B82F6",
    },

    // Routine tips
    {
        id: 15,
        category: "routine",
        title: "Gentle Cleansing",
        tip: "Use a gentle cleanser and avoid hot water. Harsh cleansing strips natural oils and damages your skin barrier.",
        icon: "sparkles",
        color: "#14B8A6",
    },
    {
        id: 16,
        category: "routine",
        title: "Pat, Don't Rub",
        tip: "Pat your face dry with a clean towel instead of rubbing. This prevents irritation and stretching.",
        icon: "hand-right",
        color: "#A855F7",
    },
    {
        id: 17,
        category: "routine",
        title: "Consistency Wins",
        tip: "Stick to your skincare routine for at least 4-6 weeks before expecting visible results.",
        icon: "calendar",
        color: "#6366F1",
    },
    {
        id: 18,
        category: "routine",
        title: "Less is More",
        tip: "Don't overload your skin with products. A simple routine is often more effective.",
        icon: "remove-circle",
        color: "#84CC16",
    },
    {
        id: 19,
        category: "routine",
        title: "Night Serum",
        tip: "Apply serums at night when your skin is most receptive to active ingredients.",
        icon: "moon",
        color: "#7C3AED",
    },
    {
        id: 20,
        category: "routine",
        title: "Eye Cream First",
        tip: "Apply eye cream before moisturizer to ensure the delicate eye area gets proper hydration.",
        icon: "eye",
        color: "#0EA5E9",
    },
];

/**
 * Get the tip of the day based on current date
 * Changes daily for variety
 */
export function getTipOfTheDay(): SkinTip {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    return SKIN_TIPS[dayOfYear % SKIN_TIPS.length];
}

/**
 * Get tips filtered by category
 */
export function getTipsByCategory(category: SkinTip["category"]): SkinTip[] {
    return SKIN_TIPS.filter((tip) => tip.category === category);
}

/**
 * Get a random tip
 */
export function getRandomTip(): SkinTip {
    return SKIN_TIPS[Math.floor(Math.random() * SKIN_TIPS.length)];
}
