import { NextResponse } from 'next/server';
import { getPool, testConnection, isMockMode } from '@/lib/db';

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

    // 检查是否启用Mock模式
    const mockMode = isMockMode();
    console.log(`[${requestId}] Mock模式: ${mockMode}`);

    // 检查环境变量
    const envChecks = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DATABASE_MOCK_MODE: mockMode,
      JWT_SECRET: !!process.env.JWT_SECRET,
      JWT_REFRESH_SECRET: !!process.env.JWT_REFRESH_SECRET,
      // DOUBAO_API_KEY 可选（集成服务会自动配置）
      DOUBAO_API_KEY: !!process.env.DOUBAO_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    };

    const missingEnvVars = Object.entries(envChecks)
      .filter(([key, value]) => {
        // 排除可选的环境变量
        if (key === 'DOUBAO_API_KEY') return false;
        if (key === 'DATABASE_URL' && mockMode) return false; // Mock模式下DATABASE_URL可选
        if (key === 'DATABASE_MOCK_MODE') return false;
        if (key === 'EMAIL_HOST' || key === 'EMAIL_USER' || key === 'EMAIL_PASS') return false;
        return !value;
      })
      .map(([key]) => key);

    // 检查数据库连接（使用原生 pg 连接）
    let dbStatus = 'ok';
    let dbError = null;
    let dbConnectionTime = 0;

    try {
      const dbStart = Date.now();
      const isConnected = await testConnection();
      dbConnectionTime = Date.now() - dbStart;

      if (isConnected) {
        console.log(`[${requestId}] 数据库连接成功，响应时间: ${dbConnectionTime}ms`);
      } else {
        throw new Error('数据库连接测试失败');
      }
    } catch (error) {
      dbStatus = 'error';
      dbError = error instanceof Error ? error.message : String(error);
      console.error(`[${requestId}] 数据库连接失败:`, dbError);
    }

    const responseTime = Date.now() - startTime;

    // 判断整体状态（Mock模式下只要环境变量配置正确就是healthy）
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
            message: dbStatus === 'ok'
              ? (mockMode ? 'Mock模式已启用' : '数据库连接正常')
              : `数据库连接失败: ${dbError}`,
            connectionTime: `${dbConnectionTime}ms`,
            mode: mockMode ? 'mock' : 'real',
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
