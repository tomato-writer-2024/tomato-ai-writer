import { NextResponse } from 'next/server';
import { getDb } from '@/storage/database';

/**
 * 健康检查API
 * 用于监控服务状态和数据库连接
 *
 * 使用方法：
 * GET /api/health
 */
export async function GET(request: Request) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    console.log(`[${requestId}] ===== 健康检查开始 =====`);

    // 检查环境变量
    const envChecks = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      JWT_REFRESH_SECRET: !!process.env.JWT_REFRESH_SECRET,
      DOUBAO_API_KEY: !!process.env.DOUBAO_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    };

    const missingEnvVars = Object.entries(envChecks)
      .filter(([key, value]) => !value && key !== 'EMAIL_HOST' && key !== 'EMAIL_USER' && key !== 'EMAIL_PASS')
      .map(([key]) => key);

    // 检查数据库连接
    let dbStatus = 'ok';
    let dbError = null;
    let dbConnectionTime = 0;

    try {
      const dbStart = Date.now();
      const db = await getDb();
      const result = await db.execute(`SELECT NOW() as current_time`);
      dbConnectionTime = Date.now() - dbStart;
      console.log(`[${requestId}] 数据库连接成功，响应时间: ${dbConnectionTime}ms`);
    } catch (error) {
      dbStatus = 'error';
      dbError = error instanceof Error ? error.message : String(error);
      console.error(`[${requestId}] 数据库连接失败:`, dbError);
    }

    const responseTime = Date.now() - startTime;

    // 判断整体状态
    const status = (missingEnvVars.length === 0 && dbStatus === 'ok') ? 'healthy' : 'unhealthy';

    return NextResponse.json(
      {
        status,
        requestId,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        checks: {
          environment: {
            status: missingEnvVars.length === 0 ? 'ok' : 'error',
            message: missingEnvVars.length === 0
              ? '所有必需的环境变量已配置'
              : `缺少环境变量: ${missingEnvVars.join(', ')}`,
            details: envChecks,
          },
          database: {
            status: dbStatus,
            message: dbStatus === 'ok' ? '数据库连接正常' : `数据库连接失败: ${dbError}`,
            connectionTime: `${dbConnectionTime}ms`,
          },
        },
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          uptime: `${Math.floor(process.uptime())}s`,
          memory: {
            used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
          },
        },
      },
      { status: status === 'healthy' ? 200 : 503 }
    );
  } catch (error) {
    console.error('健康检查失败:', error);

    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
