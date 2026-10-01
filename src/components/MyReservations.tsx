'use client';

import React, { useState, useEffect } from 'react';
import { Reservation } from '@/types';
import { LiffUserProfile } from '@/lib/liff';
import { Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';

interface MyReservationsProps {
  profile: LiffUserProfile | null;
}

export const MyReservations: React.FC<MyReservationsProps> = ({ profile }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchPhone, setSearchPhone] = useState<string>('');
  const [selectedResToCancel, setSelectedResToCancel] = useState<Reservation | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      let url = '/api/reservations';
      if (profile?.userId) {
        url += `?lineId=${encodeURIComponent(profile.userId)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        let list: Reservation[] = data.reservations;
        if (searchPhone.trim()) {
          list = list.filter((r) => r.customerPhone.includes(searchPhone.trim()));
        }
        setReservations(list);
      }
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [profile?.userId]);

  const handleCancelReservation = async () => {
    if (!selectedResToCancel) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/reservations/${selectedResToCancel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedResToCancel(null);
        await fetchReservations();
      } else {
        alert(data.error || 'キャンセルの処理に失敗しました。');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">ご予約の確認・キャンセル</h2>
          <p className="text-xs text-slate-500">
            現在のご予約状況や履歴をご確認いただけます。
          </p>
        </div>
        <button
          onClick={fetchReservations}
          className="p-2 text-slate-500 hover:text-slate-800 transition"
          title="更新"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 電話番号検索（LINE ID未連携または別番号検索用） */}
      {!profile?.userId && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex gap-2">
          <input
            type="text"
            placeholder="お電話番号で予約を検索"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#06C755]"
          />
          <button
            onClick={fetchReservations}
            className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-700 transition flex items-center gap-1"
          >
            <Search className="w-3.5 h-3.5" />
            検索
          </button>
        </div>
      )}

      {/* 予約リスト */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400">
          予約情報を読み込み中...
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-2">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">ご予約は見つかりませんでした</p>
          <p className="text-xs text-slate-400">
            新規予約タブから空き状況を確認してご予約いただけます。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((res) => {
            const isConfirmed = res.status === 'confirmed';
            const isCancelled = res.status === 'cancelled';
            const isCompleted = res.status === 'completed';

            return (
              <div
                key={res.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-[11px] font-mono text-slate-500 font-bold">
                    {res.reservationNumber}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isConfirmed
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCancelled
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isConfirmed && <CheckCircle className="w-3 h-3" />}
                    {isCancelled && <XCircle className="w-3 h-3" />}
                    {isConfirmed ? '予約確定' : isCancelled ? 'キャンセル済み' : 'ご来店済み'}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                    <Calendar className="w-4 h-4 text-[#06C755]" />
                    <span>{res.date}</span>
                    <Clock className="w-4 h-4 text-[#06C755] ml-2" />
                    <span>{res.startTime} - {res.endTime}</span>
                  </div>

                  <div className="text-slate-600 pt-1">
                    <span className="font-medium">{res.menuNames.join(' / ')}</span>
                  </div>

                  <div className="flex justify-between pt-2 items-center text-slate-500">
                    <span>所要時間: 約{res.totalDuration}分</span>
                    <span className="text-sm font-extrabold text-[#06C755]">
                      ¥{res.totalPrice.toLocaleString()} (税込)
                    </span>
                  </div>
                </div>

                {/* キャンセルボタン */}
                {isConfirmed && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setSelectedResToCancel(res)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium py-1 px-2 rounded hover:bg-rose-50 transition"
                    >
                      この予約をキャンセルする
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* キャンセル確認モーダル */}
      {selectedResToCancel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                ご予約をキャンセルしますか？
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {selectedResToCancel.date} {selectedResToCancel.startTime}〜 のご予約を取り消します。
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedResToCancel(null)}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                戻る
              </button>
              <button
                onClick={handleCancelReservation}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition"
              >
                {isCancelling ? '処理中...' : 'キャンセルする'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
