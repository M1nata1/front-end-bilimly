// src/api/auth.ts
// ============================================================
//  API КОНФИГУРАЦИЯ — меняй baseUrl когда переходишь на прод
// ============================================================

export const API_BASE   = "/api";
export const MEDIA_BASE = "https://projectx-api-718606133437.us-central1.run.app";

/** Преобразует относительный путь /media/... в абсолютный URL */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return path.startsWith("http") ? path : `${MEDIA_BASE}${path}`;
}

export const AUTH_ENDPOINTS = {
  login:   "/users/auth/login/",           // POST { email, password } → { access, refresh }
  register:"/users/auth/register/",         // POST { email, username, password, phone_number }
  refresh: "/users/auth/token/refresh/",    // POST { refresh } → { access }
};

// ============================================================
//  ТИПЫ — точно по Swagger
// ============================================================

export interface LoginRequest {
  email:    string;
  password: string;
}

export interface RegisterRequest {
  email:        string;
  username:     string;
  password:     string;
  phone_number: string;   // формат: 87771234567 или +77777777777
}

// Оба эндпоинта возвращают одно и то же
export interface AuthTokenResponse {
  access:  string;   // JWT, короткоживущий
  refresh: string;   // JWT, долгоживущий
}

export interface ApiFieldError {
  email?:        string[];
  password?:     string[];
  phone_number?: string[];
  detail?:       string;
}

// ============================================================
//  ЗАПРОСЫ
// ============================================================

async function post<T>(endpoint: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw { status: res.status, ...(data as ApiFieldError) };
  return data as T;
}

// ============================================================
//  УТИЛИТЫ
// ============================================================

/** Декодирует payload JWT без проверки подписи (только для отображения данных) */
export function decodeJwt(token: string): Record<string, unknown> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export const authApi = {
  login:    (body: LoginRequest)    => post<AuthTokenResponse>(AUTH_ENDPOINTS.login,    body),
  register: (body: RegisterRequest) => post<AuthTokenResponse>(AUTH_ENDPOINTS.register, body),
  refresh:  (token: string)         => post<{ access: string }>(AUTH_ENDPOINTS.refresh, { refresh: token }),
};
