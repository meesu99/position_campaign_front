'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

export default function Wallet() {
  const { updateUserPoints } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [chargeAmount, setChargeAmount] = useState(10000);
  const [loading, setLoading] = useState(true);
  const [chargeLoading, setChargeLoading] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      // 잔액 조회
      const balanceRes = await fetch('/api/wallet/balance', {
        credentials: 'include'
      });
      
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData.balance);
      }

      // 거래 내역 조회
      const transactionsRes = await fetch('/api/wallet/ledger?page=0&size=20', {
        credentials: 'include'
      });
      
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCharge = async () => {
    if (chargeAmount < 1000) {
      alert('최소 충전 금액은 1,000원입니다.');
      return;
    }

    setChargeLoading(true);
    try {
      const response = await fetch('/api/wallet/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: chargeAmount,
          meta: {
            method: 'credit_card',
            card_last4: '1234'
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert('충전이 완료되었습니다!');
        // 잔액 즉시 업데이트
        setBalance(result.transaction.balanceAfter);
        // 전체 데이터 다시 가져오기
        await fetchWalletData();
        // Navbar의 포인트 표시 업데이트
        await updateUserPoints();
        setChargeAmount(10000);
      } else {
        const error = await response.json();
        alert(error.error || '충전에 실패했습니다.');
      }
    } catch (error) {
      console.error('Charge error:', error);
      alert('충전에 실패했습니다.');
    } finally {
      setChargeLoading(false);
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'CHARGE': return '충전';
      case 'DEBIT_CAMPAIGN': return '캠페인 차감';
      case 'REFUND': return '환불';
      default: return type;
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'CHARGE': return 'text-green-600';
      case 'DEBIT_CAMPAIGN': return 'text-red-600';
      case 'REFUND': return 'text-blue-600';
      default: return 'text-gray-600';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">지갑</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 잔액 및 충전 */}
            <div className="space-y-6">
              {/* 현재 잔액 */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">현재 잔액</h3>
                <div className="text-center">
                  <p className="text-4xl font-bold text-kt-red">
                    {balance.toLocaleString()}
                  </p>
                  <p className="text-gray-500 mt-2">포인트</p>
                </div>
              </div>

              {/* 포인트 충전 */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">포인트 충전</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      충전 금액
                    </label>
                    <input
                      type="number"
                      value={chargeAmount}
                      onChange={(e) => setChargeAmount(parseInt(e.target.value) || 0)}
                      className="input-field"
                      placeholder="충전할 금액을 입력하세요"
                      min="1000"
                      step="1000"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      최소 충전 금액: 1,000원
                    </p>
                  </div>
                  
                  {/* 빠른 충전 버튼들 */}
                  <div className="grid grid-cols-3 gap-2">
                    {[10000, 50000, 100000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setChargeAmount(amount)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        {amount.toLocaleString()}원
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleCharge}
                    disabled={chargeLoading || chargeAmount < 1000}
                    className="btn-primary w-full"
                  >
                    {chargeLoading ? '충전 중...' : `${chargeAmount.toLocaleString()}원 충전`}
                  </button>
                  
                  <p className="text-xs text-gray-500">
                    ※ 실제 결제는 되지 않으며, 데모용 충전입니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 거래 내역 */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">거래 내역</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">거래 내역이 없습니다.</p>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center py-3 border-b border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">
                          {getTransactionTypeLabel(transaction.type)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleString('ko-KR')}
                        </p>
                        {transaction.meta && transaction.meta.campaign_id && (
                          <p className="text-xs text-gray-400">
                            캠페인 ID: {transaction.meta.campaign_id}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getTransactionTypeColor(transaction.type)}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          잔액: {transaction.balanceAfter.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
