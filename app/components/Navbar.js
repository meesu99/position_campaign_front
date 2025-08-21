'use client';

/**
 * KT 위치 문자 서비스 - 네비게이션 바 컴포넌트
 * 
 * 이 컴포넌트는 애플리케이션의 상단 네비게이션을 담당합니다.
 * 
 * 주요 기능:
 * - 서비스명 "KT 위치 문자 서비스" 표시
 * - 사용자 역할에 따른 메뉴 제어 (관리자는 고객 관리만 접근)
 * - 일반 사용자 포인트 잔액 표시 (관리자는 숨김)
 * - 로그아웃 기능
 * 
 * 권한 관리:
 * - ADMIN: 고객 관리만 접근 가능
 * - USER: 대시보드, 캠페인 생성, 지갑, 알림 접근 가능
 * 
 * @author KT 위치 문자 서비스 팀
 */

import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-kt-red">
              KT 위치 문자 서비스
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{user.companyName}</span>
            {user.role !== 'ADMIN' && (
              <span className="text-sm text-gray-500">포인트: {user.points?.toLocaleString()}P</span>
            )}
            
            <div className="flex space-x-2">
              {user.role !== 'ADMIN' && (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-kt-red px-3 py-2 rounded-md">
                    대시보드
                  </Link>
                  <Link href="/campaigns/new" className="text-gray-700 hover:text-kt-red px-3 py-2 rounded-md">
                    캠페인 생성
                  </Link>
                  <Link href="/wallet" className="text-gray-700 hover:text-kt-red px-3 py-2 rounded-md">
                    지갑
                  </Link>
                  <Link href="/alerts" className="text-gray-700 hover:text-kt-red px-3 py-2 rounded-md">
                    알림
                  </Link>
                </>
              )}
              
              {user.role === 'ADMIN' && (
                <Link href="/admin/customers" className="text-gray-700 hover:text-kt-red px-3 py-2 rounded-md">
                  고객 관리
                </Link>
              )}
              
              <button
                onClick={logout}
                className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
