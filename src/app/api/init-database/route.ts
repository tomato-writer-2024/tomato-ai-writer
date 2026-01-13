import { NextResponse } from 'next/server';
import { getDb } from '@/storage/database';
import { sql } from 'drizzle-orm';

/**
 * 数据库初始化API
 * 用于在Vercel等生产环境中检查数据库表结构
 *
 * 使用方法：
 * GET /api/init-database
 *
 * 注意：
 * - 此API只检查表是否存在，不执行迁移
 * - 迁移需要通过本地命令执行：npm run migrate
 * - 或使用Drizzle Studio进行数据库管理
 */
export async function GET(request: Request) {
  console.log('===== 数据库初始化检查开始 =====');

  try {
    // 获取数据库连接
    const db = await getDb();

    // 检查是否已有表
    const checkTables = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);

    const existingTables = checkTables.rows.map(row => (row as any).table_name);
    console.log('现有表:', existingTables);

    // 定义必需的表
    const requiredTables = [
      'users',
      'novels',
      'chapters',
      'security_logs',
      'usage_logs',
      'materials',
      'api_keys',
      'membership_orders',
      'content_versions',
    ];

    // 检查缺少的表
    const missingTables = requiredTables.filter(
      table => !existingTables.includes(table)
    );

    console.log('缺少的表:', missingTables);

    // 返回检查结果
    if (missingTables.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: '数据库表结构完整',
          data: {
            existingTables,
            requiredTables,
            missingTables: [],
            totalTables: existingTables.length,
            isInitialized: true,
          },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: true,
          message: '数据库需要初始化',
          data: {
            existingTables,
            requiredTables,
            missingTables,
            totalTables: existingTables.length,
            isInitialized: false,
            instructions: [
              '请执行以下命令初始化数据库：',
              '  npm run migrate',
              '',
              '或在本地运行：',
              '  npx drizzle-kit push',
            ],
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('数据库初始化检查失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: '数据库检查失败',
        details: error instanceof Error ? error.message : String(error),
        instructions: [
          '请检查数据库连接配置：',
          '  1. 确认DATABASE_URL环境变量已配置',
          '  2. 确认数据库服务可访问',
          '  3. 确认数据库用户权限正确',
        ],
      },
      { status: 500 }
    );
  }
}
