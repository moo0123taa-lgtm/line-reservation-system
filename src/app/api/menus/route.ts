import { NextResponse } from 'next/server';
import { getMenus, createMenu } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true'; // 店舗管理画面からは無効なメニューも含めて全件取得
    const menus = getMenus(all);
    return NextResponse.json({ success: true, menus });
  } catch (error) {
    console.error('Error fetching menus:', error);
    return NextResponse.json({ success: false, error: 'メニューの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || typeof body.price !== 'number' || typeof body.durationMinutes !== 'number') {
      return NextResponse.json(
        { success: false, error: 'メニュー名、価格、所要時間は必須です。' },
        { status: 400 }
      );
    }

    const newMenu = createMenu({
      name: body.name,
      category: body.category || 'その他',
      price: body.price,
      durationMinutes: body.durationMinutes,
      description: body.description || '',
      isAvailable: body.isAvailable !== false,
      order: body.order || 0,
    });

    return NextResponse.json({ success: true, menu: newMenu }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu:', error);
    return NextResponse.json({ success: false, error: 'メニューの作成に失敗しました' }, { status: 500 });
  }
}
