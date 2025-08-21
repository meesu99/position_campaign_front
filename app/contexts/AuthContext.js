'use client';

/**
 * KT 위치 문자 서비스 - 인증 컨텍스트
 * 
 * 이 컨텍스트는 애플리케이션 전역에서 사용자 인증 상태를 관리합니다.
 * 
 * 주요 기능:
 * - 사용자 로그인 상태 관리
 * - JWT 토큰 기반 인증 처리
 * - 자동 로그인 (토큰 유효성 검사)
 * - 로그아웃 처리
 * 
 * 상태 관리:
 * - user: 현재 로그인된 사용자 정보 (id, email, name, role, points)
 * - loading: 초기 인증 상태 로딩 여부
 * 
 * @author KT 위치 문자 서비스 팀
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 401) {
        // 인증되지 않은 상태는 정상적인 상황
        setUser(null);
      } else {
        console.error('Auth check failed with status:', response.status);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
      
      // 역할에 따라 리다이렉트
      if (data.user.role === 'ADMIN') {
        router.push('/admin/customers');
      } else {
        router.push('/dashboard');
      }
      
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error: error.error };
    }
  };

  const signup = async (userData) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error: error.error };
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    
    setUser(null);
    router.push('/login');
  };

  const updateUserPoints = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to update user points:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    checkAuthStatus,
    updateUserPoints
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
