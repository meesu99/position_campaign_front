'use client';

/**
 * KT 위치 문자 서비스 - 회원가입 페이지
 * 
 * 이 컴포넌트는 새로운 사용자의 회원가입 기능을 제공합니다.
 * 
 * 주요 기능:
 * - 이메일, 비밀번호, 사업자번호, 회사명 입력
 * - 이메일 중복 검증 (백엔드에서 처리)
 * - 회원가입 성공 시 자동 로그인 및 리다이렉트
 * - 로그인 페이지로의 링크 제공
 * 
 * 입력 필드:
 * - 이메일: 로그인 ID로 사용
 * - 비밀번호: BCrypt 암호화 처리
 * - 사업자번호: 사업자 인증용
 * - 회사명: 표시명
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
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessNo: '',
    companyName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    const result = await signup({
      email: formData.email,
      password: formData.password,
      businessNo: formData.businessNo,
      companyName: formData.companyName
    });
    
    if (result.success) {
      router.push('/login');
    } else {
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
            KT 위치 문자 서비스 회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-medium text-kt-red hover:text-red-500">
              로그인
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <input
              name="email"
              type="email"
              required
              className="input-field"
              placeholder="이메일 주소"
              value={formData.email}
              onChange={handleChange}
            />
            
            <input
              name="password"
              type="password"
              required
              className="input-field"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleChange}
            />
            
            <input
              name="confirmPassword"
              type="password"
              required
              className="input-field"
              placeholder="비밀번호 확인"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            
            <input
              name="businessNo"
              type="text"
              required
              className="input-field"
              placeholder="사업자등록번호"
              value={formData.businessNo}
              onChange={handleChange}
            />
            
            <input
              name="companyName"
              type="text"
              required
              className="input-field"
              placeholder="회사명"
              value={formData.companyName}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  );
}
