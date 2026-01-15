import { NextRequest, NextResponse } from 'next/server';
import { getPool, isMockMode } from '@/lib/db';

/**
 * 测试数据库连接
 */
export async function GET(request: NextRequest) {
  try {
    const mockMode = isMockMode();
    const pool = getPool();

    return NextResponse.json({
      success: true,
      data: {
        isMockMode: mockMode,
        poolExists: !!pool,
        databaseUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'not set',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '测试失败',
      },
      { status: 500 }
    );
  }
}
