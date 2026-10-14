import { NextResponse } from 'next/server';
import { toggleSpecialHoliday } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const date = body.date;

    if (!date || typeof date !== 'string') {
      return NextResponse.json({ success: false, error: 'dateは必須です（例: 2026-10-15）' }, { status: 400 });
    }

    const result = toggleSpecialHoliday(date);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error toggling special holiday:', error);
    return NextResponse.json({ success: false, error: '休業日の切り替えに失敗しました' }, { status: 500 });
  }
}
