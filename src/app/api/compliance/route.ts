import { NextRequest, NextResponse } from 'next/server';
import { performComplianceCheck } from '@/lib/compliance/complianceChecker';

// POST /api/compliance/check - 执行合规检查
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
      case 'check':
        return handleCheck(params);
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

async function handleCheck(params: any) {
  try {
    const { content, genre, existingWorks } = params;

    if (!content) {
      return NextResponse.json(
        { success: false, error: '缺少内容' },
        { status: 400 }
      );
    }

    const result = await performComplianceCheck(
      content,
      genre,
      existingWorks
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('合规检查失败:', error);
    return NextResponse.json(
      { success: false, error: '合规检查失败' },
      { status: 500 }
    );
  }
}
