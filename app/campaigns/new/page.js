'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import MapComponent from '../../components/MapComponent';

// 가격 계산 함수
function activeFilterCount(filters) {
  let count = 0;
  if (filters.gender && filters.gender.length) count++;
  if (filters.ageRange && filters.ageRange.length === 2) count++;
  if (filters.region && ((filters.region.sido?.length || 0) + (filters.region.sigungu?.length || 0)) > 0) count++;
  if (filters.radius && filters.radius.meters > 0) count++;
  return count;
}

function unitPriceByFilters(n) {
  const table = [0, 50, 70, 90, 110, 130];
  return table[Math.min(n, 5)];
}

export default function NewCampaign() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    messageText: '',
    link: ''
  });
  
  const [filters, setFilters] = useState({
    gender: '',
    ageRange: [20, 60],
    region: {
      sido: '',
      sigungu: ''
    },
    radius: {
      lat: 37.5665,
      lng: 126.9780,
      meters: 1000
    }
  });
  
  const [preview, setPreview] = useState({
    recipients: 0,
    unitPrice: 0,
    estimatedCost: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // 필터가 변경될 때마다 미리보기 업데이트
  useEffect(() => {
    updatePreview();
  }, [filters]);

  const updatePreview = async () => {
    setPreviewLoading(true);
    try {
      const response = await fetch('/api/campaigns/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ filters }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreview(data);
      }
    } catch (error) {
      console.error('Preview error:', error);
      // 오프라인 계산
      const activeFilters = activeFilterCount(filters);
      const unitPrice = unitPriceByFilters(activeFilters);
      const recipients = 100; // 기본값
      setPreview({
        recipients,
        unitPrice,
        estimatedCost: recipients * unitPrice
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          filters
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push('/dashboard');
      } else {
        const error = await response.json();
        alert(error.error || '캠페인 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Create campaign error:', error);
      alert('캠페인 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!confirm(`${preview.estimatedCost.toLocaleString()}원을 사용하여 캠페인을 발송하시겠습니까?`)) {
      return;
    }

    setLoading(true);
    try {
      // 먼저 캠페인 생성
      const createResponse = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          filters
        }),
      });

      if (createResponse.ok) {
        const campaignData = await createResponse.json();
        
        // 바로 발송
        const sendResponse = await fetch(`/api/campaigns/${campaignData.campaign.id}/send`, {
          method: 'POST',
          credentials: 'include'
        });

        if (sendResponse.ok) {
          alert('캠페인이 발송되었습니다!');
          router.push('/dashboard');
        } else {
          const error = await sendResponse.json();
          alert(error.error || '캠페인 발송에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('Send campaign error:', error);
      alert('캠페인 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">새 캠페인 생성</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 왼쪽: 필터 설정 */}
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">캠페인 정보</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      캠페인 제목
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="예: 갤럭시 폴드7 최저가 판매"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      메시지
                    </label>
                    <textarea
                      name="messageText"
                      value={formData.messageText}
                      onChange={handleInputChange}
                      rows={3}
                      className="input-field"
                      placeholder="고객에게 보낼 메시지를 입력하세요"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      링크 URL
                    </label>
                    <input
                      type="url"
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="https://shop.kt.com/"
                    />
                  </div>
                </div>
              </div>

              {/* 타겟 필터 */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">타겟 설정</h3>
                <div className="space-y-4">
                  {/* 성별 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
                    <select
                      value={filters.gender}
                      onChange={(e) => handleFilterChange('gender', e.target.value)}
                      className="input-field"
                    >
                      <option value="">전체</option>
                      <option value="M">남성</option>
                      <option value="F">여성</option>
                    </select>
                  </div>

                  {/* 나이대 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">나이대</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={filters.ageRange[0]}
                        onChange={(e) => handleFilterChange('ageRange', [parseInt(e.target.value), filters.ageRange[1]])}
                        className="input-field"
                        placeholder="최소"
                        min="0"
                        max="100"
                      />
                      <span className="self-center">~</span>
                      <input
                        type="number"
                        value={filters.ageRange[1]}
                        onChange={(e) => handleFilterChange('ageRange', [filters.ageRange[0], parseInt(e.target.value)])}
                        className="input-field"
                        placeholder="최대"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  {/* 지역 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">지역</label>
                    <div className="space-y-2">
                      <select
                        value={filters.region.sido}
                        onChange={(e) => handleFilterChange('region', { ...filters.region, sido: e.target.value })}
                        className="input-field"
                      >
                        <option value="">시도 선택</option>
                        <option value="서울특별시">서울특별시</option>
                        <option value="경기도">경기도</option>
                        <option value="인천광역시">인천광역시</option>
                      </select>
                      
                      <select
                        value={filters.region.sigungu}
                        onChange={(e) => handleFilterChange('region', { ...filters.region, sigungu: e.target.value })}
                        className="input-field"
                      >
                        <option value="">시군구 선택</option>
                        <option value="강남구">강남구</option>
                        <option value="중구">중구</option>
                        <option value="마포구">마포구</option>
                        <option value="성남시 분당구">성남시 분당구</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 지도 및 미리보기 */}
            <div className="space-y-6">
              {/* 지도 */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">반경 설정</h3>
                <MapComponent 
                  filters={filters} 
                  onFiltersChange={setFilters}
                />
              </div>

              {/* 미리보기 */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">캠페인 미리보기</h3>
                {previewLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kt-red mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">예상 수신자:</span>
                      <span className="font-semibold">{preview.recipients.toLocaleString()}명</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">단가:</span>
                      <span className="font-semibold">{preview.unitPrice}원</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">예상 비용:</span>
                      <span className="font-bold text-kt-red">{preview.estimatedCost.toLocaleString()}원</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.title || !formData.messageText}
                  className="btn-primary w-full"
                >
                  {loading ? '저장 중...' : '초안으로 저장'}
                </button>
                
                <button
                  onClick={handleSendCampaign}
                  disabled={loading || !formData.title || !formData.messageText}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '발송 중...' : '즉시 발송'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
