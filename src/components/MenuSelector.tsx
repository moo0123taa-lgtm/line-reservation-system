'use client';

import React, { useState } from 'react';
import { MenuItem } from '@/types';
import { Clock, Check, Sparkles } from 'lucide-react';

interface MenuSelectorProps {
  menus: MenuItem[];
  selectedMenuIds: string[];
  onToggleMenu: (menuId: string) => void;
  onNext: () => void;
}

export const MenuSelector: React.FC<MenuSelectorProps> = ({
  menus,
  selectedMenuIds,
  onToggleMenu,
  onNext,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // カテゴリ一覧
  const categories = ['all', ...Array.from(new Set(menus.map((m) => m.category)))];

  const filteredMenus =
    selectedCategory === 'all'
      ? menus
      : menus.filter((m) => m.category === selectedCategory);

  // 選択中メニューの合計
  const selectedMenus = menus.filter((m) => selectedMenuIds.includes(m.id));
  const totalDuration = selectedMenus.reduce((sum, m) => sum + m.durationMinutes, 0);
  const totalPrice = selectedMenus.reduce((sum, m) => sum + m.price, 0);

  return (
    <div className="pb-28">
      {/* 説明テキスト */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
          <span className="w-6 h-6 rounded-full bg-[#06C755] text-white flex items-center justify-center text-xs font-bold">
            1
          </span>
          ご希望のメニューを選択してください
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          複数メニューを組み合わせることも可能です（所要時間が自動計算されます）
        </p>
      </div>

      {/* カテゴリタブ */}
      {categories.length > 2 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'すべて' : cat}
            </button>
          ))}
        </div>
      )}

      {/* メニューリスト */}
      <div className="space-y-3">
        {filteredMenus.map((menu) => {
          const isSelected = selectedMenuIds.includes(menu.id);
          return (
            <div
              key={menu.id}
              onClick={() => onToggleMenu(menu.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-[#06C755] bg-emerald-50/40 ring-1 ring-[#06C755]'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {menu.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{menu.name}</h3>
                  </div>

                  {menu.description && (
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {menu.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-base font-extrabold text-[#06C755]">
                      ¥{menu.price.toLocaleString()}
                      <span className="text-xs font-normal text-slate-500 ml-1">
                        (税込)
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      約{menu.durationMinutes}分
                    </span>
                  </div>
                </div>

                {/* 選択チェックボックス */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-[#06C755] border-[#06C755] text-white'
                      : 'border-slate-300 bg-slate-50 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 画面下部固定アクションバー */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">
              選択中: {selectedMenuIds.length}品 (目安: 約{totalDuration}分)
            </div>
            <div className="text-lg font-bold text-slate-900">
              ¥{totalPrice.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">(税込)</span>
            </div>
          </div>

          <button
            onClick={onNext}
            disabled={selectedMenuIds.length === 0}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
              selectedMenuIds.length > 0
                ? 'bg-[#06C755] hover:bg-[#05B04B] text-white shadow-md shadow-emerald-500/20 active:scale-[0.98]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>空き枠・日時を選ぶ</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
