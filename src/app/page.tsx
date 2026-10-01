'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, StoreSettings, Reservation } from '@/types';
import { Header } from '@/components/Header';
import { MenuSelector } from '@/components/MenuSelector';
import { SlotPicker } from '@/components/SlotPicker';
import { CustomerForm } from '@/components/CustomerForm';
import { MyReservations } from '@/components/MyReservations';
import { initLiff, getLiffProfile, LiffUserProfile } from '@/lib/liff';
import { UserCheck } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'new' | 'my'>('new');
  const [step, setStep] = useState<number>(1); // 1: メニュー, 2: 日時, 3: お客様情報

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 予約選択ステート
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  // LINEプロフィール
  const [profile, setProfile] = useState<LiffUserProfile | null>(null);

  // 初期データ読み込み & LIFF初期化
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [settingsRes, menusRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/menus'),
        ]);
        const settingsData = await settingsRes.json();
        const menusData = await menusRes.json();

        if (settingsData.success) {
          setSettings(settingsData.settings);
        }
        if (menusData.success) {
          setMenus(menusData.menus);
        }

        // LIFFの初期化
        const liffOk = await initLiff(settingsData.settings?.liffId);
        if (liffOk) {
          const userProfile = await getLiffProfile();
          if (userProfile) {
            setProfile(userProfile);
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // メニューの選択/解除
  const handleToggleMenu = (menuId: string) => {
    setSelectedMenuIds((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  // 選択中メニュー一覧
  const selectedMenus = menus.filter((m) => selectedMenuIds.includes(m.id));
  const totalDuration = selectedMenus.reduce((sum, m) => sum + m.durationMinutes, 0);
  const totalPrice = selectedMenus.reduce((sum, m) => sum + m.price, 0);

  // スロット選択
  const handleSelectSlot = (date: string, time: string, calculatedEndTime: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setEndTime(calculatedEndTime);
  };

  // テスト用: LINEログインを疑似体験するモック機能
  const handleSimulateLineLogin = () => {
    setProfile({
      userId: `Utest_${Math.random().toString(36).substring(2, 8)}`,
      displayName: 'LINEテスト顧客',
      pictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#06C755] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">予約画面を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* 開発・テスト支援バナー（LIFF ID未設定時等） */}
      {!profile && (
        <div className="bg-emerald-950 text-emerald-200 text-xs px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>【テスト用】ブラウザでLINEログイン動作をシミュレートできます</span>
          </div>
          <button
            onClick={handleSimulateLineLogin}
            className="flex items-center gap-1 bg-[#06C755] hover:bg-[#05B04B] text-white px-2.5 py-0.5 rounded text-[11px] font-bold transition"
          >
            <UserCheck className="w-3 h-3" />
            LINE連携を疑似体験
          </button>
        </div>
      )}

      {/* ヘッダー */}
      <Header
        settings={settings}
        profile={profile}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'new') setStep(1);
        }}
      />

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4">
        {activeTab === 'my' ? (
          <MyReservations profile={profile} />
        ) : (
          <div>
            {step === 1 && (
              <MenuSelector
                menus={menus}
                selectedMenuIds={selectedMenuIds}
                onToggleMenu={handleToggleMenu}
                onNext={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <SlotPicker
                totalDuration={totalDuration}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelectSlot={handleSelectSlot}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}

            {step === 3 && (
              <CustomerForm
                selectedMenus={selectedMenus}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                endTime={endTime}
                totalDuration={totalDuration}
                totalPrice={totalPrice}
                profile={profile}
                onBack={() => setStep(2)}
                onSuccess={() => {
                  // 完了後の処理
                }}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
