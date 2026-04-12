import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

/**
 * Web platformu yalnızca STK (ngo) ve sistem yöneticisi (admin) içindir.
 * Vatandaş ve gönüllü hesapları mobil uygulamaya yönlendirilir.
 */
const WEB_ALLOWED_ROLES = ["ngo", "admin"] as const;

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Vatandaş ve gönüllü rolleri web platformuna erişemez
  if (user?.role === "citizen" || user?.role === "volunteer") {
    return <Navigate to="/unauthorized" replace />;
  }

  // Beklenmedik / tanımsız rol
  if (
    user?.role &&
    !WEB_ALLOWED_ROLES.includes(user.role as (typeof WEB_ALLOWED_ROLES)[number])
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
