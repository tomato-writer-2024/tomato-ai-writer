import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/jwt';
import { MaterialManager } from '@/storage/database/materialManager';
import type { UpdateMaterial } from '@/storage/database/shared/schema';

// GET /api/materials/[id] - 获取单个素材
export async function GET(
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
    const material = await materialManager.getMaterialById(id);

    if (!material) {
      return NextResponse.json({ success: false, error: '素材不存在' }, { status: 404 });
    }

    // 检查权限
    if (material.userId !== user.userId) {
      return NextResponse.json({ success: false, error: '无权访问' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: material,
    });
  } catch (error) {
    console.error('获取素材失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取素材失败' },
      { status: 500 }
    );
  }
}

// PATCH /api/materials/[id] - 更新素材
export async function PATCH(
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

    const body = await request.json();

    const materialManager = new MaterialManager();
    const existingMaterial = await materialManager.getMaterialById(id);

    if (!existingMaterial) {
      return NextResponse.json({ success: false, error: '素材不存在' }, { status: 404 });
    }

    // 检查权限
    if (existingMaterial.userId !== user.userId) {
      return NextResponse.json({ success: false, error: '无权修改' }, { status: 403 });
    }

    const updateData: UpdateMaterial = {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.novelId !== undefined && { novelId: body.novelId }),
      ...(body.isFavorite !== undefined && { isFavorite: body.isFavorite }),
    };

    const material = await materialManager.updateMaterial(id, updateData);

    return NextResponse.json({
      success: true,
      data: material,
    });
  } catch (error) {
    console.error('更新素材失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '更新素材失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/materials/[id] - 删除素材
export async function DELETE(
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
      return NextResponse.json({ success: false, error: '无权删除' }, { status: 403 });
    }

    await materialManager.deleteMaterial(id);

    return NextResponse.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error('删除素材失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '删除素材失败' },
      { status: 500 }
    );
  }
}
