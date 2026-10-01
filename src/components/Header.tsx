'use client';

import React from 'react';
import Link from 'next/link';
import { StoreSettings } from '@/types';
import { LiffUserProfile } from '@/lib/liff';
import { Calendar, ShieldCheck, User, Wrench } from 'lucide-react';

interface HeaderProps {
  settings: StoreSettings | null;
  profile: LiffUserProfile | null;
  activeTab: 'new' | 'my';
  onTabChange: (tab: 'new' | 'my') => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  profile,
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* 上部ステータスバー */}
      <div className="bg-[#06C755] text-white px-4 py-2 flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-200" />
          <span>LINE公式アカウント連動 24h Web予約</span>
        </div>
        <div className="flex items-center gap-2">
          {profile ? (
            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-full">
              {profile.pictureUrl ? (
                <img
                  src={profile.pictureUrl}
                  alt={profile.displayName}
                  className="w-4 h-4 rounded-full border border-white"
                />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
              <span className="truncate max-w-[100px]">{profile.displayName} 様</span>
            </div>
          ) : (
            <span className="bg-black/20 px-2 py-0.5 rounded-full text-[11px]">
              ゲスト利用モード
            </span>
          )}
          <Link
            href="/admin"
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded text-[11px] transition"
          >
            <Wrench className="w-3 h-3" />
            <span>店舗管理へ</span>
          </Link>
        </div>
      </div>

      {/* 店舗名とナビゲーション */}
      <div className="max-w-xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {settings?.storeName || 'LINE 予約サロン'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              営業時間: {settings?.openTime || '10:00'} - {settings?.closeTime || '20:00'}
            </p>
          </div>
        </div>

        {/* タブ */}
        <div className="flex border-b border-slate-200 mt-3 -mx-4 px-4 gap-6">
          <button
            onClick={() => onTabChange('new')}
            className={`pb-2.5 text-sm font-semibold relative transition ${
              activeTab === 'new'
                ? 'text-[#06C755] border-b-2 border-[#06C755]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              新規予約する
            </span>
          </button>
          <button
            onClick={() => onTabChange('my')}
            className={`pb-2.5 text-sm font-semibold relative transition ${
              activeTab === 'my'
                ? 'text-[#06C755] border-b-2 border-[#06C755]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>予約の確認・キャンセル</span>
          </button>
        </div>
      </div>
    </header>
  );
};
