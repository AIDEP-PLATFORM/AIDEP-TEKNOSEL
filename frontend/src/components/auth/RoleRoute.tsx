import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, type Role } from '../../stores/authStore';

interface RoleRouteProps {
  allowedRoles: NonNullable<Role>[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
