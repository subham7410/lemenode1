/**
 * Lemenode Design System - Shadows
 * Consistent elevation and depth
 */

import { ViewStyle } from 'react-native';

export const shadows: Record<string, ViewStyle> = {
    // No shadow
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },

    // Subtle shadow for cards
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    // Default card shadow
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },

    // Elevated elements (modals, dropdowns)
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },

    // Floating elements (FABs, popovers)
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
    },

    // Top shadow (for bottom sheets, sticky headers)
    top: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
} as const;

// Colored shadow generator for buttons
export const coloredShadow = (color: string, intensity: 'light' | 'medium' | 'strong' = 'medium'): ViewStyle => {
    const opacityMap = {
        light: 0.15,
        medium: 0.25,
        strong: 0.35,
    };

    return {
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: opacityMap[intensity],
        shadowRadius: 12,
        elevation: 8,
    };
};

// Primary button shadow
export const primaryButtonShadow = coloredShadow('#4F46E5', 'medium');

// Success button shadow
export const successButtonShadow = coloredShadow('#10B981', 'medium');

// Error button shadow
export const errorButtonShadow = coloredShadow('#EF4444', 'medium');

export type Shadows = typeof shadows;
