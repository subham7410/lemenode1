/**
 * Lemenode Design System - Typography
 * Uses Inter font family for modern, readable text
 */

import { TextStyle } from 'react-native';

// Font family names (after loading via expo-google-fonts)
export const fontFamily = {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    black: 'Inter_900Black',
} as const;

// Type scale (in pixels)
export const fontSize = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
} as const;

// Line heights
export const lineHeight = {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
} as const;

// Letter spacing
export const letterSpacing = {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6,
} as const;

// Preset text styles for consistent usage
export const textStyles: Record<string, TextStyle> = {
    // Headings
    h1: {
        fontSize: fontSize['4xl'],
        fontFamily: fontFamily.black,
        lineHeight: fontSize['4xl'] * lineHeight.tight,
        letterSpacing: letterSpacing.tight,
    },
    h2: {
        fontSize: fontSize['3xl'],
        fontFamily: fontFamily.bold,
        lineHeight: fontSize['3xl'] * lineHeight.tight,
        letterSpacing: letterSpacing.tight,
    },
    h3: {
        fontSize: fontSize['2xl'],
        fontFamily: fontFamily.bold,
        lineHeight: fontSize['2xl'] * lineHeight.snug,
    },
    h4: {
        fontSize: fontSize.xl,
        fontFamily: fontFamily.semibold,
        lineHeight: fontSize.xl * lineHeight.snug,
    },
    h5: {
        fontSize: fontSize.lg,
        fontFamily: fontFamily.semibold,
        lineHeight: fontSize.lg * lineHeight.normal,
    },

    // Body text
    body: {
        fontSize: fontSize.base,
        fontFamily: fontFamily.regular,
        lineHeight: fontSize.base * lineHeight.normal,
    },
    bodyMedium: {
        fontSize: fontSize.base,
        fontFamily: fontFamily.medium,
        lineHeight: fontSize.base * lineHeight.normal,
    },
    bodySemibold: {
        fontSize: fontSize.base,
        fontFamily: fontFamily.semibold,
        lineHeight: fontSize.base * lineHeight.normal,
    },
    bodySmall: {
        fontSize: fontSize.sm,
        fontFamily: fontFamily.regular,
        lineHeight: fontSize.sm * lineHeight.normal,
    },

    // Captions and labels
    caption: {
        fontSize: fontSize.sm,
        fontFamily: fontFamily.regular,
        lineHeight: fontSize.sm * lineHeight.normal,
    },
    captionMedium: {
        fontSize: fontSize.sm,
        fontFamily: fontFamily.medium,
        lineHeight: fontSize.sm * lineHeight.normal,
    },
    label: {
        fontSize: fontSize.sm,
        fontFamily: fontFamily.semibold,
        lineHeight: fontSize.sm * lineHeight.normal,
    },

    // Overline (small uppercase)
    overline: {
        fontSize: fontSize.xs,
        fontFamily: fontFamily.semibold,
        lineHeight: fontSize.xs * lineHeight.normal,
        letterSpacing: letterSpacing.wider,
        textTransform: 'uppercase',
    },

    // Button text
    button: {
        fontSize: fontSize.base,
        fontFamily: fontFamily.semibold,
        lineHeight: fontSize.base * lineHeight.tight,
    },
    buttonSmall: {
        fontSize: fontSize.sm,
        fontFamily: fontFamily.semibold,
        lineHeight: fontSize.sm * lineHeight.tight,
    },

    // Large display numbers (for scores)
    displayLarge: {
        fontSize: fontSize['5xl'],
        fontFamily: fontFamily.black,
        lineHeight: fontSize['5xl'] * lineHeight.tight,
    },
    displayMedium: {
        fontSize: fontSize['4xl'],
        fontFamily: fontFamily.bold,
        lineHeight: fontSize['4xl'] * lineHeight.tight,
    },
} as const;

export type Typography = typeof textStyles;
