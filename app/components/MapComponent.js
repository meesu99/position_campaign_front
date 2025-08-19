'use client';

import { useEffect, useRef, useState } from 'react';

const MapComponent = ({ filters, onFiltersChange }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !mapInstanceRef.current) {
      // 기존 지도 인스턴스가 있으면 제거
      if (mapRef.current._leaflet_id) {
        mapRef.current._leaflet_id = null;
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
          if (filters.radius && filters.radius.lat && filters.radius.lng && filters.radius.meters > 0) {
            showRadius(L, map, filters.radius.lat, filters.radius.lng, filters.radius.meters);
          }

          // 클릭 이벤트 추가
          map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            const meters = filters.radius?.meters || 1000;
            
            showRadius(L, map, lat, lng, meters);
            
            const newFilters = {
              ...filters,
              radius: { lat, lng, meters }
            };
            onFiltersChange(newFilters);
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
    if (filters.radius && filters.radius.lat && filters.radius.lng && mapInstanceRef.current) {
      const L = require('leaflet');
      showRadius(L, mapInstanceRef.current, filters.radius.lat, filters.radius.lng, newRadius);
      
      const newFilters = {
        ...filters,
        radius: { ...filters.radius, meters: newRadius }
      };
      onFiltersChange(newFilters);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          반경 선택 (지도를 클릭하여 중심점 설정)
        </label>
        <div className="flex items-center space-x-4 mb-4">
          <select
            value={filters.radius?.meters || 1000}
            onChange={(e) => updateRadius(parseInt(e.target.value))}
            className="input-field"
          >
            <option value={500}>500m</option>
            <option value={1000}>1km</option>
            <option value={2000}>2km</option>
            <option value={5000}>5km</option>
            <option value={10000}>10km</option>
          </select>
          {filters.radius && (
            <span className="text-sm text-gray-600">
              중심: {filters.radius.lat?.toFixed(4)}, {filters.radius.lng?.toFixed(4)}
            </span>
          )}
        </div>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-gray-300"
        style={{ minHeight: '400px' }}
      />
      
      <p className="text-sm text-gray-500">
        지도를 클릭하여 반경 필터의 중심점을 설정하세요. 선택된 반경 내의 고객들이 캠페인 대상이 됩니다.
      </p>
    </div>
  );
};

export default MapComponent;
