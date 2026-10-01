import { NextResponse } from 'next/server';
import { getReservationById, updateReservationStatus } from '@/lib/db';
import { ReservationStatus } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = getReservationById(id);
    if (!res) {
      return NextResponse.json({ success: false, error: '予約が見つかりません' }, { status: 404 });
    }
    return NextResponse.json({ success: true, reservation: res });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json({ success: false, error: '予約情報の取得に失敗しました' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status = body.status as ReservationStatus;

    if (!status || !['confirmed', 'cancelled', 'completed'].includes(status)) {
      return NextResponse.json({ success: false, error: '無効なステータスです' }, { status: 400 });
    }

    const updated = updateReservationStatus(id, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: '予約が見つかりません' }, { status: 404 });
    }

    return NextResponse.json({ success: true, reservation: updated });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json({ success: false, error: 'ステータスの更新に失敗しました' }, { status: 500 });
  }
}
