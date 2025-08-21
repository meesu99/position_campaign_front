'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';

export default function Alerts() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'KT 위치 문자 서비스 - 알림';
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      // 실제 캠페인 데이터 기반 알림 생성
      const campaignsRes = await fetch('/api/campaigns', {
        credentials: 'include'
      });

      if (campaignsRes.ok) {
        const campaigns = await campaignsRes.json();
        
        // 완료된 캠페인들을 기반으로 알림 생성
        const campaignNotifications = campaigns
          .filter(campaign => campaign.status === 'COMPLETED')
          .slice(0, 10) // 최근 10개만
          .map((campaign, index) => ({
            id: `campaign-${campaign.id}`,
            text: `"${campaign.title}" 캠페인이 성공적으로 발송되었습니다. ${campaign.recipientsCount}명에게 전달되었습니다.`,
            link: `/campaigns/${campaign.id}/stats`,
            fromAdmin: false,
            createdAt: campaign.createdAt,
            campaign: {
              id: campaign.id,
              title: campaign.title,
              status: campaign.status,
              recipientsCount: campaign.recipientsCount
            }
          }));

        // 시스템 알림 추가
        const systemNotifications = [
          {
            id: 'system-1',
            text: '🎉 KT 위치 문자 서비스에 오신 것을 환영합니다! 효과적인 위치 기반 마케팅을 시작해보세요.',
            link: '/campaigns/new',
            fromAdmin: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1일 전
            campaign: null
          },
          {
            id: 'system-2', 
            text: '💡 팁: 대시보드에서 캠페인 성과를 실시간으로 확인하고 날짜별 필터링도 가능합니다.',
            link: '/dashboard',
            fromAdmin: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
            campaign: null
          }
        ];

        // 모든 알림을 시간순으로 정렬
        const allNotifications = [...campaignNotifications, ...systemNotifications]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setMessages(allNotifications);
      } else {
        console.error('Failed to fetch campaigns for notifications');
        // 오류 시 기본 메시지만 표시
        setMessages([
          {
            id: 'error-1',
            text: '알림을 불러오는 중 오류가 발생했습니다. 새로고침해 주세요.',
            link: null,
            fromAdmin: true,
            createdAt: new Date().toISOString(),
            campaign: null
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else {
      return `${diffDays}일 전`;
    }
  };

  const handleLinkClick = (link) => {
    if (link) {
      if (link.startsWith('http')) {
        // 외부 링크는 새 탭에서 열기
        window.open(link, '_blank');
      } else {
        // 내부 링크는 같은 탭에서 이동
        window.location.href = link;
      }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-kt-red"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute adminRestricted={true}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">알림함</h1>
          
          <div className="card">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📭</div>
                  <p className="text-gray-500">알림이 없습니다.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg border transition-colors duration-200 ${
                      message.link 
                        ? 'border-kt-red bg-kt-red bg-opacity-5 hover:bg-opacity-10 cursor-pointer' 
                        : 'border-gray-200 bg-white'
                    }`}
                    onClick={() => handleLinkClick(message.link)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* 발신자 표시 */}
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 bg-kt-red rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                            KT
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {message.fromAdmin ? 'KT 관리자' : '시스템'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        {/* 메시지 내용 */}
                        <div className="ml-11">
                          <p className="text-gray-800 leading-relaxed">
                            {message.text}
                          </p>
                          
                          {/* 캠페인 정보 */}
                          {message.campaign && (
                            <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-600">
                              캠페인: {message.campaign.title}
                            </div>
                          )}
                          
                          {/* 링크 프리뷰 */}
                          {message.link && (
                            <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-kt-red rounded flex items-center justify-center text-white font-bold">
                                  KT
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">KT 쇼핑몰</p>
                                  <p className="text-sm text-gray-600">최신 스마트폰과 요금제를 만나보세요</p>
                                  <p className="text-xs text-kt-red">{message.link}</p>
                                </div>
                                <div className="text-gray-400">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* 안내 메시지 */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>💡 링크가 있는 알림을 클릭하면 해당 페이지로 이동합니다.</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
