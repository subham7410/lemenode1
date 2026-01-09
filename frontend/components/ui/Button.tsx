/**
 * Button Component
 * Primary UI element for actions
 */

import React from 'react';
import {
    Pressable,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, textStyles, layout, radius, shadows, primaryButtonShadow, coloredShadow } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    fullWidth?: boolean;
    style?: ViewStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    style,
}: ButtonProps) {
    const isDisabled = disabled || loading;

    const getContainerStyle = (): ViewStyle[] => {
        const baseStyle: ViewStyle = {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.lg,
            gap: 10,
        };

        // Size variations
        const sizeStyles: Record<ButtonSize, ViewStyle> = {
            sm: { height: 40, paddingHorizontal: 16 },
            md: { height: 52, paddingHorizontal: 20 },
            lg: { height: 56, paddingHorizontal: 24 },
        };

        // Variant styles
        const variantStyles: Record<ButtonVariant, ViewStyle> = {
            primary: {
                backgroundColor: colors.primary[600],
                ...primaryButtonShadow,
            },
            secondary: {
                backgroundColor: colors.neutral[0],
                borderWidth: 2,
                borderColor: colors.primary[200],
            },
            ghost: {
                backgroundColor: 'transparent',
            },
            destructive: {
                backgroundColor: colors.error,
                ...coloredShadow(colors.error, 'medium'),
            },
        };

        const styles = [
            baseStyle,
            sizeStyles[size],
            variantStyles[variant],
            fullWidth && { width: '100%' as any },
            isDisabled && { opacity: 0.5, shadowOpacity: 0 },
            style,
        ];

        return styles.filter(Boolean) as ViewStyle[];
    };

    const getTextStyle = (): TextStyle => {
        const baseStyle: TextStyle = {
            ...textStyles.button,
        };

        const variantTextStyles: Record<ButtonVariant, TextStyle> = {
            primary: { color: colors.text.inverse },
            secondary: { color: colors.primary[600] },
            ghost: { color: colors.primary[600] },
            destructive: { color: colors.text.inverse },
        };

        const sizeTextStyles: Record<ButtonSize, TextStyle> = {
            sm: { fontSize: 14 },
            md: { fontSize: 16 },
            lg: { fontSize: 17 },
        };

        return {
            ...baseStyle,
            ...variantTextStyles[variant],
            ...sizeTextStyles[size],
        };
    };

    const getIconColor = (): string => {
        const iconColors: Record<ButtonVariant, string> = {
            primary: colors.text.inverse,
            secondary: colors.primary[600],
            ghost: colors.primary[600],
            destructive: colors.text.inverse,
        };
        return iconColors[variant];
    };

    const iconSize = size === 'sm' ? 18 : size === 'lg' ? 22 : 20;

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            style={({ pressed }) => [
                ...getContainerStyle(),
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
        >
            {loading ? (
                <ActivityIndicator color={getIconColor()} size="small" />
            ) : leftIcon ? (
                <Ionicons name={leftIcon} size={iconSize} color={getIconColor()} />
            ) : null}

            <Text style={getTextStyle()}>{title}</Text>

            {rightIcon && !loading && (
                <Ionicons name={rightIcon} size={iconSize} color={getIconColor()} />
            )}
        </Pressable>
    );
}

export default Button;
