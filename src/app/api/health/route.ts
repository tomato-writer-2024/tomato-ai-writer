import { NextResponse } from 'next/server';
import { testConnection, isMockMode, getDatabaseStatus } from '@/lib/db';

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

    // 检查数据库连接（使用增强的连接测试）
    const dbStart = Date.now();
    const dbTestResult = await testConnection();
    const dbConnectionTime = Date.now() - dbStart;

    const dbStatus = dbTestResult.success ? 'ok' : 'error';
    const dbMode = dbTestResult.mode;

    // 获取详细的数据库状态
    const dbStatusInfo = getDatabaseStatus();

    console.log(`[${requestId}] 数据库状态:`, {
      success: dbTestResult.success,
      mode: dbMode,
      responseTime: `${dbConnectionTime}ms`,
      error: dbTestResult.error,
    });

    // 在自动降级模式下，添加警告信息
    if (dbStatusInfo.autoFallback) {
      console.warn(`[${requestId}] ⚠️  当前使用自动降级模式，真实数据库不可用`);
      console.warn(`[${requestId}] ⚠️  上次错误: ${dbStatusInfo.lastError}`);
    }

    const responseTime = Date.now() - startTime;

    // 判断整体状态
    // - 数据库模式为 mock/auto-mock：只要环境变量正确，系统就是健康的
    // - 数据库模式为 real：连接成功才算健康
    const isDbHealthy = dbMode === 'mock' || dbMode === 'auto-mock' || dbTestResult.success;
    const status = (missingEnvVars.length === 0 && isDbHealthy) ? 'healthy' : 'unhealthy';

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
            status: isDbHealthy ? 'ok' : 'error',
            message: isDbHealthy
              ? (dbMode === 'mock'
                ? 'Mock模式已启用'
                : dbMode === 'auto-mock'
                ? `自动降级模式：真实数据库不可用（${dbTestResult.error}），使用Mock模式`
                : '数据库连接正常')
              : `数据库连接失败: ${dbTestResult.error}`,
            connectionTime: `${dbConnectionTime}ms`,
            mode: dbMode,
            details: dbStatusInfo,
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
