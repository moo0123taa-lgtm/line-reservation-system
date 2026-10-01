'use client';

import liff from '@line/liff';

export interface LiffUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

let isLiffInitialized = false;

/**
 * LIFF SDKを初期化
 */
export async function initLiff(liffId?: string): Promise<boolean> {
  if (isLiffInitialized) return true;

  const targetLiffId = liffId || process.env.NEXT_PUBLIC_LIFF_ID;
  if (!targetLiffId) {
    console.warn('[LIFF] No LIFF ID provided. Running in web preview mode.');
    return false;
  }

  try {
    await liff.init({ liffId: targetLiffId });
    isLiffInitialized = true;
    console.log('[LIFF] Initialized successfully');
    return true;
  } catch (error) {
    console.error('[LIFF] Initialization failed:', error);
    return false;
  }
}

/**
 * ログインユーザーのLINEプロフィールを取得
 */
export async function getLiffProfile(): Promise<LiffUserProfile | null> {
  try {
    if (!liff.isLoggedIn()) {
      if (liff.isInClient()) {
        // LINEアプリ内であれば自動ログイン
        return null;
      }
      return null;
    }
    const profile = await liff.getProfile();
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
    };
  } catch (error) {
    console.error('[LIFF] Failed to get profile:', error);
    return null;
  }
}

/**
 * LINEログイン画面へ遷移
 */
export function liffLogin(): void {
  if (!liff.isLoggedIn()) {
    liff.login();
  }
}

/**
 * LINEアプリ内のトークにメッセージを送信（ユーザー自身のアカウントから送信）
 */
export async function sendLiffMessage(text: string): Promise<boolean> {
  try {
    if (liff.isInClient()) {
      await liff.sendMessages([
        {
          type: 'text',
          text,
        },
      ]);
      return true;
    }
    return false;
  } catch (error) {
    console.error('[LIFF] Failed to send message to chat:', error);
    return false;
  }
}

/**
 * LIFFウィンドウを閉じる
 */
export function closeLiffWindow(): void {
  if (liff.isInClient()) {
    liff.closeWindow();
  }
}
