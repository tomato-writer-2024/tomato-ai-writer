import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/jwt';
import { MaterialManager } from '@/storage/database/materialManager';
import type { InsertMaterial } from '@/storage/database/shared/schema';

// GET /api/materials - 获取素材列表
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const novelId = searchParams.get('novelId') || undefined;
    const isFavorite = searchParams.get('isFavorite') === 'true' ? true : searchParams.get('isFavorite') === 'false' ? false : undefined;
    const searchQuery = searchParams.get('q') || undefined;
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');

    const materialManager = new MaterialManager();

    const materials = await materialManager.getMaterials({
      skip,
      limit,
      filters: {
        userId: user.userId,
        category: category as any,
        novelId: novelId as any,
        isFavorite,
      },
      searchQuery,
    });

    return NextResponse.json({
      success: true,
      data: materials,
    });
  } catch (error) {
    console.error('获取素材列表失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取素材列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/materials - 创建素材
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const body = await request.json();

    const materialData: InsertMaterial = {
      userId: user.userId,
      title: body.title,
      content: body.content,
      category: body.category || 'general',
      tags: body.tags || [],
      notes: body.notes || '',
      novelId: body.novelId || null,
    };

    const materialManager = new MaterialManager();
    const material = await materialManager.createMaterial(materialData);

    return NextResponse.json({
      success: true,
      data: material,
    });
  } catch (error) {
    console.error('创建素材失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '创建素材失败' },
      { status: 500 }
    );
  }
}
