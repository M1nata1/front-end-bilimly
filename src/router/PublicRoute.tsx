// src/router/PublicRoute.tsx
// Используется для страниц, куда авторизованный попасть не должен (/auth, /)

import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// Куда редиректить уже авторизованного пользователя
const REDIRECT_TO = "/dashboard";

export default function PublicRoute() {
    const isAuth = useAuthStore(s => s.isAuth);
    return isAuth ? <Navigate to={REDIRECT_TO} replace /> : <Outlet />;
}