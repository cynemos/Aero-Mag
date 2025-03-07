import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuth();
  const isAdmin = user?.email === 'cynemos@gmail.com';

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
