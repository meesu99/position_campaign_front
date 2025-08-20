'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import MapComponent from '../../components/MapComponent';

// 가격 계산 함수 - 새로운 구조에 맞게 수정
function activeFilterCount(filters) {
  let count = 0;
  if (filters.gender?.enabled) count++;
  if (filters.ageRange?.enabled) count++;
  if (filters.region?.enabled) count++;
  if (filters.radius?.enabled) count++;
  return count;
}

function unitPriceByFilters(n) {
  const table = [50, 70, 90, 110, 130, 150];
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
    gender: {
      enabled: false,
      value: ''
    },
    ageRange: {
      enabled: false,
      value: [20, 60]
    },
    region: {
      enabled: false,
      value: {
        sido: '',
        sigungu: ''
      }
    },
    radius: {
      enabled: false,
      value: {
        lat: 37.5665,
        lng: 126.9780,
        meters: 1000
      }
    }
  });
  
  const [preview, setPreview] = useState({
    recipients: 0,
    unitPrice: 0,
    estimatedCost: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [addressSearchMode, setAddressSearchMode] = useState(false);
  const [filteredCustomerCount, setFilteredCustomerCount] = useState(0);
  const [regions, setRegions] = useState({ sidos: [], sigungus: [] });

  // 컴포넌트 마운트 시 지역 데이터 가져오기
  useEffect(() => {
    fetchRegions();
  }, []);

  // 필터가 변경될 때마다 미리보기 업데이트
  useEffect(() => {
    updatePreview();
  }, [filters]);

  // 지역 데이터 가져오기
  const fetchRegions = async () => {
    try {
      console.log('Fetching regions data...');
      const response = await fetch('/api/campaigns/customers?page=0&size=10000', {
        credentials: 'include'
      });
      
      console.log('Regions fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        const customers = data.customers || [];
        console.log('Customers for regions:', customers.length);
        
        // 고유한 시도와 시군구 추출
        const sidoSet = new Set();
        const sigunguMap = new Map();
        
        customers.forEach(customer => {
          if (customer.sido) {
            sidoSet.add(customer.sido);
            if (customer.sigungu) {
              if (!sigunguMap.has(customer.sido)) {
                sigunguMap.set(customer.sido, new Set());
              }
              sigunguMap.get(customer.sido).add(customer.sigungu);
            }
          }
        });
        
        const sidos = Array.from(sidoSet).sort();
        const sigungus = {};
        sigunguMap.forEach((value, key) => {
          sigungus[key] = Array.from(value).sort();
        });
        
        console.log('Extracted regions:', { sidos: sidos.length, sigungus: Object.keys(sigungus).length });
        setRegions({ sidos, sigungus });
      } else {
        console.error('Failed to fetch regions. Status:', response.status);
        // 기본 지역 데이터 사용
        setRegions({
          sidos: ['서울특별시', '경기도', '인천광역시', '부산광역시', '대구광역시'],
          sigungus: {
            '서울특별시': ['강남구', '중구', '마포구', '종로구', '용산구'],
            '경기도': ['성남시 분당구', '수원시 영통구', '고양시 일산동구'],
            '인천광역시': ['남동구', '연수구', '중구']
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch regions:', error);
      // 기본 지역 데이터 사용
      setRegions({
        sidos: ['서울특별시', '경기도', '인천광역시', '부산광역시', '대구광역시'],
        sigungus: {
          '서울특별시': ['강남구', '중구', '마포구', '종로구', '용산구'],
          '경기도': ['성남시 분당구', '수원시 영통구', '고양시 일산동구'],
          '인천광역시': ['남동구', '연수구', '중구']
        }
      });
    }
  };

  const updatePreview = () => {
    try {
      // 실시간 클라이언트 사이드 계산 사용
      const activeFilters = activeFilterCount(filters);
      const unitPrice = unitPriceByFilters(activeFilters);
      const recipients = filteredCustomerCount > 0 ? filteredCustomerCount : 0;
      setPreview({
        recipients,
        unitPrice,
        estimatedCost: recipients * unitPrice
      });
    } catch (error) {
      console.error('Preview error:', error);
    }
  };

  // 고객 수가 변경될 때마다 미리보기 업데이트
  useEffect(() => {
    updatePreview();
  }, [filteredCustomerCount]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { 
      ...filters, 
      [field]: { 
        ...filters[field], 
        value: value 
      } 
    };
    setFilters(newFilters);
  };

  const handleFilterToggle = (field) => {
    const newFilters = { 
      ...filters, 
      [field]: { 
        ...filters[field], 
        enabled: !filters[field].enabled 
      } 
    };
    setFilters(newFilters);
  };



  // 주소 검색 팝업 열기
  const openAddressSearch = () => {
    if (typeof window !== 'undefined' && window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function(data) {
          // 지오코딩을 통해 위도/경도 획득
          geocodeAddress(data.roadAddress);
        }
      }).open();
    }
  };

  // 주소를 위도/경도로 변환 (지오코딩)
  const geocodeAddress = (address) => {
    if (typeof window !== 'undefined' && window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      
      geocoder.addressSearch(address, function(result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          const lat = parseFloat(result[0].y);
          const lng = parseFloat(result[0].x);
          
          // 반경 설정에 새 좌표 적용하고 반경 필터 활성화
          const newFilters = {
            ...filters,
            radius: {
              enabled: true,
              value: {
                ...filters.radius.value,
                lat: lat,
                lng: lng
              }
            }
          };
          setFilters(newFilters);
          alert(`주소: ${address}\n좌표가 설정되어 반경 필터가 활성화되었습니다: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } else {
          console.error('지오코딩 실패:', status);
          alert('주소를 좌표로 변환하는데 실패했습니다.');
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!confirm(`${preview.estimatedCost.toLocaleString()}원을 사용하여 캠페인을 발송하시겠습니까?`)) {
      return;
    }

    setLoading(true);
    try {
      // 캠페인 생성
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
      } else {
        const error = await createResponse.json();
        alert(error.error || '캠페인 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Campaign creation and send error:', error);
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">타겟 설정</h3>
                  <div className="text-sm text-gray-600">
                    활성 필터: <span className="font-bold text-kt-red">{activeFilterCount(filters)}개</span>
                  </div>
                </div>
                <div className="space-y-6">
                  {/* 성별 */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">성별 필터</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.gender.enabled}
                          onChange={() => handleFilterToggle('gender')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <select
                      value={filters.gender.value}
                      onChange={(e) => handleFilterChange('gender', e.target.value)}
                      className={`input-field ${!filters.gender.enabled ? 'bg-gray-100 text-gray-400' : ''}`}
                      disabled={!filters.gender.enabled}
                    >
                      <option value="">전체</option>
                      <option value="M">남성</option>
                      <option value="F">여성</option>
                    </select>
                  </div>

                  {/* 나이대 */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">나이대 필터</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.ageRange.enabled}
                          onChange={() => handleFilterToggle('ageRange')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={filters.ageRange.value[0]}
                        onChange={(e) => handleFilterChange('ageRange', [parseInt(e.target.value), filters.ageRange.value[1]])}
                        className={`input-field ${!filters.ageRange.enabled ? 'bg-gray-100 text-gray-400' : ''}`}
                        placeholder="최소"
                        min="0"
                        max="100"
                        disabled={!filters.ageRange.enabled}
                      />
                      <span className="self-center">~</span>
                      <input
                        type="number"
                        value={filters.ageRange.value[1]}
                        onChange={(e) => handleFilterChange('ageRange', [filters.ageRange.value[0], parseInt(e.target.value)])}
                        className={`input-field ${!filters.ageRange.enabled ? 'bg-gray-100 text-gray-400' : ''}`}
                        placeholder="최대"
                        min="0"
                        max="100"
                        disabled={!filters.ageRange.enabled}
                      />
                    </div>
                  </div>

                  {/* 지역 */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">지역 필터</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.region.enabled}
                          onChange={() => handleFilterToggle('region')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <select
                        value={filters.region.value.sido}
                        onChange={(e) => {
                          const newSido = e.target.value;
                          handleFilterChange('region', { 
                            sido: newSido, 
                            sigungu: '' // 시도 변경 시 시군구 초기화
                          });
                        }}
                        className={`input-field ${!filters.region.enabled ? 'bg-gray-100 text-gray-400' : ''}`}
                        disabled={!filters.region.enabled}
                      >
                        <option value="">시도 선택</option>
                        {regions.sidos.map(sido => (
                          <option key={sido} value={sido}>{sido}</option>
                        ))}
                      </select>
                      
                      <select
                        value={filters.region.value.sigungu}
                        onChange={(e) => handleFilterChange('region', { 
                          ...filters.region.value, 
                          sigungu: e.target.value 
                        })}
                        className={`input-field ${!filters.region.enabled ? 'bg-gray-100 text-gray-400' : ''}`}
                        disabled={!filters.region.enabled || !filters.region.value.sido}
                      >
                        <option value="">시군구 선택</option>
                        {filters.region.value.sido && regions.sigungus[filters.region.value.sido]?.map(sigungu => (
                          <option key={sigungu} value={sigungu}>{sigungu}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 반경 */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">반경 필터</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.radius.enabled}
                          onChange={() => handleFilterToggle('radius')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {filters.radius.enabled ? '반경 필터가 활성화되었습니다. 주소로 위치를 설정하세요.' : '반경 필터를 활성화하면 지도에서 위치 기반 타겟팅을 할 수 있습니다.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 지도 및 미리보기 */}
            <div className="space-y-6">
              {/* 지도 */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">반경 설정</h3>
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={openAddressSearch}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
                  >
                    📍 주소로 위치 설정
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    주소 검색으로 정확한 위치를 설정하세요.
                  </p>
                </div>
                <MapComponent 
                  filters={filters} 
                  onFiltersChange={setFilters}
                  onCustomerCountChange={setFilteredCustomerCount}
                />
              </div>

              {/* 미리보기 */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">캠페인 미리보기</h3>
                
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-blue-700">활성 필터 수:</span>
                      <span className="font-bold text-blue-900">{activeFilterCount(filters)}개</span>
                    </div>
                    <div className="text-xs text-blue-600">
                      필터를 더 추가할수록 타겟팅이 정확해지고 단가가 올라갑니다
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">예상 수신자:</span>
                    <span className="font-semibold">{preview.recipients.toLocaleString()}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">단가 ({activeFilterCount(filters)}개 필터):</span>
                    <span className="font-semibold">{preview.unitPrice}원</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">예상 비용:</span>
                    <span className="font-bold text-kt-red">{preview.estimatedCost.toLocaleString()}원</span>
                  </div>
                  
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    ✅ 실시간으로 정확한 금액이 계산됩니다
                  </div>
                </div>
              </div>

              {/* 버튼 */}
              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.title || !formData.messageText || preview.estimatedCost <= 0}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '발송 중...' : '🚀 캠페인 발송'}
                </button>
                
                <div className="text-xs text-gray-500 text-center">
                  캠페인이 즉시 발송됩니다. 비용: {preview.estimatedCost.toLocaleString()}원
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
