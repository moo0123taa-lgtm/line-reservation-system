import { NextResponse } from 'next/server';
import { getStoreSettings, updateStoreSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = getStoreSettings();
    // セキュリティのため、シークレットはマスクまたはそのまま（管理画面用）
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: '設定の取得に失敗しました' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = updateStoreSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, error: '設定の更新に失敗しました' }, { status: 500 });
  }
}
