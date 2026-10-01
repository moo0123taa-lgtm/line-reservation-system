'use client';

import React, { useState } from 'react';
import { MenuItem, Reservation } from '@/types';
import { LiffUserProfile, sendLiffMessage, closeLiffWindow } from '@/lib/liff';
import { CheckCircle2, MessageCircle, Calendar, Clock, Sparkles, AlertCircle, X } from 'lucide-react';

interface CustomerFormProps {
  selectedMenus: MenuItem[];
  selectedDate: string;
  selectedTime: string;
  endTime: string;
  totalDuration: number;
  totalPrice: number;
  profile: LiffUserProfile | null;
  onBack: () => void;
  onSuccess: (reservation: Reservation) => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  selectedMenus,
  selectedDate,
  selectedTime,
  endTime,
  totalDuration,
  totalPrice,
  profile,
  onBack,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState<string>(profile?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [completedReservation, setCompletedReservation] = useState<Reservation | null>(null);
  const [isLineSent, setIsLineSent] = useState<boolean>(false);

  // 予約送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('お名前を入力してください。');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('お電話番号を入力してください。');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          customerLineId: profile?.userId || '',
          customerLineName: profile?.displayName || '',
          customerLinePicture: profile?.pictureUrl || '',
          menuIds: selectedMenus.map((m) => m.id),
          menuNames: selectedMenus.map((m) => m.name),
          totalPrice,
          totalDuration,
          date: selectedDate,
          startTime: selectedTime,
          endTime,
          note: note.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || '予約に失敗しました。時間帯が重複した可能性があります。');
        setIsSubmitting(false);
        return;
      }

      setCompletedReservation(data.reservation);
      onSuccess(data.reservation);
    } catch (err) {
      console.error('Reservation error:', err);
      setErrorMessage('通信エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // LINEトークへ送信
  const handleSendToLine = async () => {
    if (!completedReservation) return;
    const msg = `【予約完了】\n予約番号: ${completedReservation.reservationNumber}\n日時: ${completedReservation.date} ${completedReservation.startTime}〜\nメニュー: ${completedReservation.menuNames.join(', ')}\nお支払い目安: ¥${completedReservation.totalPrice.toLocaleString()} (税込)`;
    const ok = await sendLiffMessage(msg);
    if (ok) {
      setIsLineSent(true);
    } else {
      alert('LINEトークルームへの送信はLINEアプリ内でのみ有効です。');
    }
  };

  // 完了画面
  if (completedReservation) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center">
        <div className="w-16 h-16 bg-emerald-100 text-[#06C755] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-1">
          ご予約が完了いたしました！
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          ご来店をスタッフ一同、心よりお待ちしております。
        </p>

        {/* 予約内容カード */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2 mb-6">
          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">予約番号</span>
            <span className="font-mono font-bold text-slate-800">
              {completedReservation.reservationNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">日時</span>
            <span className="font-bold text-slate-800">
              {completedReservation.date} {completedReservation.startTime} - {completedReservation.endTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">メニュー</span>
            <span className="font-medium text-slate-800 text-right">
              {completedReservation.menuNames.join(' / ')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">所要時間</span>
            <span className="font-medium text-slate-800">
              約 {completedReservation.totalDuration} 分
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200">
            <span className="text-slate-500">合計目安</span>
            <span className="font-extrabold text-[#06C755] text-sm">
              ¥{completedReservation.totalPrice.toLocaleString()} (税込)
            </span>
          </div>
        </div>

        {/* LINE送信ボタン（LIFF内向け） */}
        <div className="space-y-3">
          <button
            onClick={handleSendToLine}
            disabled={isLineSent}
            className="w-full py-3 px-4 rounded-xl bg-[#06C755] hover:bg-[#05B04B] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{isLineSent ? 'LINEトークへ送信済み ✓' : 'LINEトークに予約内容を送信する'}</span>
          </button>

          <button
            onClick={() => closeLiffWindow()}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs transition"
          >
            画面を閉じる（LINEに戻る）
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      {/* ステップ案内 */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
          <span className="w-6 h-6 rounded-full bg-[#06C755] text-white flex items-center justify-center text-xs font-bold">
            3
          </span>
          お客様情報の入力とご予約の確認
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          ご予約内容をご確認の上、お客様情報をご入力ください。
        </p>
      </div>

      {/* 予約内容サマリー */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>選択中のご予約内容</span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-slate-900">
              {selectedDate}
            </span>
            <Clock className="w-3.5 h-3.5 text-emerald-600 ml-2" />
            <span className="font-semibold text-slate-900">
              {selectedTime} 〜 {endTime}
            </span>
            <span className="text-slate-500 text-[11px]">
              (約{totalDuration}分)
            </span>
          </div>

          <div className="pt-2 border-t border-emerald-200/60 flex items-start justify-between">
            <div className="text-slate-600">
              <span className="font-medium text-slate-800">
                {selectedMenus.map((m) => m.name).join(' + ')}
              </span>
            </div>
            <div className="text-sm font-extrabold text-[#06C755] whitespace-nowrap ml-2">
              ¥{totalPrice.toLocaleString()}{' '}
              <span className="text-[10px] font-normal text-slate-500">(税込)</span>
            </div>
          </div>
        </div>
      </div>

      {/* エラーメッセージ */}
      {errorMessage && (
        <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* フォーム入力 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        {/* LINE連携インジケーター */}
        {profile && (
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2.5">
            {profile.pictureUrl && (
              <img
                src={profile.pictureUrl}
                alt={profile.displayName}
                className="w-7 h-7 rounded-full border border-white"
              />
            )}
            <div className="text-xs">
              <span className="text-slate-500">LINEアカウント: </span>
              <span className="font-bold text-slate-800">{profile.displayName}</span>
              <span className="ml-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                連携済み
              </span>
            </div>
          </div>
        )}

        {/* 氏名 */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            お名前 <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="例: 山田 太郎"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755] focus:border-transparent text-sm"
          />
        </div>

        {/* 電話番号 */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            お電話番号 <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="例: 090-1234-5678"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755] focus:border-transparent text-sm"
          />
        </div>

        {/* メールアドレス（任意） */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            メールアドレス <span className="text-slate-400 font-normal">(任意)</span>
          </label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="例: sample@example.com"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755] focus:border-transparent text-sm"
          />
        </div>

        {/* ご要望・メモ */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            ご要望・スタイリストへの伝達事項 <span className="text-slate-400 font-normal">(任意)</span>
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例: 静かに過ごしたい、カラーの相談がしたい 等"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755] focus:border-transparent text-sm"
          />
        </div>

        {/* 注意事項 */}
        <p className="text-[11px] text-slate-400 leading-relaxed">
          ※ご予約のキャンセルや日時変更は、マイ予約ページまたは店舗へのお電話にて承ります。
        </p>
      </form>

      {/* フッター操作バー */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
          >
            戻る
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !customerName.trim() || !customerPhone.trim()}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
              !isSubmitting && customerName.trim() && customerPhone.trim()
                ? 'bg-[#06C755] hover:bg-[#05B04B] text-white shadow-md shadow-emerald-500/20 active:scale-[0.98]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{isSubmitting ? '予約処理中...' : 'ご予約を確定する'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
