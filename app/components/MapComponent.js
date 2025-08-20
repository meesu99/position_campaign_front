'use client';

import { useEffect, useRef, useState } from 'react';

const MapComponent = ({ filters, onFiltersChange, onCustomerCountChange }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleRef = useRef(null);
  const heatmapLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [customers, setCustomers] = useState([]);
  const mapId = useRef(`map-${Math.random().toString(36).substr(2, 9)}`);

  // 고객 데이터 가져오기
  const fetchCustomers = async () => {
    try {
      console.log('Fetching customers for map...');
      const response = await fetch('/api/campaigns/customers?page=0&size=1000', {
        credentials: 'include'
      });
      
      console.log('Customer fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Customer data received:', data.customers?.length || 0, 'customers');
        setCustomers(data.customers || []);
      } else {
        console.error('Failed to fetch customers. Status:', response.status);
        // 권한 문제일 경우 빈 배열로 처리
        setCustomers([]);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setCustomers([]);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !mapInstanceRef.current) {
      // 기존 지도 인스턴스가 있으면 제거
      if (mapRef.current._leaflet_id) {
        mapRef.current._leaflet_id = null;
      }
      
      // DOM 요소 완전 정리
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
        // Leaflet 관련 클래스와 속성 제거
        mapRef.current.className = mapRef.current.className.replace(/leaflet-[^\s]*/g, '');
        if (mapRef.current._leaflet) {
          delete mapRef.current._leaflet;
        }
      }

      import('leaflet').then((L) => {
        // Leaflet CSS 동적 로딩
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // 기본 아이콘 설정
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
        });

        try {
          // 지도 생성
          const map = L.map(mapRef.current, {
            center: [37.5665, 126.9780], // 서울시청
            zoom: 11,
            zoomControl: true
          });

          // OpenStreetMap 타일 추가
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          mapInstanceRef.current = map;
          setIsMapLoaded(true);

          // 기존 반경 필터가 있으면 표시
          if (filters.radius?.enabled && filters.radius.value) {
            const { lat, lng, meters } = filters.radius.value;
            if (lat && lng && meters > 0) {
              showRadius(L, map, lat, lng, meters);
            }
          }

          // 고객 히트맵 표시
          updateCustomerHeatmap(L, map);

          // 클릭 이벤트 추가 (반경 필터가 활성화된 경우에만)
          map.on('click', (e) => {
            if (filters.radius?.enabled) {
              const { lat, lng } = e.latlng;
              const meters = filters.radius.value?.meters || 1000;
              
              showRadius(L, map, lat, lng, meters);
              
              const newFilters = {
                ...filters,
                radius: { 
                  enabled: true,
                  value: { lat, lng, meters }
                }
              };
              onFiltersChange(newFilters);
            }
          });
        } catch (error) {
          console.error('Map initialization error:', error);
        }
      }).catch((error) => {
        console.error('Leaflet import error:', error);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.error('Map cleanup error:', error);
        } finally {
          mapInstanceRef.current = null;
        }
      }
    };
  }, []);

  // 고객 데이터가 변경되거나 필터가 변경될 때 히트맵 업데이트
  useEffect(() => {
    if (mapInstanceRef.current && customers.length > 0) {
      import('leaflet').then((L) => {
        updateCustomerHeatmap(L, mapInstanceRef.current);
      });
    }
    
    // 필터링된 고객 수를 부모 컴포넌트에 전달
    if (onCustomerCountChange && customers.length > 0) {
      const filteredCount = getFilteredCustomers().length;
      onCustomerCountChange(filteredCount);
    }
  }, [customers, filters]);

  // 필터링된 고객 데이터 가져오기 - 새로운 구조에 맞게 수정
  const getFilteredCustomers = () => {
    return customers.filter(customer => {
      // 성별 필터
      if (filters.gender?.enabled && filters.gender.value && customer.gender !== filters.gender.value) {
        return false;
      }
      
      // 나이 필터
      if (filters.ageRange?.enabled && filters.ageRange.value && filters.ageRange.value.length === 2) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - (customer.birthYear || 0);
        if (age < filters.ageRange.value[0] || age > filters.ageRange.value[1]) {
          return false;
        }
      }
      
      // 지역 필터
      if (filters.region?.enabled) {
        if (filters.region.value.sido && customer.sido !== filters.region.value.sido) {
          return false;
        }
        if (filters.region.value.sigungu && customer.sigungu !== filters.region.value.sigungu) {
          return false;
        }
      }
      
      // 반경 필터
      if (filters.radius?.enabled && filters.radius.value) {
        const { lat, lng, meters } = filters.radius.value;
        if (lat && lng && meters > 0) {
          const distance = calculateDistance(lat, lng, customer.lat, customer.lng);
          if (distance > meters) {
            return false;
          }
        }
      }
      
      return true;
    });
  };

  // 두 점 사이의 거리 계산 (미터)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // 미터 단위 거리
  };

  // 고객 히트맵 업데이트
  const updateCustomerHeatmap = async (L, map) => {
    try {
      // 기존 히트맵 레이어 제거
      if (heatmapLayerRef.current) {
        map.removeLayer(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }

      // 기존 마커 레이어 제거
      if (markersLayerRef.current) {
        map.removeLayer(markersLayerRef.current);
        markersLayerRef.current = null;
      }

      // 모든 레이어 완전 제거 (기존 마커들도 포함)
      map.eachLayer((layer) => {
        if (layer.options && (layer.options.isCustomerMarker || layer.options.isHeatmapLayer)) {
          map.removeLayer(layer);
        }
      });

      const filteredCustomers = getFilteredCustomers();
      
      console.log('Updating heatmap with filtered customers:', filteredCustomers.length);
      console.log('Total customers available:', customers.length);
      
      if (filteredCustomers.length === 0) {
        console.log('No filtered customers to display on map');
        return;
      }

      // 히트맵 데이터 준비 (필터링된 고객만)
      const heatmapData = filteredCustomers
        .filter(customer => customer.lat && customer.lng)
        .map(customer => [customer.lat, customer.lng, 1]);

      console.log('Heatmap data points:', heatmapData.length);

      if (heatmapData.length === 0) return;

      // Leaflet.heat 플러그인 동적 로딩
      if (!window.L.heatLayer) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/leaflet.heat@0.2.0/dist/leaflet-heat.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // 히트맵 레이어 생성
      const heatmapLayer = L.heatLayer(heatmapData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.0: 'blue',
          0.2: 'lime',
          0.4: 'yellow',
          0.6: 'orange',
          0.8: 'red',
          1.0: 'magenta'
        }
      });

      // 레이어에 식별자 추가
      heatmapLayer.options.isHeatmapLayer = true;
      heatmapLayer.addTo(map);

      heatmapLayerRef.current = heatmapLayer;
      console.log('Heatmap layer created and added to map with', heatmapData.length, 'filtered data points');

    } catch (error) {
      console.error('Heatmap update error:', error);
      // 히트맵 실패시 마커로 대체 표시
      showCustomerMarkers(L, map);
    }
  };

  // 히트맵 실패시 마커로 고객 위치 표시 (필터링된 고객만)
  const showCustomerMarkers = (L, map) => {
    const filteredCustomers = getFilteredCustomers();
    
    console.log('Showing customer markers for filtered customers:', filteredCustomers.length);
    
    // 마커 레이어 그룹 생성
    const markersGroup = L.layerGroup();
    markersGroup.options.isCustomerMarker = true;
    
    filteredCustomers.forEach(customer => {
      if (customer.lat && customer.lng) {
        const marker = L.circleMarker([customer.lat, customer.lng], {
          radius: 4,
          color: '#e91e63',
          fillColor: '#e91e63',
          fillOpacity: 0.7,
          weight: 2,
          isCustomerMarker: true
        }).bindPopup(`
          <div class="text-sm">
            <p><strong>위치:</strong> ${customer.sido} ${customer.sigungu}</p>
            <p><strong>성별:</strong> ${customer.gender === 'M' ? '남성' : customer.gender === 'F' ? '여성' : '미지정'}</p>
            <p><strong>출생년도:</strong> ${customer.birthYear || '미지정'}</p>
          </div>
        `);
        
        markersGroup.addLayer(marker);
      }
    });
    
    markersGroup.addTo(map);
    markersLayerRef.current = markersGroup;
    console.log('Customer markers group created with', filteredCustomers.length, 'filtered customers');
  };

  const showRadius = (L, map, lat, lng, meters) => {
    // 기존 원 제거
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }

    // 새 원 생성
    const circle = L.circle([lat, lng], {
      color: '#e91e63',
      fillColor: '#e91e63',
      fillOpacity: 0.2,
      radius: meters
    }).addTo(map);

    circleRef.current = circle;

    // 지도 중심을 원의 중심으로 이동
    map.setView([lat, lng], map.getZoom());
  };

  const updateRadius = (newRadius) => {
    if (filters.radius?.enabled && filters.radius.value && mapInstanceRef.current) {
      const { lat, lng } = filters.radius.value;
      if (lat && lng) {
        const L = require('leaflet');
        showRadius(L, mapInstanceRef.current, lat, lng, newRadius);
        
        const newFilters = {
          ...filters,
          radius: { 
            enabled: true,
            value: { lat, lng, meters: newRadius }
          }
        };
        onFiltersChange(newFilters);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          반경 선택 {filters.radius?.enabled ? '(타겟 범위를 설정하세요)' : '(반경 필터를 먼저 활성화하세요)'}
        </label>
        <div className="flex items-center space-x-4 mb-4">
          <select
            value={filters.radius?.value?.meters || 1000}
            onChange={(e) => updateRadius(parseInt(e.target.value))}
            className={`input-field ${!filters.radius?.enabled ? 'bg-gray-100 text-gray-400' : ''}`}
            disabled={!filters.radius?.enabled}
          >
            <option value={500}>500m</option>
            <option value={1000}>1km</option>
            <option value={2000}>2km</option>
            <option value={5000}>5km</option>
            <option value={10000}>10km</option>
          </select>
          {filters.radius?.enabled && filters.radius.value && (
            <span className="text-sm text-gray-600">
              중심: {filters.radius.value.lat?.toFixed(4)}, {filters.radius.value.lng?.toFixed(4)}
            </span>
          )}
        </div>
      </div>
      
      <div 
        ref={mapRef} 
        id={mapId.current}
        className="w-full h-96 rounded-lg border border-gray-300"
        style={{ minHeight: '400px' }}
      />
      
      <div className="space-y-2">
        
        {customers.length > 0 && (
          <div className="bg-blue-50 p-3 rounded border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900">필터링된 고객:</span>
              <span className="text-lg font-bold text-blue-600">
                {getFilteredCustomers().length.toLocaleString()}명
              </span>
            </div>
            <div className="text-xs text-blue-700 mt-1">
              전체 고객: {customers.length.toLocaleString()}명 | 
              🗺️ 지도에는 필터링된 고객만 표시됩니다
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
