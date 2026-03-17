// src/router/ProtectedRoute.tsx

import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// Куда редиректить неавторизованного пользователя
const REDIRECT_TO = "/auth";

export default function ProtectedRoute() {
    const isAuth = useAuthStore(s => s.isAuth);
    return isAuth ? <Outlet /> : <Navigate to={REDIRECT_TO} replace />;
}