import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../../stores/authStore';

interface PublicRouteProps {
  children?: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  // jika sudah punya token & user valid, lempark ke dashboard masing masing
  if (token && user) {
    return <Navigate to={user.role === 'ADMIN' ? '/dashboard' : '/customers'} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
