import { NextResponse } from 'next/server';
import { getDb } from '@/storage/database';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

/**
 * 数据库初始化API
 * 用于在Vercel等生产环境中自动初始化数据库表结构
 *
 * 使用方法：
 * GET /api/init-database
 *
 * 注意：此API只能初始化表结构，不会删除或修改已有数据
 */
export async function GET(request: Request) {
  console.log('===== 数据库初始化请求开始 =====');

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

    // 执行数据库迁移
    console.log('开始执行数据库迁移...');
    const client = postgres(process.env.DATABASE_URL!);
    await migrate(client, { migrationsFolder: './drizzle' });
    await client.end();

    console.log('数据库迁移完成');

    // 验证表是否创建成功
    const verifyTables = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);

    const newTables = verifyTables.rows
      .map(row => (row as any).table_name)
      .filter((table: string) => !existingTables.includes(table));

    console.log('新创建的表:', newTables);

    return NextResponse.json(
      {
        success: true,
        message: '数据库初始化成功',
        data: {
          existingTables,
          newTables,
          totalTables: verifyTables.rows.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('数据库初始化失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: '数据库初始化失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
