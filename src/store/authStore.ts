// src/store/authStore.ts

import { create } from "zustand";

// ============================================================
//  КОНФИГУРАЦИЯ — ключи хранилища
// ============================================================

const TOKEN_KEYS = {
    access:  "kt_access_token",
    refresh: "kt_refresh_token",
    user:    "kt_user",
};

// "localStorage" | "sessionStorage"
const STORAGE: "localStorage" | "sessionStorage" = "localStorage";

// ============================================================
//  ТИПЫ
// ============================================================

export interface AuthUser {
    id:   string;
    name: string;
    role: "student" | "admin";
}

interface AuthState {
    user:         AuthUser | null;
    accessToken:  string | null;
    refreshToken: string | null;
    isAuth:       boolean;

    setAuth:  (user: AuthUser, access: string, refresh: string) => void;
    clearAuth: () => void;
}

// ============================================================
//  ХЕЛПЕРЫ
// ============================================================

const storage = STORAGE === "localStorage" ? localStorage : sessionStorage;

function loadInitialState(): Pick<AuthState, "user" | "accessToken" | "refreshToken" | "isAuth"> {
    try {
        const access  = storage.getItem(TOKEN_KEYS.access);
        const refresh = storage.getItem(TOKEN_KEYS.refresh);
        const userRaw = storage.getItem(TOKEN_KEYS.user);
        const user    = userRaw ? (JSON.parse(userRaw) as AuthUser) : null;
        return {
            user,
            accessToken:  access,
            refreshToken: refresh,
            isAuth:       !!access && !!user,
        };
    } catch {
        return { user: null, accessToken: null, refreshToken: null, isAuth: false };
    }
}

// ============================================================
//  STORE
// ============================================================

export const useAuthStore = create<AuthState>((set) => ({
    ...loadInitialState(),

    setAuth(user, access, refresh) {
        storage.setItem(TOKEN_KEYS.access,  access);
        storage.setItem(TOKEN_KEYS.refresh, refresh);
        storage.setItem(TOKEN_KEYS.user,    JSON.stringify(user));
        set({ user, accessToken: access, refreshToken: refresh, isAuth: true });
    },

    clearAuth() {
        storage.removeItem(TOKEN_KEYS.access);
        storage.removeItem(TOKEN_KEYS.refresh);
        storage.removeItem(TOKEN_KEYS.user);
        set({ user: null, accessToken: null, refreshToken: null, isAuth: false });
    },
}));