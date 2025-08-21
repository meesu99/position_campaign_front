'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, requireRole = null, adminRestricted = false }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      if (requireRole && user.role !== requireRole) {
        // 관리자가 일반 사용자 페이지에 접근하려고 하면 고객관리 페이지로
        if (user.role === 'ADMIN') {
          router.push('/admin/customers');
        } else {
          router.push('/dashboard');
        }
        return;
      }
      
      // 관리자 제한 페이지에 관리자가 접근하려고 하면
      if (adminRestricted && user.role === 'ADMIN') {
        router.push('/admin/customers');
        return;
      }
    }
  }, [user, loading, requireRole, adminRestricted, router]);

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
  
  if (adminRestricted && user.role === 'ADMIN') {
    return null;
  }

  return children;
}
