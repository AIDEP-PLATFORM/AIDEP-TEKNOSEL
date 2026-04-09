import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Outlet → App.tsx'teki alt route'ları render eder (MainLayout dahil)
  return <Outlet />;
};

export default ProtectedRoute;
