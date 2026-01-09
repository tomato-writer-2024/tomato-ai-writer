import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/jwt';
import { MaterialManager } from '@/storage/database/materialManager';

// GET /api/materials/stats - 获取素材统计
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const materialManager = new MaterialManager();
    const stats = await materialManager.getUserMaterialStats(user.userId);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('获取素材统计失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取素材统计失败' },
      { status: 500 }
    );
  }
}
