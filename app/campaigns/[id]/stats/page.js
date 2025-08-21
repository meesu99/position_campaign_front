'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Navbar from '../../../components/Navbar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CampaignStats() {
  const params = useParams();
  const campaignId = params.id;
  
  const [campaign, setCampaign] = useState(null);
  const [stats, setStats] = useState({
    sent: 0,
    read: 0,
    click: 0,
    readRate: 0,
    clickRate: 0
  });
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'KT 위치 문자 서비스 - 캠페인 상세';
    fetchCampaignStats();
  }, [campaignId]);

  const fetchCampaignStats = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/stats`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCampaign(data.campaign);
        setStats({
          sent: data.sent,
          read: data.read,
          click: data.click,
          readRate: data.readRate,
          clickRate: data.clickRate
        });
        
        // 실제 시간별 데이터 설정
        if (data.hourlyData && data.hourlyData.hourlyStats) {
          setHourlyData(data.hourlyData.hourlyStats);
        } else {
          // 백엔드에서 데이터가 없는 경우 빈 배열
          setHourlyData([]);
        }
      } else {
        console.error('Failed to fetch campaign stats');
      }
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
    } finally {
      setLoading(false);
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

  if (!campaign) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">캠페인을 찾을 수 없습니다.</h1>
              <button 
                onClick={() => window.close()}
                className="mt-4 px-4 py-2 bg-kt-red text-white rounded-md hover:bg-red-700"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // 차트 데이터가 없는 경우 메시지 표시용
  const hasHourlyData = hourlyData && hourlyData.length > 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
              <p className="text-gray-600 mt-2">캠페인 상세 통계</p>
            </div>
            <button 
              onClick={() => window.close()}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              닫기
            </button>
          </div>

          {/* 캠페인 기본 정보 */}
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">캠페인 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">상태</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  campaign.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'SENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {campaign.status === 'COMPLETED' ? '완료' :
                   campaign.status === 'SENDING' ? '발송중' : '초안'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">수신자 수</label>
                <p className="text-lg font-semibold text-gray-900">{campaign.recipientsCount?.toLocaleString()}명</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">비용</label>
                <p className="text-lg font-semibold text-gray-900">{campaign.finalCost?.toLocaleString()}원</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">생성일</label>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(campaign.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
            
            {/* 메시지 내용 */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">메시지 내용</label>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-800">{campaign.messageText || '메시지 내용이 없습니다.'}</p>
                {campaign.link && (
                  <div className="mt-2">
                    <a href={campaign.link} target="_blank" rel="noopener noreferrer" 
                       className="text-kt-red hover:underline">
                      {campaign.link}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">발송</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.sent.toLocaleString()}</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">읽음</h3>
              <p className="text-2xl font-bold text-green-600">{stats.read.toLocaleString()}</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">클릭</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.click.toLocaleString()}</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">읽음률</h3>
              <p className="text-2xl font-bold text-green-600">{Math.round(stats.readRate)}%</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">클릭률</h3>
              <p className="text-2xl font-bold text-blue-600">{Math.round(stats.clickRate)}%</p>
            </div>
          </div>

          {/* 시간별 성과 차트 */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">시간별 성과</h3>
            
            {hasHourlyData ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sent" stroke="#e91e63" name="발송" />
                    <Line type="monotone" dataKey="read" stroke="#4caf50" name="읽음" />
                    <Line type="monotone" dataKey="click" stroke="#2196f3" name="클릭" />
                  </LineChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📊</div>
                <p className="text-gray-500 mb-2">시간별 데이터가 없습니다.</p>
                <p className="text-sm text-gray-400">
                  캠페인이 발송되고 고객들이 반응하면 시간별 성과가 표시됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
