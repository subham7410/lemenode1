/**
 * Lemenode Design System - Spacing
 * 8px base unit for consistent rhythm
 */

// Base spacing scale (multiples of 4px)
export const spacing = {
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    13: 52,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
    28: 112,
    32: 128,
} as const;

// Semantic layout spacing
export const layout = {
    // Screen padding
    screenPaddingHorizontal: spacing[5], // 20px
    screenPaddingVertical: spacing[6],   // 24px

    // Card internal padding
    cardPadding: spacing[4],             // 16px
    cardPaddingLarge: spacing[5],        // 20px

    // Section spacing
    sectionGap: spacing[6],              // 24px
    sectionGapSmall: spacing[4],         // 16px
    sectionGapLarge: spacing[8],         // 32px

    // Item spacing (between list items, buttons, etc.)
    itemGap: spacing[3],                 // 12px
    itemGapSmall: spacing[2],            // 8px
    itemGapLarge: spacing[4],            // 16px

    // Text spacing
    textGap: spacing[2],                 // 8px
    paragraphGap: spacing[4],            // 16px

    // Header heights
    headerHeight: spacing[16],           // 64px
    headerHeightCompact: spacing[12],    // 48px
    tabBarHeight: spacing[20],           // 80px

    // Touch targets (minimum 44px for accessibility)
    touchTargetMin: spacing[11],         // 44px
    buttonHeight: spacing[13] || 52,     // 52px
    buttonHeightSmall: spacing[12],      // 48px
    inputHeight: spacing[14],            // 56px

    // Icon sizes
    iconSizeSmall: spacing[4],           // 16px
    iconSizeMedium: spacing[5],          // 20px
    iconSizeLarge: spacing[6],           // 24px
    iconSizeXLarge: spacing[8],          // 32px

    // Avatar sizes
    avatarSmall: spacing[8],             // 32px
    avatarMedium: spacing[12],           // 48px
    avatarLarge: spacing[16],            // 64px
    avatarXLarge: spacing[24] || 100,    // 100px
} as const;

// Border radius scale
export const radius = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
} as const;

export type Spacing = typeof spacing;
export type Layout = typeof layout;
export type Radius = typeof radius;
