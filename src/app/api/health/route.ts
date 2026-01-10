import { NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

export async function GET() {
  try {
    const db = await getDb();

    // 使用原生SQL查询以避免Drizzle ORM问题
    const result = await db.execute('SELECT 1 as health_check');

    return NextResponse.json({
      success: true,
      message: 'API is healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
