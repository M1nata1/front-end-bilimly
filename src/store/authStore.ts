// src/store/authStore.ts

import { create } from "zustand";

// ============================================================
//  КОНФИГУРАЦИЯ
// ============================================================

const TOKEN_KEYS = {
  access:  "bilimly_access",
  refresh: "bilimly_refresh",
  user:    "bilimly_user",
};

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

  setAuth:   (user: AuthUser, access: string, refresh: string) => void;
  clearAuth: () => void;
}

// ============================================================
//  HELPERS
// ============================================================

const storage = STORAGE === "localStorage" ? localStorage : sessionStorage;

function load(): Pick<AuthState, "user" | "accessToken" | "refreshToken" | "isAuth"> {
  try {
    const access  = storage.getItem(TOKEN_KEYS.access);
    const refresh = storage.getItem(TOKEN_KEYS.refresh);
    const user    = storage.getItem(TOKEN_KEYS.user);
    return {
      accessToken:  access,
      refreshToken: refresh,
      user:         user ? JSON.parse(user) as AuthUser : null,
      isAuth:       !!access && !!user,
    };
  } catch {
    return { accessToken: null, refreshToken: null, user: null, isAuth: false };
  }
}

// ============================================================
//  STORE
// ============================================================

export const useAuthStore = create<AuthState>(set => ({
  ...load(),

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
