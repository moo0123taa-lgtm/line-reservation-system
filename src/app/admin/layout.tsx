'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  UtensilsCrossed,
  Settings,
  HelpCircle,
  ExternalLink,
  Store,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: '予約・空き状況', icon: CalendarDays },
    { href: '/admin/menus', label: 'メニュー設定', icon: UtensilsCrossed },
    { href: '/admin/settings', label: '店舗・LINE設定', icon: Settings },
    { href: '/admin/line-setup', label: 'LINE連携ガイド', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* 管理画面トップバー */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#06C755] flex items-center justify-center text-white shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight flex items-center gap-2">
                <span>店舗管理ポータル</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  Staff Only
                </span>
              </div>
              <p className="text-[11px] text-slate-400">LINE予約システム管理</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <span>お客様用予約画面を開く</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* ナビゲーションタブ */}
        <nav className="border-t border-slate-800 bg-slate-950/50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex gap-6 overflow-x-auto scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                    isActive
                      ? 'border-[#06C755] text-[#06C755]'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
