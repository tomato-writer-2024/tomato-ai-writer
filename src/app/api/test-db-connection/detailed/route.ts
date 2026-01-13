import { NextResponse } from 'next/server';
import { testDatabaseConnection } from '../detailed-test';

/**
 * 详细的数据库连接测试API
 */
export async function GET(request: Request) {
  try {
    const results = await testDatabaseConnection();

    return NextResponse.json({
      success: results.some((r: any) => r.success),
      results,
      connectionString: process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':***@'),
    });
  } catch (error: any) {
    console.error('详细测试失败:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
