import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/jwt';
import { MaterialManager } from '@/storage/database/materialManager';

// POST /api/materials/[id]/toggle-favorite - 切换收藏状态
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const materialManager = new MaterialManager();
    const existingMaterial = await materialManager.getMaterialById(id);

    if (!existingMaterial) {
      return NextResponse.json({ success: false, error: '素材不存在' }, { status: 404 });
    }

    // 检查权限
    if (existingMaterial.userId !== user.userId) {
      return NextResponse.json({ success: false, error: '无权操作' }, { status: 403 });
    }

    const material = await materialManager.toggleFavorite(id);

    return NextResponse.json({
      success: true,
      data: material,
    });
  } catch (error) {
    console.error('切换收藏失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '切换收藏失败' },
      { status: 500 }
    );
  }
}
