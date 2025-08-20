'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    totalRead: 0,
    totalClick: 0,
    readRate: 0,
    clickRate: 0
  });
  const [chartData, setChartData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 통합 대시보드 통계 API 호출
      const statsRes = await fetch('/api/campaigns/dashboard-stats', {
        credentials: 'include'
      });
      
      if (statsRes.ok) {
        const dashboardData = await statsRes.json();
        
        // 통계 설정
        setStats({
          totalSent: dashboardData.totalSent,
          totalRead: dashboardData.totalRead,
          totalClick: dashboardData.totalClick,
          readRate: dashboardData.readRate ? dashboardData.readRate.toFixed(1) : 0,
          clickRate: dashboardData.clickRate ? dashboardData.clickRate.toFixed(1) : 0
        });
        
        // 차트 데이터 설정
        if (dashboardData.chartData) {
          const chartData = dashboardData.chartData.labels.map((label, index) => ({
            date: new Date(label).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
            sent: dashboardData.chartData.sent[index] || 0,
            read: dashboardData.chartData.read[index] || 0,
            click: dashboardData.chartData.click[index] || 0
          }));
          setChartData(chartData);
        }
        
        // 최근 캠페인 설정
        if (dashboardData.recentCampaigns) {
          setCampaigns(dashboardData.recentCampaigns);
        }
        
        // 나이대별 분포 설정
        if (dashboardData.ageDistribution) {
          setAgeData(dashboardData.ageDistribution);
        }
      } else {
        console.error('Failed to fetch dashboard stats:', await statsRes.text());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const distributionData = [
    { name: '남성', value: 45 },
    { name: '여성', value: 55 },
  ];

  // ageData는 이제 state로 관리됨

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
        
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">대시보드</h1>
          
          {/* KPI 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">총 발송</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSent.toLocaleString()}</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">총 읽음</h3>
              <p className="text-2xl font-bold text-green-600">{stats.totalRead.toLocaleString()}</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">총 클릭</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalClick.toLocaleString()}</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">읽음률</h3>
              <p className="text-2xl font-bold text-green-600">{stats.readRate}%</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">클릭률</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.clickRate}%</p>
            </div>
          </div>
          
          {/* 차트 섹션 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 24시간 라인 차트 */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">최근 7일 캠페인 성과</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sent" stroke="#e91e63" name="발송" />
                  <Line type="monotone" dataKey="read" stroke="#4caf50" name="읽음" />
                  <Line type="monotone" dataKey="click" stroke="#2196f3" name="클릭" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* 나이대별 분포 */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">나이대별 분포</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#e91e63" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* 최근 캠페인 목록 */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">최근 캠페인</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      수신자 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      비용
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      생성일
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <tr key={campaign.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {campaign.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          campaign.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'SENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status === 'COMPLETED' ? '완료' :
                           campaign.status === 'SENDING' ? '발송중' : '초안'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.recipientsCount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.finalCost?.toLocaleString()}원
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(campaign.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
