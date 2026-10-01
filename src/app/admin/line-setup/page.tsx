'use client';

import React from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  Smartphone,
  MessageSquare,
  Key,
  Globe,
  Settings,
} from 'lucide-react';

export default function LineSetupGuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ページタイトル */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-[#06C755]" />
          LINE公式アカウント連携ガイド（導入マニュアル）
        </h1>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          このシステムをお持ちの「LINE公式アカウント」と連携させ、友だち追加時やリッチメニュータップ時に予約アプリ（LIFF）を起動して自動通知を送るまでの手順です。
        </p>
      </div>

      {/* 概要フロー */}
      <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl">
        <h2 className="text-sm font-bold text-emerald-900 mb-3">連携の全体像</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <span className="w-5 h-5 rounded-full bg-[#06C755] text-white flex items-center justify-center text-[10px]">
                1
              </span>
              LIFFアプリの登録
            </div>
            <p className="text-slate-500 leading-relaxed">
              LINE DevelopersでLIFFを作成し、お客様がLINE内でワンタップで開けるようにします。
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <span className="w-5 h-5 rounded-full bg-[#06C755] text-white flex items-center justify-center text-[10px]">
                2
              </span>
              Messaging API連携
            </div>
            <p className="text-slate-500 leading-relaxed">
              チャネルアクセストークンを設定し、予約完了時にLINE自動返信やプッシュ通知を届けます。
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <span className="w-5 h-5 rounded-full bg-[#06C755] text-white flex items-center justify-center text-[10px]">
                3
              </span>
              リッチメニュー設置
            </div>
            <p className="text-slate-500 leading-relaxed">
              LINE公式アカウントのトーク画面下部に「予約する」ボタンを設置して完了です。
            </p>
          </div>
        </div>
      </div>

      {/* 詳細ステップ */}
      <div className="space-y-4">
        {/* Step 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-black">
              STEP 1
            </span>
            <h3 className="text-base font-bold text-slate-900">
              LINE Developersコンソールにログイン
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <a
              href="https://developers.line.biz/"
              target="_blank"
              rel="noreferrer"
              className="text-[#06C755] font-bold inline-flex items-center gap-1 hover:underline"
            >
              LINE Developersコンソール <ExternalLink className="w-3.5 h-3.5" />
            </a>
            にアクセスし、LINE公式アカウントを管理しているビジネスアカウントでログインします。
          </p>
          <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <li>プロバイダーを選択（または新規作成）</li>
            <li>「Messaging API」チャネルを作成（既にある場合はそれを選択）</li>
          </ul>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-[#06C755] text-white rounded-lg text-xs font-black">
              STEP 2
            </span>
            <h3 className="text-base font-bold text-slate-900">
              LIFF (LINE Front-end Framework) アプリの作成
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            LINE Developersのチャネル設定画面にある<strong>「LIFF」タブ</strong>を開き、<strong>「追加」</strong>をクリックします。
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <span className="font-bold text-slate-700">LIFFアプリ名:</span>
              <span className="sm:col-span-2 text-slate-900">店舗予約システム（任意）</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <span className="font-bold text-slate-700">サイズ:</span>
              <span className="sm:col-span-2 text-slate-900">Full または Tall</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <span className="font-bold text-slate-700">エンドポイントURL:</span>
              <span className="sm:col-span-2 font-mono text-[#06C755] font-bold">
                公開サーバーのURL（例: https://your-domain.vercel.app/ ）
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <span className="font-bold text-slate-700">Scope:</span>
              <span className="sm:col-span-2 text-slate-900">profile, chat_message.write にチェック</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            作成後に発行される <strong>LIFF ID</strong>（例: <code>1234567890-AbCdEfGh</code>）をコピーし、
            店舗設定ページの「LINE LIFF ID」欄に入力します。
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-black">
              STEP 3
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Webhook URL & Messaging API トークンの設定
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            チャネルの<strong>「Messaging API設定」タブ</strong>を開きます。
          </p>
          <div className="space-y-2 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">1. Webhook URLの登録</span>
              <p className="text-slate-600">
                Webhook URL欄に <code>https://your-domain.vercel.app/api/line/webhook</code> を入力し、
                <strong>「Webhookの利用」をオン</strong>にします。
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">2. チャネルアクセストークンの発行</span>
              <p className="text-slate-600">
                一番下の「チャネルアクセストークン（長期）」で「発行」をクリックし、トークンを店舗設定に貼り付けます。
              </p>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-[#06C755] text-white rounded-lg text-xs font-black">
              STEP 4
            </span>
            <h3 className="text-base font-bold text-slate-900">
              LINE公式アカウントのリッチメニューに登録
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <a
              href="https://manager.line.biz/"
              target="_blank"
              rel="noreferrer"
              className="text-[#06C755] font-bold inline-flex items-center gap-1 hover:underline"
            >
              LINE Official Account Manager <ExternalLink className="w-3.5 h-3.5" />
            </a>
            （管理画面）を開きます。
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <p className="text-slate-700">
              左メニューの<strong>「トークルーム管理」→「リッチメニュー」</strong>から新規作成し、
              ボタンのアクション設定で以下を指定します：
            </p>
            <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-slate-800">
              タイプ: <strong>リンク</strong><br />
              URL: <strong>https://liff.line.me/あなたのLIFF_ID</strong>
            </div>
            <p className="text-slate-500">
              これにより、お客様がLINE公式アカウントの画面を開いて「予約する」をタップした瞬間、
              LINEアプリ内で直接この予約画面が起動します！
            </p>
          </div>
        </div>
      </div>

      {/* 設定ページへの導線 */}
      <div className="flex justify-end pt-2">
        <Link
          href="/admin/settings"
          className="px-6 py-3 rounded-xl bg-[#06C755] hover:bg-[#05B04B] text-white font-bold text-sm shadow-xs flex items-center gap-2 transition"
        >
          <Settings className="w-4 h-4" />
          <span>店舗・LINE設定画面へ戻る</span>
        </Link>
      </div>
    </div>
  );
}
