/**
 * Chat Screen - AI-powered skin analysis follow-up chat
 * OTA Compatible - No native modules required
 */

import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAnalysis } from "../context/AnalysisContext";
import { apiService } from "../services/api";
import {
    colors,
    textStyles,
    spacing,
    radius,
    shadows,
} from "../theme";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

// Chat bubble component
function ChatBubble({ message }: { message: Message }) {
    const isUser = message.role === "user";

    return (
        <View
            style={[
                styles.bubbleContainer,
                isUser ? styles.bubbleContainerUser : styles.bubbleContainerAssistant,
            ]}
        >
            {!isUser && (
                <View style={styles.avatarContainer}>
                    <LinearGradient
                        colors={colors.gradients.primary}
                        style={styles.avatar}
                    >
                        <Ionicons name="sparkles" size={16} color={colors.neutral[0]} />
                    </LinearGradient>
                </View>
            )}
            <View
                style={[
                    styles.bubble,
                    isUser ? styles.bubbleUser : styles.bubbleAssistant,
                ]}
            >
                <Text
                    style={[
                        styles.bubbleText,
                        isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant,
                    ]}
                >
                    {message.content}
                </Text>
            </View>
        </View>
    );
}

// Suggestion chip component
function SuggestionChip({
    text,
    onPress,
}: {
    text: string;
    onPress: () => void;
}) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.suggestionChip,
                pressed && { opacity: 0.7 },
            ]}
            onPress={onPress}
        >
            <Text style={styles.suggestionText}>{text}</Text>
        </Pressable>
    );
}

