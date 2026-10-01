'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem } from '@/types';
import {
  UtensilsCrossed,
  Plus,
  Clock,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function AdminMenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // モーダルステート
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);

  // フォームステート
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('カット');
  const [formPrice, setFormPrice] = useState<number>(5000);
  const [formDuration, setFormDuration] = useState<number>(60);
  const [formDescription, setFormDescription] = useState<string>('');
  const [formIsAvailable, setFormIsAvailable] = useState<boolean>(true);
  const [formError, setFormError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // メニュー読み込み
  const fetchMenus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/menus?all=true');
      const data = await res.json();
      if (data.success) {
        setMenus(data.menus);
      }
    } catch (err) {
      console.error('Failed to load menus:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // モーダルオープン（新規）
  const handleOpenCreateModal = () => {
    setEditingMenu(null);
    setFormName('');
    setFormCategory('カット');
    setFormPrice(5000);
    setFormDuration(60);
    setFormDescription('');
    setFormIsAvailable(true);
    setFormError('');
    setIsModalOpen(true);
  };

  // モーダルオープン（編集）
  const handleOpenEditModal = (menu: MenuItem) => {
    setEditingMenu(menu);
    setFormName(menu.name);
    setFormCategory(menu.category);
    setFormPrice(menu.price);
    setFormDuration(menu.durationMinutes);
    setFormDescription(menu.description);
    setFormIsAvailable(menu.isAvailable);
    setFormError('');
    setIsModalOpen(true);
  };

  // 保存処理
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('メニュー名を入力してください。');
      return;
    }
    if (formPrice < 0) {
      setFormError('価格は0円以上を入力してください。');
      return;
    }
    if (formDuration <= 0) {
      setFormError('所要時間は1分以上を指定してください。');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingMenu) {
        // 更新
        const res = await fetch(`/api/menus/${editingMenu.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            category: formCategory.trim(),
            price: Number(formPrice),
            durationMinutes: Number(formDuration),
            description: formDescription.trim(),
            isAvailable: formIsAvailable,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          await fetchMenus();
        } else {
          setFormError(data.error || '更新に失敗しました。');
        }
      } else {
        // 新規追加
        const res = await fetch('/api/menus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            category: formCategory.trim(),
            price: Number(formPrice),
            durationMinutes: Number(formDuration),
            description: formDescription.trim(),
            isAvailable: formIsAvailable,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          await fetchMenus();
        } else {
          setFormError(data.error || '作成に失敗しました。');
        }
      }
    } catch (err) {
      console.error('Menu save error:', err);
      setFormError('通信エラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 公開トグル
  const handleToggleAvailable = async (menu: MenuItem) => {
    try {
      const res = await fetch(`/api/menus/${menu.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...menu,
          isAvailable: !menu.isAvailable,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchMenus();
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  // 削除
  const handleDeleteMenu = async (menu: MenuItem) => {
    if (!confirm(`「${menu.name}」を削除してもよろしいですか？`)) return;

    try {
      const res = await fetch(`/api/menus/${menu.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await fetchMenus();
      } else {
        alert(data.error || '削除に失敗しました。');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('通信エラーが発生しました。');
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダーセクション */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-[#06C755]" />
            予約メニュー設定・管理
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            お客様がLINEから予約するメニュー、所要時間、料金、公開状態を設定できます。
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-[#06C755] hover:bg-[#05B04B] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>新しいメニューを追加</span>
        </button>
      </div>

      {/* メニュー一覧カード */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          メニューを読み込み中...
        </div>
      ) : menus.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
          <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">登録されているメニューがありません</p>
          <p className="text-xs text-slate-400">
            「新しいメニューを追加」からメニューを作成してください。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition flex flex-col justify-between ${
                menu.isAvailable
                  ? 'border-slate-200'
                  : 'border-slate-200 bg-slate-50/60 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {menu.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleAvailable(menu)}
                      className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full transition ${
                        menu.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {menu.isAvailable ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>受付中</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>停止中</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{menu.name}</h3>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {menu.description || '（説明文なし）'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-base font-black text-[#06C755]">
                    ¥{menu.price.toLocaleString()}
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      (税込)
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>所要時間: 約{menu.durationMinutes}分</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(menu)}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    title="編集"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMenu(menu)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* メニュー追加/編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-[#06C755]" />
                {editingMenu ? 'メニューの編集' : '新しいメニューの追加'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  メニュー名 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例: デザイン似合わせカット"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">カテゴリ</label>
                  <input
                    type="text"
                    required
                    placeholder="例: カット / カラー / スパ"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    料金 (税込・円) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={100}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  所要時間 (分) <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    required
                    min={5}
                    step={5}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-32 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755]"
                  />
                  <span className="text-slate-500">分</span>
                  <div className="flex gap-1 ml-auto">
                    {[30, 60, 90, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setFormDuration(mins)}
                        className={`px-2 py-1 rounded text-[11px] border ${
                          formDuration === mins
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {mins}分
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  ※この所要時間に基づいて、カレンダー上で必要な空き時間枠が自動計算されます。
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">説明文・施術詳細</label>
                <textarea
                  rows={3}
                  placeholder="メニューの特徴、含まれるサービス（シャンプー・ブロー込など）"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06C755]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formIsAvailable"
                  checked={formIsAvailable}
                  onChange={(e) => setFormIsAvailable(e.target.checked)}
                  className="w-4 h-4 text-[#06C755] rounded border-slate-300 focus:ring-[#06C755]"
                />
                <label htmlFor="formIsAvailable" className="font-semibold text-slate-700 select-none cursor-pointer">
                  LINE予約でこのメニューの受付を有効にする
                </label>
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
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05B04B] text-white font-bold transition shadow-xs"
                >
                  {isSubmitting ? '保存中...' : editingMenu ? '変更を保存する' : 'メニューを追加する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
