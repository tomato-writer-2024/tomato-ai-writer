#!/usr/bin/env npx tsx
/**
 * 数据库迁移脚本（带.env.local支持）
 *
 * 使用方法：
 * npx tsx scripts/migrate-with-env.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../src/lib/db.js';

// 强制加载.env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 执行SQL迁移文件
 */
async function runMigration(sqlFile: string): Promise<void> {
  const pool = getPool();
  const filePath = path.join(__dirname, '../src/migrations', sqlFile);

  if (!pool) {
    throw new Error('数据库连接池未创建');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`迁移文件不存在: ${filePath}`);
  }

  const sql = fs.readFileSync(filePath, 'utf-8');

  console.log(`执行迁移文件: ${sqlFile}`);
  console.log('-'.repeat(80));

  try {
    await pool.query(sql);
    console.log(`✅ 迁移文件 ${sqlFile} 执行成功`);
  } catch (error) {
    console.error(`❌ 迁移文件 ${sqlFile} 执行失败:`, error);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(80));
  console.log('数据库迁移工具（Neon）');
  console.log('='.repeat(80));
  console.log();

  try {
    // 显示环境变量信息
    console.log('环境变量信息:');
    console.log(`  DATABASE_URL已配置: ${!!process.env.DATABASE_URL}`);
    console.log(`  DATABASE_MOCK_MODE: ${process.env.DATABASE_MOCK_MODE}`);
    console.log();

    // 测试数据库连接
    console.log('步骤 1: 测试数据库连接...');
    const pool = getPool();

    if (!pool) {
      throw new Error('数据库连接池未创建，请检查数据库配置');
    }

    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ 数据库连接成功');
    console.log();

    // 检查现有表
    console.log('步骤 2: 检查现有数据库表...');
    const existingTables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const tableNames = existingTables.rows.map(row => row.table_name);
    console.log(`现有表: ${tableNames.join(', ') || '无'}`);
    console.log();

    // 执行迁移
    console.log('步骤 3: 执行数据库迁移...');
    const migrationFiles = ['add_missing_fields.sql'];

    for (const file of migrationFiles) {
      await runMigration(file);
      console.log();
    }

    // 验证迁移结果
    console.log('步骤 4: 验证迁移结果...');
    const tablesAfter = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const tablesAfterList = tablesAfter.rows.map(row => row.table_name);
    console.log(`迁移后表列表: ${tablesAfterList.join(', ')}`);
    console.log();

    // 预期表列表
    const expectedTables = [
      'users',
      'novels',
      'chapters',
      'content_stats',
      'api_keys',
      'membership_orders',
      'security_logs',
      'sub_accounts',
      'usage_logs',
      'works',
    ];

    const missingTables = expectedTables.filter(
      table => !tablesAfterList.includes(table)
    );

    if (missingTables.length > 0) {
      console.warn(`⚠️  以下表未创建: ${missingTables.join(', ')}`);
      console.warn('这些表可能需要通过Drizzle ORM或手动SQL创建');
    } else {
      console.log('✅ 所有预期表都已创建');
    }

    console.log();
    console.log('='.repeat(80));
    console.log('✅ 数据库迁移完成!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error();
    console.error('❌ 数据库迁移失败:', error);
    console.error();
    console.error('请检查:');
    console.error('1. 数据库连接配置是否正确');
    console.error('2. 数据库用户是否有创建表的权限');
    console.error('3. 数据库服务是否正常运行');
    console.error('4. 网络连接是否正常');
    console.error('5. 迁移文件语法是否正确');
    process.exit(1);
  }
}

// 执行主函数
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('未捕获的错误:', error);
    process.exit(1);
  });
