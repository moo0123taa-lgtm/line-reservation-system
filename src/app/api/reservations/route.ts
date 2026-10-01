import { NextResponse } from 'next/server';
import { getReservations, createReservation, getStoreSettings } from '@/lib/db';
import { sendReservationNotification } from '@/lib/line';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;
    const lineId = searchParams.get('lineId') || undefined;
    const status = searchParams.get('status') as any || undefined;

    const reservations = getReservations({
      date,
      customerLineId: lineId,
      status,
    });

    return NextResponse.json({ success: true, reservations });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ success: false, error: '予約情報の取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 必須バリデーション
    if (!body.customerName || !body.customerPhone || !body.date || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { success: false, error: '氏名、電話番号、予約日、予約時間は必須です。' },
        { status: 400 }
      );
    }

    if (!body.menuIds || body.menuIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'メニューを少なくとも1つ選択してください。' },
        { status: 400 }
      );
    }

    const result = createReservation({
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail || '',
      customerLineId: body.customerLineId || '',
      customerLineName: body.customerLineName || '',
      customerLinePicture: body.customerLinePicture || '',
      menuIds: body.menuIds,
      menuNames: body.menuNames || [],
      totalPrice: body.totalPrice || 0,
      totalDuration: body.totalDuration || 30,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      status: 'confirmed',
      note: body.note || '',
    });

    if (!result.success || !result.reservation) {
      return NextResponse.json({ success: false, error: result.error }, { status: 409 });
    }

    // LINEプッシュ通知（非同期で送信、設定がある場合）
    const settings = getStoreSettings();
    if (result.reservation.customerLineId) {
      sendReservationNotification(result.reservation, settings).catch((err) => {
        console.error('[Reservation] Failed to send LINE push notification:', err);
      });
    }

    return NextResponse.json({ success: true, reservation: result.reservation }, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ success: false, error: '予約処理に失敗しました' }, { status: 500 });
  }
}
