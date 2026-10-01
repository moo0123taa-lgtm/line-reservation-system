import { NextResponse } from 'next/server';
import { getMonthAvailability } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // YYYY-MM
    const duration = parseInt(searchParams.get('duration') || '60', 10);

    if (!month) {
      return NextResponse.json({ success: false, error: 'monthパラメータは必須です（例: 2026-10）' }, { status: 400 });
    }

    const days = getMonthAvailability(month, duration);
    return NextResponse.json({ success: true, month, duration, days });
  } catch (error) {
    console.error('Error fetching calendar availability:', error);
    return NextResponse.json({ success: false, error: 'カレンダー空き状況の取得に失敗しました' }, { status: 500 });
  }
}
