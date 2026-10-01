'use client';

import React, { useState, useEffect } from 'react';
import { Reservation, MenuItem, StoreSettings, TimeSlot } from '@/types';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

export default function AdminReservationsPage() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 手動予約モーダル
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalStartTime, setModalStartTime] = useState<string>('10:00');
  const [modalCustomerName, setModalCustomerName] = useState<string>('');
  const [modalCustomerPhone, setModalCustomerPhone] = useState<string>('');
  const [modalMenuId, setModalMenuId] = useState<string>('');
  const [modalNote, setModalNote] = useState<string>('店舗電話受付');
  const [isSubmittingManual, setIsSubmittingManual] = useState<boolean>(false);
  const [manualError, setManualError] = useState<string>('');

  // データ取得
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resRes, slotsRes, menusRes, settingsRes] = await Promise.all([
        fetch(`/api/reservations?date=${selectedDate}`),
        fetch(`/api/availability?date=${selectedDate}&duration=30`),
        fetch('/api/menus?all=true'),
        fetch('/api/settings'),
      ]);

      const resData = await resRes.json();
      const slotsData = await slotsRes.json();
      const menusData = await menusRes.json();
      const settingsData = await settingsRes.json();

      if (resData.success) setReservations(resData.reservations);
      if (slotsData.success) setSlots(slotsData.slots);
      if (menusData.success) {
        setMenus(menusData.menus);
        if (menusData.menus.length > 0 && !modalMenuId) {
          setModalMenuId(menusData.menus[0].id);
        }
      }
      if (settingsData.success) setSettings(settingsData.settings);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // ステータス更新
  const handleUpdateStatus = async (id: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      } else {
        alert(data.error || 'ステータスの更新に失敗しました。');
      }
    } catch (err) {
      console.error('Update status error:', err);
      alert('通信エラーが発生しました。');
    }
  };

  // 手動予約作成
  const handleCreateManualReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');

    const targetMenu = menus.find((m) => m.id === modalMenuId);
    if (!targetMenu) {
      setManualError('メニューを選択してください。');
      return;
    }

    const [h, m] = modalStartTime.split(':').map(Number);
    const endMinutes = h * 60 + m + targetMenu.durationMinutes;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    setIsSubmittingManual(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: modalCustomerName.trim(),
          customerPhone: modalCustomerPhone.trim(),
          menuIds: [targetMenu.id],
          menuNames: [targetMenu.name],
          totalPrice: targetMenu.price,
          totalDuration: targetMenu.durationMinutes,
          date: selectedDate,
          startTime: modalStartTime,
          endTime: endTimeStr,
          note: modalNote.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setModalCustomerName('');
        setModalCustomerPhone('');
        await fetchData();
      } else {
        setManualError(data.error || '予約枠の確保に失敗しました。');
      }
    } catch (err) {
      console.error('Manual reservation error:', err);
      setManualError('通信エラーが発生しました。');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // 日付操作
  const changeDateBy = (days: number) => {
    const cur = new Date(`${selectedDate}T00:00:00`);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // 予約統計
  const confirmedReservations = reservations.filter((r) => r.status === 'confirmed');
  const totalRevenue = confirmedReservations.reduce((sum, r) => sum + r.totalPrice, 0);
  const availableSlotCount = slots.filter((s) => s.isAvailable).length;

  return (
    <div className="space-y-6">
      {/* ページタイトル & 日付セレクター */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-[#06C755]" />
            予約・空き状況管理ボード
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            日別の予約一覧と各時間帯の空き枠状況をリアルタイムで確認・管理できます。
          </p>
        </div>

        {/* 日付ナビゲーション */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDateBy(-1)}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="前日"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          />

          <button
            onClick={() => changeDateBy(1)}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="翌日"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {selectedDate !== todayStr && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-medium transition"
            >
              今日
            </button>
          )}

          <button
            onClick={fetchData}
            className="p-2 text-slate-500 hover:text-slate-800 transition"
            title="最新情報に更新"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setManualError('');
              setIsModalOpen(true);
            }}
            className="bg-[#06C755] hover:bg-[#05B04B] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>電話予約を追加</span>
          </button>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">本日の確定予約</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {confirmedReservations.length}{' '}
            <span className="text-xs font-normal text-slate-500">件</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">予約売上見込み</div>
          <div className="text-2xl font-black text-[#06C755] mt-1">
            ¥{totalRevenue.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-500">(税込)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">空き時間枠</div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {availableSlotCount}{' '}
            <span className="text-xs font-normal text-slate-500">スロット受付可能</span>
          </div>
        </div>
      </div>

      {/* 空き状況タイムラインモニター（店舗側が空き枠を一目で把握できる） */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#06C755]" />
              {selectedDate} 時間帯別・空き状況タイムライン
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              各時間帯の予約状況と空き枠数です。「＋枠確保」をクリックすると直接予約を入れられます。
            </p>
          </div>
        </div>

        {slots.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
            定休日または営業外のため枠はありません。
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {slots.map((slot) => {
              // このスロットの時間帯に該当する確定予約を探す
              const matchedRes = reservations.find(
                (r) =>
                  r.status === 'confirmed' &&
                  r.startTime <= slot.time &&
                  r.endTime > slot.time
              );

              return (
                <div
                  key={slot.time}
                  className={`p-3 rounded-xl border text-xs transition relative ${
                    matchedRes
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : slot.isAvailable
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>{slot.time}</span>
                    {matchedRes ? (
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                        予約有
                      </span>
                    ) : slot.isAvailable ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                        空き {slot.remainingCount}枠
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                        満枠/終了
                      </span>
                    )}
                  </div>

                  {matchedRes ? (
                    <div className="space-y-0.5 mt-1.5">
                      <p className="font-bold truncate text-[11px]">
                        {matchedRes.customerName} 様
                      </p>
                      <p className="text-[10px] text-amber-700 truncate">
                        {matchedRes.menuNames.join(', ')}
                      </p>
                    </div>
                  ) : slot.isAvailable ? (
                    <button
                      onClick={() => {
                        setModalStartTime(slot.time);
                        setManualError('');
                        setIsModalOpen(true);
                      }}
                      className="mt-2 w-full py-1 text-[11px] font-semibold text-emerald-700 bg-white hover:bg-emerald-100/80 rounded border border-emerald-300 transition"
                    >
                      + 枠確保
                    </button>
                  ) : (
                    <div className="text-[10px] text-slate-400 mt-2">受付不可</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 予約一覧テーブル */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            {selectedDate} のご予約詳細一覧 ({reservations.length}件)
          </h2>
        </div>

        {reservations.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            この日の予約データはまだありません。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">予約番号</th>
                  <th className="py-3 px-4">時間</th>
                  <th className="py-3 px-4">お客様名</th>
                  <th className="py-3 px-4">連絡先</th>
                  <th className="py-3 px-4">予約メニュー</th>
                  <th className="py-3 px-4">金額</th>
                  <th className="py-3 px-4">ステータス</th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((res) => {
                  const isConfirmed = res.status === 'confirmed';
                  const isCancelled = res.status === 'cancelled';
                  const isCompleted = res.status === 'completed';

                  return (
                    <tr key={res.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {res.reservationNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {res.startTime} - {res.endTime}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          ({res.totalDuration}分)
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{res.customerName}</div>
                        {res.customerLineName && (
                          <div className="text-[10px] text-emerald-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#06C755]" />
                            LINE: {res.customerLineName}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {res.customerPhone}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-[200px]">
                        <div className="font-medium truncate">{res.menuNames.join(', ')}</div>
                        {res.note && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            メモ: {res.note}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                        ¥{res.totalPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isConfirmed
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCancelled
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isConfirmed ? '予約確定' : isCancelled ? 'キャンセル' : '来店済み'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        {isConfirmed && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(res.id, 'completed')}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-medium transition"
                            >
                              来店済みにする
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`${res.customerName} 様の予約をキャンセルしますか？`)) {
                                  handleUpdateStatus(res.id, 'cancelled');
                                }
                              }}
                              className="px-2 py-1 border border-rose-300 text-rose-600 hover:bg-rose-50 rounded text-[11px] font-medium transition"
                            >
                              キャンセル
                            </button>
                          </>
                        )}
                        {isCancelled && (
                          <button
                            onClick={() => handleUpdateStatus(res.id, 'confirmed')}
                            className="px-2 py-1 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded text-[11px] font-medium transition"
                          >
                            確定に戻す
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 電話予約・手動追加モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#06C755]" />
                電話・店頭予約の登録
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {manualError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {manualError}
              </div>
            )}

            <form onSubmit={handleCreateManualReservation} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">予約日</label>
                <input
                  type="date"
                  value={selectedDate}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">開始時間</label>
                <input
                  type="time"
                  required
                  value={modalStartTime}
                  onChange={(e) => setModalStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#06C755]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">メニュー選択</label>
                <select
                  value={modalMenuId}
                  onChange={(e) => setModalMenuId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#06C755]"
                >
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.durationMinutes}分 - ¥{m.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">お客様お名前</label>
                <input
                  type="text"
                  required
                  placeholder="例: 佐々木 健一"
                  value={modalCustomerName}
                  onChange={(e) => setModalCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#06C755]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">お電話番号</label>
                <input
                  type="tel"
                  required
                  placeholder="例: 090-0000-0000"
                  value={modalCustomerPhone}
                  onChange={(e) => setModalCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#06C755]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">備考メモ</label>
                <input
                  type="text"
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#06C755]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="flex-1 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05B04B] text-white font-bold transition shadow-xs"
                >
                  {isSubmittingManual ? '登録中...' : '予約枠を確保する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
