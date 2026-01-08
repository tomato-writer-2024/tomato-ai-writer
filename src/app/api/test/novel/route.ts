import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { novelManager } from '@/storage/database';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await extractUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const novel = await novelManager.createNovel({
      userId: user.id,
      title: '测试小说',
      description: '这是一本测试小说',
      genre: '都市',
      status: '连载中',
      type: '热血',
      isPublished: false,
    });

    return NextResponse.json({
      success: true,
      data: novel,
    });
  } catch (error) {
    console.error('创建小说测试失败:', error);
    return NextResponse.json({
      error: '创建小说测试失败',
      details: String(error),
    }, { status: 500 });
  }
}
