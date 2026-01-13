import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 检查数据库连接
    const pgUrl = process.env.PGDATABASE_URL;
    const isDbConfigured = !!pgUrl;

    // 检查其他环境变量
    const envStatus = {
      database: isDbConfigured ? 'configured' : 'not_configured',
      node_env: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      status: 'ok',
      message: '服务运行正常',
      environment: envStatus,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : '未知错误',
    }, { status: 500 });
  }
}
