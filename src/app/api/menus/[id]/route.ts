import { NextResponse } from 'next/server';
import { updateMenu, deleteMenu, getMenuById } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = updateMenu(id, {
      name: body.name,
      category: body.category,
      price: body.price,
      durationMinutes: body.durationMinutes,
      description: body.description,
      isAvailable: body.isAvailable,
      order: body.order,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'メニューが見つかりません' }, { status: 404 });
    }

    return NextResponse.json({ success: true, menu: updated });
  } catch (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json({ success: false, error: 'メニューの更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = deleteMenu(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'メニューが見つかりません' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: '削除しました' });
  } catch (error) {
    console.error('Error deleting menu:', error);
    return NextResponse.json({ success: false, error: 'メニューの削除に失敗しました' }, { status: 500 });
  }
}
