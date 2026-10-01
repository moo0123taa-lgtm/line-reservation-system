'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings } from '@/types';
import { Settings, Save, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMessage(data.error || '保存に失敗しました。');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setErrorMessage('通信エラーが発生しました。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleHoliday = (dayNum: number) => {
    if (!settings) return;
    const exists = settings.closedDaysOfWeek.includes(dayNum);
    const updated = exists
      ? settings.closedDaysOfWeek.filter((d) => d !== dayNum)
      : [...settings.closedDaysOfWeek, dayNum];
    setSettings({ ...settings, closedDaysOfWeek: updated });
  };

  const copyWebhookUrl = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/api/line/webhook`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const daysOfWeekLabels = [
    { num: 0, label: '日曜日' },
    { num: 1, label: '月曜日' },
    { num: 2, label: '火曜日' },
    { num: 3, label: '水曜日' },
    { num: 4, label: '木曜日' },
    { num: 5, label: '金曜日' },
    { num: 6, label: '土曜日' },
  ];

  if (isLoading || !settings) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        設定情報を読み込み中...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ページタイトル */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#06C755]" />
          店舗設定 & LINE公式アカウント連携設定
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          店舗基本情報、営業時間、定休日、予約受付枠数、LINE Messaging API / LIFFの接続設定を行います。
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">設定を正常に保存しました！予約枠の計算に即座に反映されます。</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* 店舗基本情報 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            1. 店舗基本情報
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">店舗名</label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755] text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">電話番号</label>
              <input
                type="tel"
                value={settings.storePhone}
                onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755] text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">店舗住所</label>
              <input
                type="text"
                value={settings.storeAddress}
                onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755] text-sm"
              />
            </div>
          </div>
        </div>

        {/* 営業時間・空き枠ルール */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            2. 営業時間 & 予約受付枠ルール
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">開店時間</label>
              <input
                type="time"
                value={settings.openTime}
                onChange={(e) => setSettings({ ...settings, openTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755] text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">閉店時間</label>
              <input
                type="time"
                value={settings.closeTime}
                onChange={(e) => setSettings({ ...settings, closeTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755] text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                予約枠の間隔 (スロット刻み)
              </label>
              <select
                value={settings.slotIntervalMinutes}
                onChange={(e) =>
                  setSettings({ ...settings, slotIntervalMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755] text-sm"
              >
                <option value={15}>15分刻み</option>
                <option value={30}>30分刻み (標準)</option>
                <option value={60}>60分刻み</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                1枠あたりの最大受付人数 (席数・スタッフ数)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={settings.maxConcurrentReservations}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxConcurrentReservations: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755] text-sm"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                ※「1」に設定するとマンツーマン（1枠1人）となり、予約が入るとその時間枠は満枠になります。
              </p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2">定休日（毎週休業する曜日）</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeekLabels.map((d) => {
                const isClosed = settings.closedDaysOfWeek.includes(d.num);
                return (
                  <button
                    key={d.num}
                    type="button"
                    onClick={() => handleToggleHoliday(d.num)}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold transition ${
                      isClosed
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {d.label} {isClosed ? '(定休)' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* LINE公式アカウント & LIFF 連携設定 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#06C755] text-white flex items-center justify-center text-xs font-black">
                L
              </span>
              3. LINE公式アカウント連携設定 (LIFF & Messaging API)
            </h2>
            <a
              href="/admin/line-setup"
              className="text-xs text-[#06C755] hover:underline font-semibold"
            >
              設定手順を見る →
            </a>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                LINE LIFF ID
              </label>
              <input
                type="text"
                placeholder="例: 1234567890-AbCdEfGh"
                value={settings.liffId || ''}
                onChange={(e) => setSettings({ ...settings, liffId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755] font-mono text-sm"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                LINE Developersの「LIFF」タブで作成したLIFF IDを入力します。
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Channel Access Token (長期チャネルアクセストークン)
              </label>
              <textarea
                rows={2}
                placeholder="Messaging APIのチャネルアクセストークン"
                value={settings.lineChannelAccessToken || ''}
                onChange={(e) =>
                  setSettings({ ...settings, lineChannelAccessToken: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755] font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                予約完了時にお客さんのLINEトークへ予約確定メッセージを自動送信するために使用します。
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Channel Secret (チャネルシークレット)
              </label>
              <input
                type="password"
                placeholder="チャネル基本設定のChannel Secret"
                value={settings.lineChannelSecret || ''}
                onChange={(e) =>
                  setSettings({ ...settings, lineChannelSecret: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755] font-mono text-sm"
              />
            </div>

            {/* Webhook URL案内 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 mt-2">
              <span className="font-bold text-slate-700 text-xs">
                LINE Developersに設定する Webhook URL
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/api/line/webhook`
                      : 'https://your-domain.com/api/line/webhook'
                  }
                  className="flex-1 px-3 py-1.5 bg-white rounded border border-slate-200 font-mono text-xs text-slate-600 select-all"
                />
                <button
                  type="button"
                  onClick={copyWebhookUrl}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-700 flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'コピー完了' : 'コピー'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-[#06C755] hover:bg-[#05B04B] text-white font-bold text-sm shadow-md shadow-emerald-500/20 flex items-center gap-2 transition active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? '設定を保存中...' : '設定を保存する'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
