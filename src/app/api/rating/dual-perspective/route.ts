import { NextRequest, NextResponse } from 'next/server';
import { dualPerspectiveRatingSystem } from '@/lib/dualPerspectiveRating';

// POST /api/rating/dual-perspective - 双视角评分
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, metadata } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: '缺少内容' },
        { status: 400 }
      );
    }

    // 执行双视角评分
    const rating = dualPerspectiveRatingSystem.rateDualPerspective(
      content,
      metadata || {}
    );

    return NextResponse.json({
      success: true,
      data: rating,
    });
  } catch (error) {
    console.error('双视角评分失败:', error);
    return NextResponse.json(
      { success: false, error: '双视角评分失败' },
      { status: 500 }
    );
  }
}
