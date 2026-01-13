/**
 * API Service Layer
 *
 * Centralized Axios instance with:
 * - Base URL configuration
 * - Auth token interceptor
 * - Error handling
 * - Request/response logging
 */

import axios, { AxiosError, AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API base URL from environment
const API_URL =
    process.env.EXPO_PUBLIC_API_URL || "https://lemenode-backend-466053387222.us-central1.run.app";

console.log("API Service initialized with URL:", API_URL);

// Auth token storage key
const AUTH_TOKEN_KEY = "@skinglow_auth_token";

// Create Axios instance
export const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 seconds (matches Gemini timeout)
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    async (config) => {
        // Try to get stored token
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in dev mode
        if (__DEV__) {
            console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => {
        // Log response in dev mode
        if (__DEV__) {
            console.log(`📥 ${response.status} ${response.config.url}`);
        }
        return response;
    },
    async (error: AxiosError) => {
        const status = error.response?.status;

        // Log error in dev mode
        if (__DEV__) {
            console.error(`❌ ${status} ${error.config?.url}`, error.response?.data);
        }

        // Handle specific error codes
        if (status === 401) {
            // Token expired or invalid - clear auth
            await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
            // The AuthContext will handle redirecting to login
        }

        if (status === 429) {
            // Rate limit exceeded - error has detailed info
            const data = error.response?.data as any;
            return Promise.reject({
                code: "RATE_LIMIT",
                message: data?.detail?.message || data?.detail || "Rate limit exceeded",
                tier: data?.detail?.tier,
                scansToday: data?.detail?.scans_today,
                scansLimit: data?.detail?.scans_limit,
                upgradeAvailable: data?.detail?.upgrade_available,
            });
        }

        return Promise.reject(error);
    }
);

// Helper types for API responses
export type ApiError = {
    code: string;
    message: string;
    tier?: string;
    scansToday?: number;
    scansLimit?: number;
    upgradeAvailable?: boolean;
};

// Common API methods
export const apiService = {
    /**
     * Get current subscription usage
     */
    async getSubscription() {
        const response = await api.get("/subscription");
        return response.data;
    },

    /**
     * Get scan history
     */
    async getScans(limit = 30, offset = 0) {
        const response = await api.get("/scans", {
            params: { limit, offset },
        });
        return response.data;
    },

    /**
     * Get single scan details
     */
    async getScan(scanId: string) {
        const response = await api.get(`/scans/${scanId}`);
        return response.data;
    },

    /**
     * Delete a scan
     */
    async deleteScan(scanId: string) {
        await api.delete(`/scans/${scanId}`);
    },

    /**
     * Analyze skin image
     * This is a special endpoint that uses FormData
     */
    async analyzeSkin(imageUri: string, userData: any) {
        const formData = new FormData();

        // Add image
        formData.append("image", {
            uri: imageUri,
            type: "image/jpeg",
            name: "skin.jpg",
        } as any);

        // Add user data as JSON string
        formData.append("user", JSON.stringify(userData));

        const response = await api.post("/analyze", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },

    /**
     * Get available tiers
     */
    async getTiers() {
        const response = await api.get("/subscription/tiers");
        return response.data.tiers;
    },

    /**
     * Delete user account
     */
    async deleteAccount() {
        await api.delete("/users/me");
    },
};

export default api;
