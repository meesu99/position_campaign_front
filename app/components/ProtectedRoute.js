'use client';

/**
 * KT 위치 문자 서비스 - 보호된 라우트 컴포넌트
 * 
 * 이 컴포넌트는 인증이 필요한 페이지에 대한 접근 제어를 담당합니다.
 * 
 * 주요 기능:
 * - 로그인 상태 확인 및 미인증 사용자 리다이렉트
 * - 역할 기반 접근 제어 (ADMIN, USER)
 * - 관리자 제한 페이지 접근 제어
 * 
 * Props:
 * - children: 보호할 컴포넌트
 * - requireRole: 필요한 역할 (선택적)
 * - adminRestricted: 관리자 접근 제한 여부 (선택적)
 * 
 * 리다이렉트 규칙:
 * - 미인증: /login으로 이동
 * - 역할 불일치 (ADMIN): /admin/customers로 이동
 * - 역할 불일치 (USER): /dashboard로 이동
 * - 관리자 제한 페이지: /admin/customers로 이동
 * 
 * @author KT 위치 문자 서비스 팀
 */

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
