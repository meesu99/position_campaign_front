'use client';

/**
 * KT 위치 문자 서비스 - 로그인 페이지
 * 
 * 이 컴포넌트는 사용자 로그인 기능을 제공합니다.
 * 
 * 주요 기능:
 * - 이메일/비밀번호 기반 로그인
 * - JWT 토큰 자동 관리 (쿠키)
 * - 로그인 상태 확인 후 자동 리다이렉트
 * - 회원가입 페이지로의 링크 제공
 * 
 * 자동 리다이렉트 규칙:
 * - 이미 로그인된 사용자 (ADMIN): /admin/customers
 * - 이미 로그인된 사용자 (USER): /dashboard
 * 
 * UI 특징:
 * - Tailwind CSS를 이용한 반응형 디자인
 * - 로딩 상태 및 에러 메시지 표시
 * - 브랜드 일관성 유지 ("KT 위치 문자 서비스")
 * 
 * @author KT 위치 문자 서비스 팀
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            KT 위치 문자 서비스 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="font-medium text-kt-red hover:text-red-500">
              회원가입
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                name="email"
                type="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-kt-red focus:border-kt-red focus:z-10 sm:text-sm"
                placeholder="이메일 주소"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-kt-red focus:border-kt-red focus:z-10 sm:text-sm"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-kt-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kt-red disabled:opacity-50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>
          
          <div className="text-center">
            <Link 
              href="/customer-messages" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kt-red mb-4"
            >
              📱 받은 문자 확인하기
            </Link>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            <p>테스트 계정:</p>
            <p>일반 사용자: user@example.com / user123</p>
            <p>관리자: admin@example.com / admin123</p>
          </div>
        </form>
      </div>
    </div>
  );
}
