import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useAuth } from '../lib/auth';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="w-8 h-8 animate-spin text-laiton" />
      </div>
    );
  }

  if (!user) return <Navigate to="/connexion" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
