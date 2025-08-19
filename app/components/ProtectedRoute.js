'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, requireRole = null }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      if (requireRole && user.role !== requireRole) {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, loading, requireRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-kt-red"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireRole && user.role !== requireRole) {
    return null;
  }

  return children;
}
