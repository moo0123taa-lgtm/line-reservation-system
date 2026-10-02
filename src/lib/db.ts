import fs from 'fs';
import path from 'path';
import { MenuItem, Reservation, StoreSettings, TimeSlot, DayAvailability, ReservationStatus } from '@/types';

interface DatabaseData {
  settings: StoreSettings;
  menus: MenuItem[];
  reservations: Reservation[];
}

// Vercelサーバーレス環境（読み取り専用ファイルシステム）とローカル環境の両方に対応
const isVercel = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const DATA_DIR = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');
const SEED_FILE = path.join(process.cwd(), 'data', 'store.json');

// 初期設定
const defaultSettings: StoreSettings = {
  storeName: 'Beauty Salon LINE',
  storePhone: '03-1234-5678',
  storeAddress: '東京都渋谷区道玄坂1-2-3',
  openTime: '10:00',
  closeTime: '20:00',
  slotIntervalMinutes: 30,
  maxConcurrentReservations: 1,
  closedDaysOfWeek: [2],
  specialHolidays: [],
  liffId: process.env.NEXT_PUBLIC_LIFF_ID || '',
  lineChannelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  lineChannelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

// 初期メニュー一覧
const defaultMenus: MenuItem[] = [
  {
    id: 'menu-1',
    name: 'デザインカット',
    category: 'カット',
    price: 5500,
    durationMinutes: 60,
    description: 'カウンセリング重視で骨格に合わせた似合わせカット＆シャンプー・ブロー付き。',
    isAvailable: true,
    order: 1,
  },
  {
    id: 'menu-2',
    name: 'オーガニックカラー＋カット',
    category: 'カラー',
    price: 11000,
    durationMinutes: 120,
    description: '髪と頭皮に優しいオーガニックカラー剤を使用。カット＆集中トリートメント付き。',
    isAvailable: true,
    order: 2,
  },
  {
    id: 'menu-3',
    name: 'プレミアム髪質改善トリートメント',
    category: 'トリートメント',
    price: 8800,
    durationMinutes: 60,
    description: '高濃度ケラチンとヒアルロン酸で芯から潤う極上の艶髪へ導きます。シャンプー・ブロー込。',
    isAvailable: true,
    order: 3,
  },
  {
    id: 'menu-4',
    name: 'アロマ極上ヘッドスパ（30分コース）',
    category: 'スパ',
    price: 4400,
    durationMinutes: 30,
    description: '天然精油のアロマで頭皮のコリと眼精疲労をじっくりほぐすリフレッシュコース。',
    isAvailable: true,
    order: 4,
  },
  {
    id: 'menu-5',
    name: '【初回限定】フルコース（カット＋カラー＋極上スパ）',
    category: 'セット',
    price: 14500,
    durationMinutes: 150,
    description: '当サロン自慢のフルメニューを贅沢に体験できるお得なセットコースです。',
    isAvailable: true,
    order: 5,
  },
];

function getInitialReservations(): Reservation[] {
  return [];
}

// サーバーレス関数の実行中メモリキャッシュ
declare global {
  var __STORE_CACHE__: DatabaseData | undefined;
}

// データベースの初期化・読み込み
function readDb(): DatabaseData {
  if (globalThis.__STORE_CACHE__) {
    return globalThis.__STORE_CACHE__;
  }

  try {
    // 1. DATA_FILE (/tmp/store.json または data/store.json) が存在すればそれを読み込む
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      globalThis.__STORE_CACHE__ = data;
      return data;
    }

    // 2. なければプロジェクト同梱の SEED_FILE (data/store.json) を読み込む
    if (fs.existsSync(SEED_FILE)) {
      const raw = fs.readFileSync(SEED_FILE, 'utf-8');
      const data = JSON.parse(raw);
      globalThis.__STORE_CACHE__ = data;
      // Vercel環境なら /tmp にコピーしておく
      if (isVercel) {
        try {
          fs.writeFileSync(DATA_FILE, raw, 'utf-8');
        } catch (e) {
          console.warn('[DB] Could not write seed to /tmp:', e);
        }
      }
      return data;
    }
  } catch (err) {
    console.error('[DB] Failed to read store file, falling back to defaults:', err);
  }

  // 3. どちらも無ければ初期データ
  const initialData: DatabaseData = {
    settings: defaultSettings,
    menus: defaultMenus,
    reservations: getInitialReservations(),
  };
  globalThis.__STORE_CACHE__ = initialData;
  return initialData;
}

