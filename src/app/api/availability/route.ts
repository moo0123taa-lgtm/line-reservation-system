import { NextResponse } from 'next/server';
import { getAvailability } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const duration = parseInt(searchParams.get('duration') || '60', 10);

    if (!date) {
      return NextResponse.json({ success: false, error: 'dateパラメータは必須です（例: 2026-10-01）' }, { status: 400 });
    }

    const slots = getAvailability(date, duration);
    return NextResponse.json({ success: true, date, duration, slots });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ success: false, error: '空き状況の取得に失敗しました' }, { status: 500 });
  }
}
