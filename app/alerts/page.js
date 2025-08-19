'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';

export default function Alerts() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      // 실제 API가 없으므로 샘플 데이터 사용
      const sampleMessages = [
        {
          id: 1,
          text: '갤럭시 폴드7 최저가 판매 캠페인이 성공적으로 발송되었습니다.',
          link: null,
          fromAdmin: true,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
          campaign: {
            title: '갤럭시 폴드7 최저가 판매'
          }
        },
        {
          id: 2,
          text: '🎉 KT 쇼핑몰에서 새로운 이벤트가 시작되었습니다! 갤럭시 폴드7 최저가로 만나보세요.',
          link: 'https://shop.kt.com/',
          fromAdmin: true,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6시간 전
          campaign: null
        },
        {
          id: 3,
          text: '📱 새로운 KT 5G 요금제가 출시되었습니다. 무제한 데이터로 더욱 자유롭게!',
          link: 'https://shop.kt.com/5g',
          fromAdmin: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1일 전
          campaign: null
        }
      ];
      
      setMessages(sampleMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
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
      window.open(link, '_blank');
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
    <ProtectedRoute>
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
