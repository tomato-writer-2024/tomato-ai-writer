import { NextRequest, NextResponse } from 'next/server';

/**
 * 诊断API
 * 用于检查Vercel部署的所有配置和连接状态
 */
export async function GET(request: NextRequest) {
  const diagnosticInfo: any = {
    timestamp: new Date().toISOString(),
    environment: {},
    configuration: {},
    checks: {},
  };

  try {
    // 1. 环境变量检查
    diagnosticInfo.environment = {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL,
      databaseUrl: process.env.DATABASE_URL ? '已配置（部分隐藏）' : '未配置',
      jwtSecret: process.env.JWT_SECRET ? '已配置（隐藏）' : '未配置',
      doubaoApiKey: process.env.DOUBAO_API_KEY ? '已配置（隐藏）' : '未配置',
    };

    diagnosticInfo.configuration = {
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '未配置',
      appName: process.env.NEXT_PUBLIC_APP_NAME || '未配置',
    };

    // 2. 数据库连接测试
    diagnosticInfo.checks.database = {
      status: '未测试',
      error: null,
      details: null,
    };

    try {
      const { getDb } = await import('coze-coding-dev-sdk');
      const db = await getDb();

      // 测试数据库连接
      const connectionTest = await db.execute('SELECT 1 as test');
      diagnosticInfo.checks.database = {
        status: '连接成功',
        details: {
          queryResult: connectionTest.rows[0],
          connectionTest: 'PASS',
        },
      };

      // 检查users表是否存在
      const tableTest = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'users'
        )
      `);
      diagnosticInfo.checks.database.tables = {
        users: tableTest.rows[0].exists ? '存在' : '不存在',
      };

      // 检查指定用户
      const email = '208343256@qq.com';
      const escapedEmail = email.replace(/'/g, "''");
      const userTest = await db.execute(`
        SELECT id, email, username, role, is_super_admin, is_active, is_banned
        FROM users WHERE email = '${escapedEmail}'
      `);
      diagnosticInfo.checks.database.adminUser = userTest.rows.length > 0 ? {
        status: '存在',
        data: {
          id: userTest.rows[0].id,
          email: userTest.rows[0].email,
          username: userTest.rows[0].username,
          role: userTest.rows[0].role,
          is_super_admin: userTest.rows[0].is_super_admin,
          is_active: userTest.rows[0].is_active,
          is_banned: userTest.rows[0].is_banned,
        }
      } : { status: '不存在' };

    } catch (error: any) {
      diagnosticInfo.checks.database = {
        status: '连接失败',
        error: error.message,
        stack: error.stack,
      };
    }

    // 3. JWT配置检查
    diagnosticInfo.checks.jwt = {
      status: process.env.JWT_SECRET ? '已配置' : '未配置',
      length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      valid: process.env.JWT_SECRET ? (process.env.JWT_SECRET.length >= 32 ? '有效' : '过短，建议至少32位') : '无效',
    };

    // 4. API端点测试
    diagnosticInfo.checks.apiEndpoints = {
      login: '/api/auth/login',
      userStats: '/api/user/stats',
      databaseStructure: '/api/debug/database-structure',
    };

    return NextResponse.json({
      success: true,
      data: diagnosticInfo,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
