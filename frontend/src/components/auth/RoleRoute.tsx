import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, Role } from '../../stores/authStore';

interface RoleRouteProps {
  allowedRoles: Role[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
