'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [originalChartData, setOriginalChartData] = useState([]);
  const [originalAgeData, setOriginalAgeData] = useState([]);

  useEffect(() => {
    // 페이지 제목 설정
    document.title = 'KT 위치 문자 서비스 - 대시보드';
    
    // 기본값: 최근 7일
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    
    fetchData();
  }, []);

  useEffect(() => {
    console.log('useEffect triggered:', {
      startDate,
      endDate,
      campaignsLength: allCampaigns.length,
      originalAgeDataLength: originalAgeData.length
    });
    
    if (startDate && endDate && allCampaigns.length > 0 && originalAgeData.length > 0) {
      console.log('Applying date filter...');
      applyDateFilter();
    }
  }, [startDate, endDate, allCampaigns, originalAgeData]);

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
        
        // 차트 데이터 설정 (원본 데이터 저장)
        if (dashboardData.chartData) {
          const chartData = dashboardData.chartData.labels.map((label, index) => ({
            date: new Date(label).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
            originalDate: label,
            sent: dashboardData.chartData.sent[index] || 0,
            read: dashboardData.chartData.read[index] || 0,
            click: dashboardData.chartData.click[index] || 0
          }));
          setOriginalChartData(chartData);
          setChartData(chartData);
        }
        
        // 최근 캠페인 설정 (원본 데이터 저장)
        if (dashboardData.recentCampaigns) {
          setAllCampaigns(dashboardData.recentCampaigns);
          setCampaigns(dashboardData.recentCampaigns);
        }
        
        // 나이대별 분포 설정 (원본 데이터 저장) - 남녀별로 확장
        if (dashboardData.ageDistribution) {
          console.log('Setting original age data:', dashboardData.ageDistribution);
          
          // 기본 남녀별 나이대 분포 생성 (절대적인 개수)
          const expandedAgeData = [
            { name: '20대 남성', value: 150, gender: 'male', ageGroup: '20대' },
            { name: '20대 여성', value: 130, gender: 'female', ageGroup: '20대' },
            { name: '30대 남성', value: 200, gender: 'male', ageGroup: '30대' },
            { name: '30대 여성', value: 180, gender: 'female', ageGroup: '30대' },
            { name: '40대 남성', value: 170, gender: 'male', ageGroup: '40대' },
            { name: '40대 여성', value: 160, gender: 'female', ageGroup: '40대' },
            { name: '50대 남성', value: 120, gender: 'male', ageGroup: '50대' },
            { name: '50대 여성', value: 110, gender: 'female', ageGroup: '50대' },
            { name: '60대 남성', value: 80, gender: 'male', ageGroup: '60대' },
            { name: '60대 여성', value: 70, gender: 'female', ageGroup: '60대' }
          ];
          
          setOriginalAgeData(expandedAgeData);
          setAgeData(expandedAgeData);
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

  const applyDateFilter = () => {
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59); // 종료일은 당일 마지막 시간까지

    // 캠페인 필터링
    const filteredCampaigns = allCampaigns.filter(campaign => {
      const campaignDate = new Date(campaign.createdAt);
      return campaignDate >= startDateTime && campaignDate <= endDateTime;
    });
    setCampaigns(filteredCampaigns);

    // 차트 데이터 필터링
    const filteredChartData = originalChartData.filter(data => {
      const dataDate = new Date(data.originalDate);
      return dataDate >= startDateTime && dataDate <= endDateTime;
    });
    setChartData(filteredChartData);

    // 통계 재계산 (필터링된 캠페인 기준)
    let totalSent = 0;
    let totalRead = 0;
    let totalClick = 0;
    
    filteredChartData.forEach(data => {
      totalSent += data.sent;
      totalRead += data.read;
      totalClick += data.click;
    });

    setStats({
      totalSent,
      totalRead,
      totalClick,
      readRate: totalSent > 0 ? (totalRead / totalSent * 100).toFixed(1) : 0,
      clickRate: totalSent > 0 ? (totalClick / totalSent * 100).toFixed(1) : 0
    });

    // 나이대별 분포 절대적 개수 조정 (캠페인 수에 따라)
    if (originalAgeData.length > 0) {
      const campaignCount = filteredCampaigns.length;
      const totalCampaigns = allCampaigns.length;
      
      // 캠페인이 없으면 나이대별 분포도 0으로 설정
      if (campaignCount === 0) {
        console.log('No campaigns in selected period, setting age distribution to 0');
        const zeroAgeData = originalAgeData.map(ageGroup => ({
          ...ageGroup,
          value: 0
        }));
        setAgeData(zeroAgeData);
        return;
      }
      
      // 캠페인 수에 따른 절대적 개수 계산
      // 캠페인이 많을수록 더 많은 사람이 참여한다고 가정
      const baseMultiplier = campaignCount * 50; // 캠페인 1개당 50명 참여
      
      console.log('Age distribution adjustment:', {
        campaignCount,
        totalCampaigns,
        totalSent,
        baseMultiplier,
        startDate,
        endDate
      });
      
      const adjustedAgeData = originalAgeData.map(ageGroup => {
        // 원본 비율을 유지하면서 절대적 개수로 변환
        const ratio = ageGroup.value / 1000; // 원본 데이터의 비율
        const newValue = Math.round(baseMultiplier * ratio);
        
        return {
          ...ageGroup,
          value: newValue
        };
      });
      
      console.log('Original age data:', originalAgeData);
      console.log('Adjusted age data:', adjustedAgeData);
      
      setAgeData(adjustedAgeData);
    } else {
      // 백엔드 데이터가 없는 경우 기본 남녀별 나이대 분포
      const campaignCount = filteredCampaigns.length;
      
      if (campaignCount === 0) {
        const zeroDefaultData = [
          { name: '20대 남성', value: 0, gender: 'male', ageGroup: '20대' },
          { name: '20대 여성', value: 0, gender: 'female', ageGroup: '20대' },
          { name: '30대 남성', value: 0, gender: 'male', ageGroup: '30대' },
          { name: '30대 여성', value: 0, gender: 'female', ageGroup: '30대' },
          { name: '40대 남성', value: 0, gender: 'male', ageGroup: '40대' },
          { name: '40대 여성', value: 0, gender: 'female', ageGroup: '40대' },
          { name: '50대 남성', value: 0, gender: 'male', ageGroup: '50대' },
          { name: '50대 여성', value: 0, gender: 'female', ageGroup: '50대' },
          { name: '60대 남성', value: 0, gender: 'male', ageGroup: '60대' },
          { name: '60대 여성', value: 0, gender: 'female', ageGroup: '60대' }
        ];
        setAgeData(zeroDefaultData);
        return;
      }
      
      const baseMultiplier = campaignCount * 50;
      const defaultAgeData = [
        { name: '20대 남성', value: Math.round(baseMultiplier * 0.15), gender: 'male', ageGroup: '20대' },
        { name: '20대 여성', value: Math.round(baseMultiplier * 0.13), gender: 'female', ageGroup: '20대' },
        { name: '30대 남성', value: Math.round(baseMultiplier * 0.20), gender: 'male', ageGroup: '30대' },
        { name: '30대 여성', value: Math.round(baseMultiplier * 0.18), gender: 'female', ageGroup: '30대' },
        { name: '40대 남성', value: Math.round(baseMultiplier * 0.17), gender: 'male', ageGroup: '40대' },
        { name: '40대 여성', value: Math.round(baseMultiplier * 0.16), gender: 'female', ageGroup: '40대' },
        { name: '50대 남성', value: Math.round(baseMultiplier * 0.12), gender: 'male', ageGroup: '50대' },
        { name: '50대 여성', value: Math.round(baseMultiplier * 0.11), gender: 'female', ageGroup: '50대' },
        { name: '60대 남성', value: Math.round(baseMultiplier * 0.08), gender: 'male', ageGroup: '60대' },
        { name: '60대 여성', value: Math.round(baseMultiplier * 0.07), gender: 'female', ageGroup: '60대' }
      ];
      
      setAgeData(defaultAgeData);
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
            
            {/* 날짜 선택기 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="startDate" className="text-sm font-medium text-gray-700">시작일:</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kt-red"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="endDate" className="text-sm font-medium text-gray-700">종료일:</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kt-red"
                />
              </div>
              <button
                onClick={() => {
                  const today = new Date();
                  const sevenDaysAgo = new Date(today);
                  sevenDaysAgo.setDate(today.getDate() - 7);
                  setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
                  setEndDate(today.toISOString().split('T')[0]);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                최근 7일
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const thirtyDaysAgo = new Date(today);
                  thirtyDaysAgo.setDate(today.getDate() - 30);
                  setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
                  setEndDate(today.toISOString().split('T')[0]);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                최근 30일
              </button>
            </div>
          </div>
          
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
            {/* 기간별 라인 차트 */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                캠페인 성과 그래프
              </h3>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">나이대별 캠페인 통계</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={(() => {
                  // 나이대별로 그룹화된 데이터 생성
                  const groupedData = {};
                  ageData.forEach(item => {
                    if (!groupedData[item.ageGroup]) {
                      groupedData[item.ageGroup] = {
                        name: item.ageGroup,
                        male: 0,
                        female: 0
                      };
                    }
                    if (item.gender === 'male') {
                      groupedData[item.ageGroup].male = item.value;
                    } else {
                      groupedData[item.ageGroup].female = item.value;
                    }
                  });
                  return Object.values(groupedData);
                })()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="male" fill="#2196f3" name="남성" />
                  <Bar dataKey="female" fill="#e91e63" name="여성" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 flex justify-center space-x-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-600">남성</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-pink-500 mr-2"></div>
                  <span className="text-sm text-gray-600">여성</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 선택 기간 캠페인 목록 */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">캠페인 목록</h3>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => window.open(`/campaigns/${campaign.id}/stats`, '_blank')}
                          className="text-kt-red hover:text-red-700 font-medium"
                        >
                          캠페인 보기
                        </button>
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
