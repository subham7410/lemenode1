/**
 * Lemenode Design System - Color Palette
 * "Clean Luxe" - Scientific precision meets approachable wellness
 */

export const colors = {
    // Primary - Indigo (Trust + Premium)
    primary: {
        50: '#EEF2FF',
        100: '#E0E7FF',
        200: '#C7D2FE',
        300: '#A5B4FC',
        400: '#818CF8',
        500: '#6366F1', // Main brand color
        600: '#4F46E5',
        700: '#4338CA',
        800: '#3730A3',
        900: '#312E81',
    },

    // Accent - Emerald (Health + Growth)
    accent: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        200: '#A7F3D0',
        300: '#6EE7B7',
        400: '#34D399',
        500: '#10B981', // Success/positive
        600: '#059669',
        700: '#047857',
        800: '#065F46',
        900: '#064E3B',
    },

    // Neutrals - Warm gray for softer feel
    neutral: {
        0: '#FFFFFF',
        50: '#FAFAFA',
        100: '#F5F5F5',
        200: '#E5E5E5',
        300: '#D4D4D4',
        400: '#A3A3A3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
    },

    // Semantic colors
    error: '#EF4444',
    errorLight: '#FEE2E2',
    errorDark: '#DC2626',

    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    warningDark: '#D97706',

    success: '#10B981',
    successLight: '#D1FAE5',
    successDark: '#059669',

    info: '#3B82F6',
    infoLight: '#DBEAFE',
    infoDark: '#2563EB',

    // Feature-specific gradients
    gradients: {
        primary: ['#6366F1', '#4F46E5'] as const,
        health: ['#EF4444', '#DC2626'] as const,
        food: ['#10B981', '#059669'] as const,
        style: ['#8B5CF6', '#7C3AED'] as const,
        gold: ['#F59E0B', '#D97706'] as const,
        onboarding: {
            analyze: ['#4F46E5', '#7C3AED'] as const,
            nutrition: ['#10B981', '#059669'] as const,
            skincare: ['#EF4444', '#DC2626'] as const,
            progress: ['#F59E0B', '#D97706'] as const,
        },
    },

    // Backgrounds
    background: {
        primary: '#FAFAFA',
        secondary: '#FFFFFF',
        elevated: '#FFFFFF',
    },

    // Text colors
    text: {
        primary: '#171717',
        secondary: '#525252',
        tertiary: '#737373',
        disabled: '#A3A3A3',
        inverse: '#FFFFFF',
    },

    // Border colors
    border: {
        light: '#E5E5E5',
        medium: '#D4D4D4',
        dark: '#A3A3A3',
        focus: '#6366F1',
    },
} as const;

// Score color helper
export const getScoreColor = (score: number): string => {
    if (score >= 85) return colors.accent[500];
    if (score >= 75) return colors.info;
    if (score >= 65) return colors.warning;
    return colors.error;
};

// Score label helper
export const getScoreLabel = (score: number): string => {
    if (score >= 85) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 65) return 'Fair';
    return 'Needs Care';
};

export type ColorPalette = typeof colors;
