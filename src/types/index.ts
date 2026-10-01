export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  durationMinutes: number; // 所要時間（分）
  description: string;
  isAvailable: boolean;   // 予約可能かどうか
  order: number;
}

export type ReservationStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Reservation {
  id: string;
  reservationNumber: string; // 予約番号 (例: R20261001-001)
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerLineId?: string;   // LINE User ID
  customerLineName?: string; // LINE表示名
  customerLinePicture?: string;
  menuIds: string[];
  menuNames: string[];
  totalPrice: number;
  totalDuration: number;     // 合計所要時間（分）
  date: string;              // YYYY-MM-DD
  startTime: string;         // HH:mm
  endTime: string;           // HH:mm
  status: ReservationStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  storePhone: string;
  storeAddress: string;
  openTime: string;          // HH:mm (例: "09:00")
  closeTime: string;         // HH:mm (例: "19:00")
  slotIntervalMinutes: number; // スロット刻み (例: 30分)
  maxConcurrentReservations: number; // 同時対応可能枠数 (例: 1)
  closedDaysOfWeek: number[]; // 定休日 (0: 日曜, 1: 月曜, ... 6: 土曜)
  specialHolidays: string[]; // 特別休業日 (YYYY-MM-DD)
  liffId?: string;           // LINE LIFF ID
  lineChannelAccessToken?: string;
  lineChannelSecret?: string;
  lineOfficialAccountUrl?: string; // 友だち追加URL
}

export interface TimeSlot {
  time: string;              // HH:mm
  endTime: string;           // HH:mm
  isAvailable: boolean;      // 予約可能か
  remainingCount: number;    // 残り枠数
  reason?: 'full' | 'past' | 'closed' | 'too_short'; // 予約不可の理由
}

export interface DayAvailability {
  date: string;              // YYYY-MM-DD
  dayOfWeek: number;
  isClosed: boolean;
  status: 'available' | 'few' | 'full' | 'closed'; // 空き多数 | 残りわずか | 満枠 | 休業
  totalSlots: number;
  availableSlots: number;
}
