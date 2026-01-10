import { NextRequest, NextResponse } from 'next/server';
import { GENERATORS, getGeneratorsByCategory, getGeneratorById, searchGenerators, getGeneratorCategories, getGeneratorStats } from '@/lib/generators/generatorRegistry';

// GET /api/generators - 获取生成器列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isPro = searchParams.get('isPro');

    if (category) {
      const generators = getGeneratorsByCategory(category as any);
      return NextResponse.json({ success: true, data: generators });
    }

    if (search) {
      const generators = searchGenerators(search);
      return NextResponse.json({ success: true, data: generators });
    }

    if (isPro) {
      const proGenerators = GENERATORS.filter(g => g.isPro);
      return NextResponse.json({ success: true, data: proGenerators });
    }

    return NextResponse.json({ success: true, data: GENERATORS });
  } catch (error) {
    console.error('获取生成器列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取生成器列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/generators - 生成器操作
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: '缺少action参数' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'get':
        return handleGet(params);
      case 'categories':
        return handleCategories();
      case 'stats':
        return handleStats();
      default:
        return NextResponse.json(
          { success: false, error: '未知的action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

async function handleGet(params: any) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少生成器ID' },
        { status: 400 }
      );
    }

    const generator = getGeneratorById(id);
    if (!generator) {
      return NextResponse.json(
        { success: false, error: '生成器不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: generator });
  } catch (error) {
    console.error('获取生成器失败:', error);
    return NextResponse.json(
      { success: false, error: '获取生成器失败' },
      { status: 500 }
    );
  }
}

async function handleCategories() {
  try {
    const categories = getGeneratorCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json(
      { success: false, error: '获取分类失败' },
      { status: 500 }
    );
  }
}

async function handleStats() {
  try {
    const stats = getGeneratorStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    return NextResponse.json(
      { success: false, error: '获取统计信息失败' },
      { status: 500 }
    );
  }
}
