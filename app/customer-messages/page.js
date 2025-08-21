'use client';

/**
 * KT 위치 문자 서비스 - 고객 메시지 확인 페이지
 * 
 * 이 컴포넌트는 특정 고객이 받은 캠페인 메시지를 확인하는 기능을 제공합니다.
 * 
 * 주요 기능:
 * - 고객 ID 입력으로 메시지 목록 조회
 * - 메시지 읽음 처리 (readAt 업데이트)
 * - 메시지 링크 클릭 처리 (clickAt 업데이트)
 * - 실시간 상태 업데이트 (JPA 캐시 관리)
 * 
 * 특별 기능:
 * - 메시지 상호작용 후 자동 새로고침
 * - 읽음/클릭 상태 시각적 표시
 * - 메시지 수 및 미읽음 수 표시
 * - 로딩 상태 및 중복 클릭 방지
 * 
 * UI 특징:
 * - 상호작용 시 시각적 피드백 (opacity, pulse)
 * - 상태별 색상 구분 (읽음: 회색, 미읽음: 파랑)
 * - 새로고침 버튼 및 마지막 업데이트 시간 표시
 * 
 * @author KT 위치 문자 서비스 팀
 */

import { useState } from 'react';
import Link from 'next/link';

export default function CustomerMessages() {
  const [customerId, setCustomerId] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerInfo, setCustomerInfo] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // 어떤 메시지가 로딩 중인지 추적

  const fetchMessages = async (customerIdToFetch) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/customer/${customerIdToFetch}/messages`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setCustomerInfo(data.customer);
        setLastRefresh(new Date());
      } else if (response.status === 404) {
        setError('해당 ID의 고객을 찾을 수 없습니다.');
      } else {
        setError('메시지를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId.trim()) {
      setError('고객 ID를 입력해주세요.');
      return;
    }

    setMessages([]);
    setCustomerInfo(null);
    await fetchMessages(customerId);
  };

  const handleRefresh = async () => {
    if (!customerId.trim()) {
      setError('먼저 고객 ID를 입력하고 확인해주세요.');
      return;
    }
    await fetchMessages(customerId);
  };

  const handleMessageClick = async (messageId) => {
    if (actionLoading === messageId) return; // 이미 로딩 중이면 중복 실행 방지
    
    // 읽음 처리
    setActionLoading(messageId);
    try {
      const response = await fetch(`/api/customer/messages/${messageId}/read`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // 서버에서 최신 데이터 다시 가져오기
        await fetchMessages(customerId);
      } else {
        console.error('Failed to mark message as read:', response.status);
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLinkClick = async (messageId, link) => {
    if (actionLoading === messageId) return; // 이미 로딩 중이면 중복 실행 방지
    
    // 클릭 처리
    setActionLoading(messageId);
    try {
      const response = await fetch(`/api/customer/messages/${messageId}/click`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // 서버에서 최신 데이터 다시 가져오기
        await fetchMessages(customerId);
      } else {
        console.error('Failed to mark message as clicked:', response.status);
      }
      
      // 링크 열기 (API 성공 여부와 관계없이)
      window.open(link, '_blank');
    } catch (error) {
      console.error('Error marking message as clicked:', error);
      // 에러가 있어도 링크는 열어줌
      window.open(link, '_blank');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto py-6 px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">📱 받은 문자</h1>
          <Link 
            href="/login" 
            className="text-sm text-gray-600 hover:text-kt-red"
          >
            ← 로그인 페이지로 돌아가기
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="고객 ID를 입력하세요 (예: 1, 2, 3...)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kt-red focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-kt-red text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-kt-red disabled:opacity-50"
            >
              {loading ? '확인중...' : '확인'}
            </button>
            {customerInfo && (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
              >
                {loading ? '새로고침중...' : '🔄 새로고침'}
              </button>
            )}
          </div>
          
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          
          {lastRefresh && (
            <p className="mt-2 text-xs text-gray-500">
              마지막 업데이트: {lastRefresh.toLocaleString('ko-KR')}
            </p>
          )}
        </form>

        {customerInfo && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">👤 {customerInfo.maskedName}</h3>
                <p className="text-sm text-gray-600">{customerInfo.maskedAddress}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  📨 메시지 {messages.length}개
                </p>
                <p className="text-xs text-gray-500">
                  미읽음 {messages.filter(msg => !msg.readAt).length}개
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {messages.length === 0 && customerId && !loading && !error && (
            <div className="text-center py-8 text-gray-500">
              받은 문자가 없습니다.
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              {/* 카카오톡 스타일 헤더 */}
              <div className="bg-yellow-400 px-4 py-2 flex items-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                  K
                </div>
                <div>
                  <p className="font-medium text-gray-900">{message.companyName}</p>
                  <p className="text-xs text-gray-700">광고</p>
                </div>
                <div className="ml-auto text-xs text-gray-700">
                  {new Date(message.sentAt).toLocaleString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              {/* 메시지 내용 */}
              <div 
                className={`p-4 cursor-pointer hover:bg-gray-50 ${actionLoading === message.id ? 'opacity-50' : ''}`}
                onClick={() => handleMessageClick(message.id)}
              >
                <h4 className="font-bold text-gray-900 mb-2">{message.title}</h4>
                <p className="text-gray-700 whitespace-pre-wrap mb-3">
                  {message.messageText}
                </p>
                
                {message.link && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLinkClick(message.id, message.link);
                    }}
                    disabled={actionLoading === message.id}
                    className={`inline-flex items-center px-3 py-1 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed ${actionLoading === message.id ? 'animate-pulse' : ''}`}
                  >
                    {actionLoading === message.id ? '처리중...' : '🔗 링크 확인하기'}
                  </button>
                )}
                
                {/* 읽음/클릭 상태 */}
                <div className="mt-3 flex gap-2 text-xs">
                  {message.readAt && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      ✓ 읽음
                    </span>
                  )}
                  {message.clickAt && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      🔗 클릭함
                    </span>
                  )}
                  {!message.readAt && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">
                      • 새 메시지
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {messages.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            총 {messages.length}개의 메시지
          </div>
        )}
      </div>
    </div>
  );
}
