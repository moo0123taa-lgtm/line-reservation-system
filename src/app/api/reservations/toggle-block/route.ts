import { NextResponse } from 'next/server';
import { toggleSlotBlock } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, startTime, endTime } = body;

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'date, startTime, endTime は必須です' },
        { status: 400 }
      );
    }

    const result = toggleSlotBlock(date, startTime, endTime);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error toggling slot block:', error);
    return NextResponse.json({ success: false, error: '時間枠ブロックの切り替えに失敗しました' }, { status: 500 });
  }
}
