/**
 * Lemenode Design System - Theme Export
 * Import this file to access all theme tokens
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';

// Re-export commonly used items at top level
export { colors, getScoreColor, getScoreLabel } from './colors';
export { fontFamily, fontSize, textStyles } from './typography';
export { spacing, layout, radius } from './spacing';
export { shadows, coloredShadow, primaryButtonShadow } from './shadows';

// Theme object for context/provider usage
import { colors } from './colors';
import { fontFamily, fontSize, textStyles } from './typography';
import { spacing, layout, radius } from './spacing';
import { shadows } from './shadows';

export const theme = {
    colors,
    fontFamily,
    fontSize,
    textStyles,
    spacing,
    layout,
    radius,
    shadows,
} as const;

export type Theme = typeof theme;