export default function ChatScreen() {
    const router = useRouter();
    const { analysis } = useAnalysis();
    const scrollViewRef = useRef<ScrollView>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([
        "What products should I use?",
        "How long until I see improvement?",
        "Is this concern serious?",
    ]);

    // Load initial suggestions based on scan
    useEffect(() => {
        loadSuggestions();
        // Add welcome message
        const welcomeMessage: Message = {
            id: "welcome",
            role: "assistant",
            content: `Hi! 👋 I'm your SkinGlow AI assistant. I've reviewed your skin analysis${analysis?.score
                    ? ` (score: ${typeof analysis.score === "object" ? analysis.score.total : analysis.score}/100)`
                    : ""
                }. Ask me anything about your results or skincare routine!`,
            timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
    }, []);

    const loadSuggestions = async () => {
        try {
            const response = await apiService.getChatSuggestions();
            if (response?.suggestions) {
                setSuggestions(response.suggestions);
            }
        } catch (error) {
            console.log("Error loading suggestions:", error);
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setIsLoading(true);

        // Scroll to bottom
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        try {
            const response = await apiService.sendChatMessage(
                text.trim(),
                analysis, // Pass current analysis as context
                messages.slice(-10).map((m) => ({ role: m.role, content: m.content }))
            );

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response.reply,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);

            // Update suggestions
            if (response.suggestions) {
                setSuggestions(response.suggestions);
            }
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content:
                    "Sorry, I'm having trouble responding right now. Please try again!",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    };

    const handleSuggestionPress = (suggestion: string) => {
        sendMessage(suggestion);
    };

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable style={styles.headerButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </Pressable>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>SkinGlow AI</Text>
                        <View style={styles.onlineBadge}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.onlineText}>Online</Text>
                        </View>
                    </View>
                    <View style={styles.headerButton} />
                </View>

                {/* Messages */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() =>
                        scrollViewRef.current?.scrollToEnd({ animated: true })
                    }
                >
                    {messages.map((message) => (
                        <ChatBubble key={message.id} message={message} />
                    ))}
                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <View style={styles.avatarContainer}>
                                <LinearGradient
                                    colors={colors.gradients.primary}
                                    style={styles.avatar}
                                >
                                    <Ionicons
                                        name="sparkles"
                                        size={16}
                                        color={colors.neutral[0]}
                                    />
                                </LinearGradient>
                            </View>
                            <View style={styles.typingIndicator}>
                                <ActivityIndicator size="small" color={colors.primary[500]} />
                                <Text style={styles.typingText}>Thinking...</Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Suggestions */}
                {messages.length <= 2 && suggestions.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.suggestionsContainer}
                        contentContainerStyle={styles.suggestionsContent}
                    >
                        {suggestions.map((suggestion, index) => (
                            <SuggestionChip
                                key={index}
                                text={suggestion}
                                onPress={() => handleSuggestionPress(suggestion)}
                            />
                        ))}
                    </ScrollView>
                )}

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask about your skin..."
                        placeholderTextColor={colors.text.tertiary}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                        onSubmitEditing={() => sendMessage(inputText)}
                        returnKeyType="send"
                    />
                    <Pressable
                        style={({ pressed }) => [
                            styles.sendButton,
                            (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                            pressed && { opacity: 0.8 },
                        ]}
                        onPress={() => sendMessage(inputText)}
                        disabled={!inputText.trim() || isLoading}
                    >
                        <LinearGradient
                            colors={
                                inputText.trim() && !isLoading
                                    ? colors.gradients.primary
                                    : [colors.neutral[200], colors.neutral[300]]
                            }
                            style={styles.sendButtonGradient}
                        >
                            <Ionicons
                                name="send"
                                size={20}
                                color={
                                    inputText.trim() && !isLoading
                                        ? colors.neutral[0]
                                        : colors.neutral[400]
                                }
                            />
                        </LinearGradient>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    container: {
        flex: 1,
    },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
        backgroundColor: colors.neutral[0],
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: radius.lg,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitleContainer: {
        alignItems: "center",
    },
    headerTitle: {
        ...textStyles.h4,
        color: colors.text.primary,
    },
    onlineBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[1],
        marginTop: spacing[1],
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.accent[500],
    },
    onlineText: {
        ...textStyles.caption,
        color: colors.accent[600],
    },

    // Messages
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: spacing[4],
        paddingBottom: spacing[6],
    },
    bubbleContainer: {
        flexDirection: "row",
        marginBottom: spacing[4],
        alignItems: "flex-end",
    },
    bubbleContainerUser: {
        justifyContent: "flex-end",
    },
    bubbleContainerAssistant: {
        justifyContent: "flex-start",
    },
    avatarContainer: {
        marginRight: spacing[2],
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    bubble: {
        maxWidth: "75%",
        padding: spacing[4],
        borderRadius: radius.xl,
    },
    bubbleUser: {
        backgroundColor: colors.primary[500],
        borderBottomRightRadius: spacing[1],
    },
    bubbleAssistant: {
        backgroundColor: colors.neutral[0],
        borderBottomLeftRadius: spacing[1],
        ...shadows.sm,
    },
    bubbleText: {
        ...textStyles.body,
        lineHeight: 22,
    },
    bubbleTextUser: {
        color: colors.neutral[0],
    },
    bubbleTextAssistant: {
        color: colors.text.primary,
    },

    // Loading
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing[4],
    },
    typingIndicator: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.neutral[0],
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        borderRadius: radius.xl,
        gap: spacing[2],
        ...shadows.sm,
    },
    typingText: {
        ...textStyles.caption,
        color: colors.text.secondary,
    },

    // Suggestions
    suggestionsContainer: {
        maxHeight: 50,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
        backgroundColor: colors.neutral[50],
    },
    suggestionsContent: {
        padding: spacing[3],
        gap: spacing[2],
    },
    suggestionChip: {
        backgroundColor: colors.neutral[0],
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
        borderRadius: radius.full,
        marginRight: spacing[2],
        borderWidth: 1,
        borderColor: colors.primary[200],
    },
    suggestionText: {
        ...textStyles.caption,
        color: colors.primary[600],
    },

    // Input
    inputContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        padding: spacing[3],
        backgroundColor: colors.neutral[0],
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
        gap: spacing[3],
    },
    input: {
        flex: 1,
        backgroundColor: colors.neutral[50],
        borderRadius: radius.xl,
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        maxHeight: 100,
        ...textStyles.body,
        color: colors.text.primary,
    },
    sendButton: {
        width: 44,
        height: 44,
    },
    sendButtonDisabled: {
        opacity: 0.6,
    },
    sendButtonGradient: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
});
