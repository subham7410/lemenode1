/**
 * AuthContext - Manages authentication state and Google Sign-In
 *
 * Uses expo-auth-session for Google OAuth (works without Firebase/google-services.json).
 * Provides login/logout functions and user state to entire app.
 */

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { api } from "../services/api";

// Complete auth session for web browser
WebBrowser.maybeCompleteAuthSession();

// Storage keys
const AUTH_TOKEN_KEY = "@skinglow_auth_token";
const USER_PROFILE_KEY = "@skinglow_user_profile";

// User profile type
export type UserProfile = {
    uid: string;
    email: string | null;
    display_name: string | null;
    photo_url: string | null;
    tier: "free" | "pro" | "unlimited";
    scans_today: number;
    age?: number | null;
    gender?: string | null;
    height?: number | null;
    weight?: number | null;
    diet?: string | null;
};

// Auth context type
type AuthContextType = {
    user: UserProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Google OAuth client IDs from environment
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "";

console.log("AuthContext: Google OAuth configured", {
    webClientId: GOOGLE_WEB_CLIENT_ID ? "SET" : "NOT SET",
    androidClientId: GOOGLE_ANDROID_CLIENT_ID ? "SET" : "NOT SET",
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);

    // Configure Google Auth Request
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: GOOGLE_WEB_CLIENT_ID,
        androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    });

    // Handle auth response
    useEffect(() => {
        if (response?.type === "success") {
            const { id_token } = response.params;
            if (id_token) {
                verifyTokenAndLogin(id_token);
            }
        }
    }, [response]);

    // Load stored auth on mount
    useEffect(() => {
        loadStoredAuth();
    }, []);

    async function loadStoredAuth() {
        try {
            const [storedToken, storedProfile] = await Promise.all([
                AsyncStorage.getItem(AUTH_TOKEN_KEY),
                AsyncStorage.getItem(USER_PROFILE_KEY),
            ]);

            if (storedToken && storedProfile) {
                setToken(storedToken);
                setUser(JSON.parse(storedProfile));
                api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
            }
        } catch (e) {
            console.error("Failed to load stored auth:", e);
        } finally {
            setIsLoading(false);
        }
    }

    async function verifyTokenAndLogin(idToken: string) {
        try {
            setIsLoading(true);
            const response = await api.post("/auth/verify", { id_token: idToken });

            if (response.data.valid && response.data.user) {
                const profile = response.data.user;

                setToken(idToken);
                setUser(profile);

                await Promise.all([
                    AsyncStorage.setItem(AUTH_TOKEN_KEY, idToken),
                    AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile)),
                ]);

                api.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;
                console.log(response.data.is_new_user ? "New user created" : "User logged in");
            } else {
                console.error("Token verification failed - invalid response");
                throw new Error("Token verification failed");
            }
        } catch (error) {
            console.error("Token verification error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function signInWithGoogle() {
        try {
            setIsLoading(true);

            if (!GOOGLE_WEB_CLIENT_ID) {
                throw new Error("Google Sign-In is not configured. Missing EXPO_PUBLIC_GOOGLE_CLIENT_ID.");
            }

            if (!request) {
                throw new Error("Auth request not ready. Please try again.");
            }

            console.log("Starting Google Sign-In via expo-auth-session...");
            await promptAsync();
            // Response is handled in useEffect above
        } catch (error: any) {
            console.error("Sign-in error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function signOut() {
        setUser(null);
        setToken(null);
        delete api.defaults.headers.common["Authorization"];

        await Promise.all([
            AsyncStorage.removeItem(AUTH_TOKEN_KEY),
            AsyncStorage.removeItem(USER_PROFILE_KEY),
        ]);
    }

    async function refreshUser() {
        if (!token) return;

        try {
            const response = await api.get("/users/me");
            setUser(response.data);
            await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(response.data));
        } catch (e) {
            console.error("Failed to refresh user:", e);
        }
    }

    async function updateProfile(updates: Partial<UserProfile>) {
        const response = await api.patch("/users/me", updates);
        setUser(response.data);
        await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(response.data));
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                signInWithGoogle,
                signOut,
                refreshUser,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
