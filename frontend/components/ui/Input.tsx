/**
 * Input Component
 * Text input with consistent styling
 */

import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    ViewStyle,
    TextInputProps,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, textStyles, spacing, radius, layout } from '../../theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
    required?: boolean;
}

export function Input({
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    required,
    ...textInputProps
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);

    const getInputContainerStyle = (): ViewStyle => {
        let borderColor: string = colors.border.light;
        let backgroundColor: string = colors.neutral[0];

        if (error) {
            borderColor = colors.error;
            backgroundColor = colors.errorLight;
        } else if (isFocused) {
            borderColor = colors.primary[500];
        }

        if (textInputProps.editable === false) {
            backgroundColor = colors.neutral[100];
            borderColor = colors.border.medium;
        }

        return {
            flexDirection: 'row',
            alignItems: 'center',
            height: layout.inputHeight,
            borderRadius: radius.md,
            borderWidth: 2,
            borderColor,
            backgroundColor,
            paddingHorizontal: spacing[4],
        };
    };

    const getIconColor = (): string => {
        if (error) return colors.error;
        if (isFocused) return colors.primary[500];
        return colors.neutral[400];
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={styles.label}>
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                </Text>
            )}

            <View style={getInputContainerStyle()}>
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={20}
                        color={getIconColor()}
                        style={styles.leftIcon}
                    />
                )}

                <TextInput
                    {...textInputProps}
                    style={[
                        styles.input,
                        leftIcon && { paddingLeft: 0 },
                        rightIcon && { paddingRight: 0 },
                    ]}
                    placeholderTextColor={colors.neutral[400]}
                    onFocus={(e) => {
                        setIsFocused(true);
                        textInputProps.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        textInputProps.onBlur?.(e);
                    }}
                />

                {rightIcon && (
                    <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
                        <Ionicons name={rightIcon} size={20} color={getIconColor()} />
                    </Pressable>
                )}
            </View>

            {(error || hint) && (
                <Text style={[styles.helperText, error && styles.errorText]}>
                    {error || hint}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing[5],
    },
    label: {
        ...textStyles.label,
        color: colors.text.secondary,
        marginBottom: spacing[2],
    },
    required: {
        color: colors.error,
    },
    input: {
        flex: 1,
        ...textStyles.body,
        color: colors.text.primary,
        height: '100%',
    },
    leftIcon: {
        marginRight: spacing[3],
    },
    rightIcon: {
        marginLeft: spacing[3],
        padding: spacing[1],
    },
    helperText: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        marginTop: spacing[1],
    },
    errorText: {
        color: colors.error,
    },
});

export default Input;