// データベースの書き込み
function writeDb(data: DatabaseData): void {
  // まずインメモリキャッシュを即時更新（これによってAPIレスポンスは常に最新になる）
  globalThis.__STORE_CACHE__ = data;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('[DB] Write file error (in-memory remains updated):', err);
  }
}

// 時間補助ユーティリティ (HH:mm -> 分数, 分数 -> HH:mm)
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// --- 店舗設定 API ---
export function getStoreSettings(): StoreSettings {
  const db = readDb();
  return db.settings;
}

export function updateStoreSettings(newSettings: Partial<StoreSettings>): StoreSettings {
  const db = readDb();
  db.settings = { ...db.settings, ...newSettings };
  writeDb(db);
  return db.settings;
}

// --- メニュー API ---
export function getMenus(includeUnavailable = false): MenuItem[] {
  const db = readDb();
  let menus = db.menus.sort((a, b) => a.order - b.order);
  if (!includeUnavailable) {
    menus = menus.filter((m) => m.isAvailable);
  }
  return menus;
}

export function getMenuById(id: string): MenuItem | undefined {
  const db = readDb();
  return db.menus.find((m) => m.id === id);
}

export function createMenu(menu: Omit<MenuItem, 'id'>): MenuItem {
  const db = readDb();
  const newMenu: MenuItem = {
    ...menu,
    id: `menu-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    order: menu.order || db.menus.length + 1,
  };
  db.menus.push(newMenu);
  writeDb(db);
  return newMenu;
}

export function updateMenu(id: string, updates: Partial<Omit<MenuItem, 'id'>>): MenuItem | null {
  const db = readDb();
  const index = db.menus.findIndex((m) => m.id === id);
  if (index === -1) return null;
  db.menus[index] = { ...db.menus[index], ...updates };
  writeDb(db);
  return db.menus[index];
}

export function deleteMenu(id: string): boolean {
  const db = readDb();
  const index = db.menus.findIndex((m) => m.id === id);
  if (index === -1) return false;
  db.menus.splice(index, 1);
  writeDb(db);
  return true;
}

// --- 予約 API ---
export function getReservations(filter?: {
  date?: string;
  status?: ReservationStatus;
  customerLineId?: string;
}): Reservation[] {
  const db = readDb();
  let list = db.reservations;
  if (filter?.date) {
    list = list.filter((r) => r.date === filter.date);
  }
  if (filter?.status) {
    list = list.filter((r) => r.status === filter.status);
  }
  if (filter?.customerLineId) {
    list = list.filter((r) => r.customerLineId === filter.customerLineId);
  }
  // 日付と時間の降順/昇順
  return list.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });
}

export function getReservationById(id: string): Reservation | undefined {
  const db = readDb();
  return db.reservations.find((r) => r.id === id);
}

export function updateReservationStatus(id: string, status: ReservationStatus): Reservation | null {
  const db = readDb();
  const res = db.reservations.find((r) => r.id === id);
  if (!res) return null;
  res.status = status;
  res.updatedAt = new Date().toISOString();
  writeDb(db);
  return res;
}

// 予約作成処理（空き枠競合チェック付き）
export function createReservation(
  data: Omit<Reservation, 'id' | 'reservationNumber' | 'createdAt' | 'updatedAt'>
): { success: boolean; reservation?: Reservation; error?: string } {
  const db = readDb();
  const settings = db.settings;

  // 定休日チェック
  const dateObj = new Date(`${data.date}T00:00:00`);
  const dayOfWeek = dateObj.getDay();
  if (settings.closedDaysOfWeek.includes(dayOfWeek) || settings.specialHolidays.includes(data.date)) {
    return { success: false, error: '選択された日は定休日または休業日です。' };
  }

  const startMin = timeToMinutes(data.startTime);
  const endMin = timeToMinutes(data.endTime);
  const closeMin = timeToMinutes(settings.closeTime);

  if (endMin > closeMin) {
    return { success: false, error: '営業時間を超える時間帯の予約はできません。' };
  }

  // 競合チェック: 既存の確定済み予約と重複しているか
  const existingReservations = db.reservations.filter(
    (r) => r.date === data.date && r.status === 'confirmed'
  );

  // 予約期間中の各スロットインターバルごとに同時予約可能数を超えていないか検査
  const interval = settings.slotIntervalMinutes;
  for (let t = startMin; t < endMin; t += interval) {
    const concurrentCount = existingReservations.filter((r) => {
      const rStart = timeToMinutes(r.startTime);
      const rEnd = timeToMinutes(r.endTime);
      return t >= rStart && t < rEnd;
    }).length;

    if (concurrentCount >= settings.maxConcurrentReservations) {
      return { success: false, error: 'ご希望の時間帯は既に満枠となっております。別の時間をお選びください。' };
    }
  }

  const dateStr = data.date.replace(/-/g, '');
  const dailyCount = db.reservations.filter((r) => r.date === data.date).length + 1;
  const reservationNumber = `R${dateStr}-${String(dailyCount).padStart(3, '0')}`;

  const newReservation: Reservation = {
    ...data,
    id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    reservationNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.reservations.push(newReservation);
  writeDb(db);

  return { success: true, reservation: newReservation };
}

// --- 空き状況計算 API ---

/**
 * 指定日の空きスロット一覧を返す
 * @param dateStr "YYYY-MM-DD"
 * @param durationMinutes メニュー合計所要時間（分）
 */
export function getAvailability(dateStr: string, durationMinutes: number = 30): TimeSlot[] {
  const db = readDb();
  const settings = db.settings;

  const dateObj = new Date(`${dateStr}T00:00:00`);
  const dayOfWeek = dateObj.getDay();

  // 定休日・特別休業日
  if (settings.closedDaysOfWeek.includes(dayOfWeek) || settings.specialHolidays.includes(dateStr)) {
    return [];
  }

  const openMin = timeToMinutes(settings.openTime);
  const closeMin = timeToMinutes(settings.closeTime);
  const interval = settings.slotIntervalMinutes;

  const activeReservations = db.reservations.filter(
    (r) => r.date === dateStr && r.status === 'confirmed'
  );

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const slots: TimeSlot[] = [];

  for (let slotStart = openMin; slotStart <= closeMin - interval; slotStart += interval) {
    const slotEnd = slotStart + durationMinutes;
    const timeStr = minutesToTime(slotStart);
    const endTimeStr = minutesToTime(slotEnd);

    // 閉店時間を超える場合は予約不可
    if (slotEnd > closeMin) {
      slots.push({
        time: timeStr,
        endTime: endTimeStr,
        isAvailable: false,
        remainingCount: 0,
        reason: 'too_short',
      });
      continue;
    }

    // 過去の時間帯判定（当日の場合）
    if (dateStr === todayStr && slotStart <= currentMinutes) {
      slots.push({
        time: timeStr,
        endTime: endTimeStr,
        isAvailable: false,
        remainingCount: 0,
        reason: 'past',
      });
      continue;
    }

    // 予約所要時間全体の各インターバルで空き枠数を検証
    let maxOverlapping = 0;
    for (let checkTime = slotStart; checkTime < slotEnd; checkTime += interval) {
      const count = activeReservations.filter((r) => {
        const rStart = timeToMinutes(r.startTime);
        const rEnd = timeToMinutes(r.endTime);
        return checkTime >= rStart && checkTime < rEnd;
      }).length;
      if (count > maxOverlapping) {
        maxOverlapping = count;
      }
    }

    const remaining = Math.max(0, settings.maxConcurrentReservations - maxOverlapping);
    const isAvailable = remaining > 0;

    slots.push({
      time: timeStr,
      endTime: endTimeStr,
      isAvailable,
      remainingCount: remaining,
      reason: isAvailable ? undefined : 'full',
    });
  }

  return slots;
}

/**
 * 指定月（YYYY-MM）の日別空き状況を返す（カレンダー表示用）
 */
export function getMonthAvailability(yearMonth: string, durationMinutes: number = 30): DayAvailability[] {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const daysInMonth = new Date(year, month, 0).getDate();
  const result: DayAvailability[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${yearStr}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(`${dateStr}T00:00:00`);
    const dayOfWeek = dateObj.getDay();

    const db = readDb();
    const isClosed =
      db.settings.closedDaysOfWeek.includes(dayOfWeek) ||
      db.settings.specialHolidays.includes(dateStr);

    if (isClosed) {
      result.push({
        date: dateStr,
        dayOfWeek,
        isClosed: true,
        status: 'closed',
        totalSlots: 0,
        availableSlots: 0,
      });
      continue;
    }

    const slots = getAvailability(dateStr, durationMinutes);
    const total = slots.length;
    const available = slots.filter((s) => s.isAvailable).length;

    let status: 'available' | 'few' | 'full' | 'closed' = 'available';
    if (available === 0) {
      status = 'full';
    } else if (available <= Math.ceil(total * 0.25)) {
      status = 'few';
    }

    result.push({
      date: dateStr,
      dayOfWeek,
      isClosed: false,
      status,
      totalSlots: total,
      availableSlots: available,
    });
  }

  return result;
}
