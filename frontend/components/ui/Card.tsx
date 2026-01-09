/**
 * Card Component
 * Container for grouped content
 */

import React, { ReactNode } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, radius, shadows } from '../../theme';

type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled';

interface CardProps {
    children: ReactNode;
    variant?: CardVariant;
    onPress?: () => void;
    padding?: keyof typeof spacing | number;
    style?: ViewStyle;
    backgroundColor?: string;
}

export function Card({
    children,
    variant = 'default',
    onPress,
    padding = 4,
    style,
    backgroundColor,
}: CardProps) {
    const getCardStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            borderRadius: radius.xl,
            padding: typeof padding === 'number' && padding in spacing
                ? spacing[padding as keyof typeof spacing]
                : typeof padding === 'number'
                    ? padding
                    : spacing[padding],
            backgroundColor: backgroundColor || colors.neutral[0],
        };

        const variantStyles: Record<CardVariant, ViewStyle> = {
            default: {
                ...shadows.md,
                borderWidth: 1,
                borderColor: colors.border.light,
            },
            outlined: {
                borderWidth: 2,
                borderColor: colors.border.light,
            },
            elevated: {
                ...shadows.lg,
            },
            filled: {
                backgroundColor: backgroundColor || colors.neutral[100],
            },
        };

        return {
            ...baseStyle,
            ...variantStyles[variant],
        };
    };

    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    getCardStyle(),
                    pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] },
                    style,
                ]}
            >
                {children}
            </Pressable>
        );
    }

    return <View style={[getCardStyle(), style]}>{children}</View>;
}

// Specialized card variants
interface InfoCardProps {
    children: ReactNode;
    type?: 'info' | 'success' | 'warning' | 'error';
    style?: ViewStyle;
}

export function InfoCard({ children, type = 'info', style }: InfoCardProps) {
    const typeStyles: Record<string, { bg: string; border: string }> = {
        info: { bg: colors.infoLight, border: colors.info },
        success: { bg: colors.successLight, border: colors.success },
        warning: { bg: colors.warningLight, border: colors.warning },
        error: { bg: colors.errorLight, border: colors.error },
    };

    const { bg, border } = typeStyles[type];

    return (
        <View
            style={[
                styles.infoCard,
                { backgroundColor: bg, borderLeftColor: border },
                style,
            ]}
        >
            {children}
        </View>
    );
}

// Dashed outline card for empty states
interface DashedCardProps {
    children: ReactNode;
    style?: ViewStyle;
}

export function DashedCard({ children, style }: DashedCardProps) {
    return (
        <View style={[styles.dashedCard, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    infoCard: {
        borderRadius: radius.lg,
        padding: spacing[4],
        borderLeftWidth: 4,
        flexDirection: 'row',
    },
    dashedCard: {
        borderRadius: radius.xl,
        padding: spacing[10],
        borderWidth: 2,
        borderColor: colors.border.light,
        borderStyle: 'dashed',
        backgroundColor: colors.neutral[0],
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Card;
