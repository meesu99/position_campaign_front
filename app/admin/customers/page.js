'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birthYear: '',
    phone: '',
    roadAddress: '',
    detailAddress: '',
    postalCode: '',
    sido: '',
    sigungu: '',
    lat: '',
    lng: ''
  });
  const [filters, setFilters] = useState({
    gender: '',
    sido: '',
    sigungu: '',
    ageFrom: '',
    ageTo: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, [filters, pagination.currentPage]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        size: '20'
      });
      
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.sido) params.append('sido', filters.sido);
      if (filters.sigungu) params.append('sigungu', filters.sigungu);
      if (filters.ageFrom) params.append('ageFrom', filters.ageFrom);
      if (filters.ageTo) params.append('ageTo', filters.ageTo);

      const response = await fetch(`/api/admin/customers?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalElements: data.totalElements
        });
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
    setPagination({ ...pagination, currentPage: 0 });
  };

  const handleCreateCustomer = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      gender: '',
      birthYear: '',
      phone: '',
      roadAddress: '',
      detailAddress: '',
      postalCode: '',
      sido: '',
      sigungu: '',
      lat: '',
      lng: ''
    });
    setShowModal(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      gender: customer.gender || '',
      birthYear: customer.birthYear || '',
      phone: customer.phone || '',
      roadAddress: customer.roadAddress || '',
      detailAddress: customer.detailAddress || '',
      postalCode: customer.postalCode || '',
      sido: customer.sido || '',
      sigungu: customer.sigungu || '',
      lat: customer.lat || '',
      lng: customer.lng || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingCustomer 
        ? `/api/admin/customers/${editingCustomer.id}`
        : '/api/admin/customers';
      
      const method = editingCustomer ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
          lat: formData.lat ? parseFloat(formData.lat) : null,
          lng: formData.lng ? parseFloat(formData.lng) : null
        }),
      });

      if (response.ok) {
        alert(editingCustomer ? '고객 정보가 수정되었습니다.' : '고객이 생성되었습니다.');
        setShowModal(false);
        fetchCustomers();
      } else {
        const error = await response.json();
        alert(error.error || '처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('처리에 실패했습니다.');
    }
  };

  const handleDelete = async (customerId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        alert('고객이 삭제되었습니다.');
        fetchCustomers();
      } else {
        const error = await response.json();
        alert(error.error || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const maskPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');
  };

  const maskName = (name) => {
    if (!name) return '';
    if (name.length === 1) return name;
    return name.charAt(0) + '*'.repeat(name.length - 1);
  };

  const maskAddress = (sido, sigungu) => {
    if (!sido && !sigungu) return '';
    let address = '';
    if (sido) address += sido;
    if (sigungu) {
      if (address) address += ' ';
      address += sigungu;
    }
    return address;
  };

  return (
    <ProtectedRoute requireRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">고객 관리</h1>
            <button
              onClick={handleCreateCustomer}
              className="btn-primary"
            >
              고객 추가
            </button>
          </div>

          {/* 필터 */}
          <div className="card mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">필터</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="input-field"
              >
                <option value="">전체 성별</option>
                <option value="M">남성</option>
                <option value="F">여성</option>
              </select>
              
              <input
                type="number"
                placeholder="최소 나이"
                value={filters.ageFrom}
                onChange={(e) => handleFilterChange('ageFrom', e.target.value)}
                className="input-field"
              />
              
              <input
                type="number"
                placeholder="최대 나이"
                value={filters.ageTo}
                onChange={(e) => handleFilterChange('ageTo', e.target.value)}
                className="input-field"
              />
              
              <select
                value={filters.sido}
                onChange={(e) => handleFilterChange('sido', e.target.value)}
                className="input-field"
              >
                <option value="">전체 시도</option>
                <option value="서울특별시">서울특별시</option>
                <option value="경기도">경기도</option>
                <option value="인천광역시">인천광역시</option>
              </select>
              
              <input
                type="text"
                placeholder="시군구"
                value={filters.sigungu}
                onChange={(e) => handleFilterChange('sigungu', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* 고객 목록 */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      성별
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      출생년도
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      전화번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      주소
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      지역
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kt-red mx-auto"></div>
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        고객이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {maskName(customer.name)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.gender === 'M' ? '남성' : customer.gender === 'F' ? '여성' : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.birthYear || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {maskPhone(customer.phone)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {maskAddress(customer.sido, customer.sigungu)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.sido} {customer.sigungu}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="text-kt-red hover:text-red-900 mr-3"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                  disabled={pagination.currentPage === 0}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  이전
                </button>
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                  disabled={pagination.currentPage >= pagination.totalPages - 1}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  다음
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    총 <span className="font-medium">{pagination.totalElements}</span>개 중{' '}
                    <span className="font-medium">{pagination.currentPage * 20 + 1}</span>-
                    <span className="font-medium">
                      {Math.min((pagination.currentPage + 1) * 20, pagination.totalElements)}
                    </span>
                    개 표시
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                      disabled={pagination.currentPage === 0}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      이전
                    </button>
                    <button
                      onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                      disabled={pagination.currentPage >= pagination.totalPages - 1}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      다음
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 모달 */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingCustomer ? '고객 수정' : '고객 추가'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="이름"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
                
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">성별 선택</option>
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
                
                <input
                  type="number"
                  placeholder="출생년도"
                  value={formData.birthYear}
                  onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                  className="input-field"
                />
                
                <input
                  type="text"
                  placeholder="전화번호"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
                
                <input
                  type="text"
                  placeholder="도로명주소"
                  value={formData.roadAddress}
                  onChange={(e) => setFormData({ ...formData, roadAddress: e.target.value })}
                  className="input-field"
                />
                
                <input
                  type="text"
                  placeholder="상세주소"
                  value={formData.detailAddress}
                  onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
                  className="input-field"
                />
                
                <input
                  type="text"
                  placeholder="우편번호"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="input-field"
                />
                
                <input
                  type="text"
                  placeholder="시도"
                  value={formData.sido}
                  onChange={(e) => setFormData({ ...formData, sido: e.target.value })}
                  className="input-field"
                />
                
                <input
                  type="text"
                  placeholder="시군구"
                  value={formData.sigungu}
                  onChange={(e) => setFormData({ ...formData, sigungu: e.target.value })}
                  className="input-field"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="위도"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    className="input-field"
                    step="any"
                  />
                  <input
                    type="number"
                    placeholder="경도"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    className="input-field"
                    step="any"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button type="submit" className="btn-primary flex-1">
                    {editingCustomer ? '수정' : '생성'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
