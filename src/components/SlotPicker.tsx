'use client';

import React, { useState, useEffect } from 'react';
import { TimeSlot, DayAvailability } from '@/types';
import { ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SlotPickerProps {
  totalDuration: number;
  selectedDate: string;
  selectedTime: string;
  onSelectSlot: (date: string, time: string, endTime: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  totalDuration,
  selectedDate,
  selectedTime,
  onSelectSlot,
  onBack,
  onNext,
}) => {
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const [monthAvailability, setMonthAvailability] = useState<DayAvailability[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [isLoadingMonth, setIsLoadingMonth] = useState<boolean>(false);

  // 月間空き状況の取得
  useEffect(() => {
    async function fetchMonthData() {
      setIsLoadingMonth(true);
      try {
        const res = await fetch(
          `/api/availability/calendar?month=${currentYearMonth}&duration=${totalDuration}`
        );
        const data = await res.json();
        if (data.success) {
          setMonthAvailability(data.days);
        }
      } catch (err) {
        console.error('Failed to load month availability:', err);
      } finally {
        setIsLoadingMonth(false);
      }
    }
    fetchMonthData();
  }, [currentYearMonth, totalDuration]);

  // 指定日のスロット空き状況の取得
  useEffect(() => {
    if (!selectedDate) return;
    async function fetchDaySlots() {
      setIsLoadingSlots(true);
      try {
        const res = await fetch(
          `/api/availability?date=${selectedDate}&duration=${totalDuration}`
        );
        const data = await res.json();
        if (data.success) {
          setSlots(data.slots);
        }
      } catch (err) {
        console.error('Failed to load slots:', err);
      } finally {
        setIsLoadingSlots(false);
      }
    }
    fetchDaySlots();
  }, [selectedDate, totalDuration]);

  // カレンダーの月移動
  const handlePrevMonth = () => {
    const [y, m] = currentYearMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    setCurrentYearMonth(
      `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
    );
  };

  const handleNextMonth = () => {
    const [y, m] = currentYearMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    setCurrentYearMonth(
      `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`
    );
  };

  // カレンダー構築用のグリッドデータ
  const [yearStr, monthStr] = currentYearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0: 日曜
  const daysInMonth = new Date(year, month, 0).getDate();

  const todayStr = new Date().toISOString().split('T')[0];

  const selectedSlotObj = slots.find((s) => s.time === selectedTime);

  return (
    <div className="pb-28">
      {/* ステップ案内 */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
          <span className="w-6 h-6 rounded-full bg-[#06C755] text-white flex items-center justify-center text-xs font-bold">
            2
          </span>
          ご希望の日時・空き枠を選択してください
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          所要時間 {totalDuration} 分が確保できる時間枠が表示されます
        </p>
      </div>

      {/* カレンダーヘッダー */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs mb-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            aria-label="前月"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-sm font-bold text-slate-800">
            {year}年 {month}月
          </div>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            aria-label="翌月"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 mb-1">
          <span className="text-rose-500">日</span>
          <span>月</span>
          <span>火</span>
          <span>水</span>
          <span>木</span>
          <span>金</span>
          <span className="text-blue-500">土</span>
        </div>

        {/* カレンダー日付グリッド */}
        <div className="grid grid-cols-7 gap-1">
          {/* 前月の余白 */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`blank-${idx}`} className="h-10" />
          ))}

          {/* 当月の日付 */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${yearStr}-${String(monthStr).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isPast = dateStr < todayStr;
            const isSelected = dateStr === selectedDate;
            const dayData = monthAvailability.find((d) => d.date === dateStr);

            const isClosed = dayData?.isClosed;
            const isFull = dayData?.status === 'full';
            const isFew = dayData?.status === 'few';
            const isAvailable = dayData?.status === 'available';

            const canSelect = !isPast && !isClosed && !isFull;

            return (
              <button
                key={dateStr}
                onClick={() => canSelect && onSelectSlot(dateStr, '', '')}
                disabled={!canSelect}
                className={`h-11 rounded-lg flex flex-col items-center justify-center p-0.5 transition relative text-xs ${
                  isSelected
                    ? 'bg-[#06C755] text-white font-bold shadow-xs'
                    : canSelect
                    ? 'hover:bg-emerald-50 text-slate-800 cursor-pointer border border-transparent hover:border-[#06C755]'
                    : 'text-slate-300 bg-slate-50/50 cursor-not-allowed'
                }`}
              >
                <span>{dayNum}</span>
                <span className="text-[10px] leading-none mt-0.5">
                  {isPast ? (
                    '-'
                  ) : isClosed ? (
                    <span className="text-slate-400">休</span>
                  ) : isFull ? (
                    <span className="text-slate-400">✕</span>
                  ) : isFew ? (
                    <span className={isSelected ? 'text-white' : 'text-amber-500 font-bold'}>△</span>
                  ) : isAvailable ? (
                    <span className={isSelected ? 'text-white' : 'text-emerald-600 font-bold'}>○</span>
                  ) : (
                    '○'
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* 凡例 */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <span className="text-emerald-600 font-bold">○</span> 空きあり
          </span>
          <span className="flex items-center gap-1">
            <span className="text-amber-500 font-bold">△</span> 残りわずか
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-400 font-bold">✕</span> 満枠
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-400 font-medium">休</span> 定休日
          </span>
        </div>
      </div>

      {/* 時間帯スロット選択 */}
      {selectedDate ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#06C755]" />
              {selectedDate} の空き時間枠
            </h3>
            {isLoadingSlots && (
              <span className="text-xs text-slate-400 animate-pulse">
                空き状況を確認中...
              </span>
            )}
          </div>

          {slots.length === 0 && !isLoadingSlots ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
              この日は定休日または受付可能な時間枠がありません。別の日程を選択してください。
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                return (
                  <button
                    key={slot.time}
                    disabled={!slot.isAvailable}
                    onClick={() => onSelectSlot(selectedDate, slot.time, slot.endTime)}
                    className={`py-2 px-1 rounded-lg border text-center transition flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-[#06C755] bg-[#06C755] text-white shadow-xs font-bold'
                        : slot.isAvailable
                        ? 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-100/50 text-slate-800 cursor-pointer'
                        : 'border-slate-200 bg-slate-100/70 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-xs font-semibold">{slot.time}</span>
                    <span className="text-[10px] mt-0.5">
                      {slot.isAvailable ? (
                        <span className={isSelected ? 'text-white' : 'text-emerald-700'}>
                          ○ 空き
                        </span>
                      ) : slot.reason === 'past' ? (
                        '受付終了'
                      ) : slot.reason === 'too_short' ? (
                        '枠外'
                      ) : (
                        '✕ 満枠'
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 選択中の時間案内 */}
          {selectedTime && selectedSlotObj && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong>{selectedDate} {selectedTime} 〜 {selectedSlotObj.endTime}</strong>（所要約{totalDuration}分）で枠を確保します。
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
          上のカレンダーからご希望の日付をタップしてください。
        </div>
      )}

      {/* フッター操作バー */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
          >
            戻る
          </button>

          <button
            onClick={onNext}
            disabled={!selectedDate || !selectedTime}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
              selectedDate && selectedTime
                ? 'bg-[#06C755] hover:bg-[#05B04B] text-white shadow-md shadow-emerald-500/20 active:scale-[0.98]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>お客様情報の入力へ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
