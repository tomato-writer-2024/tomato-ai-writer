/**
 * 数据库迁移脚本执行器
 * 运行指定的SQL迁移文件
 */

import { getDb } from 'coze-coding-dev-sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

/**
 * 执行迁移文件
 */
async function runMigration(migrationFile: string) {
  try {
    console.log(`[迁移] 开始执行迁移: ${migrationFile}`);

    // 读取迁移SQL文件
    const migrationPath = join(__dirname, 'migrations', migrationFile);
    const sql = readFileSync(migrationPath, 'utf-8');

    // 执行迁移
    const db = await getDb();

    // 分割SQL语句（按分号分割）
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement) {
        console.log(`[迁移] 执行: ${statement.substring(0, 100)}...`);
        await db.execute(statement);
      }
    }

    console.log(`[迁移] ✅ 迁移执行成功: ${migrationFile}`);
  } catch (error) {
    console.error(`[迁移] ❌ 迁移执行失败: ${migrationFile}`);
    console.error(error);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  const migrationFile = process.argv[2];

  if (!migrationFile) {
    console.error('用法: tsx src/scripts/run-migration.ts <migration-file>');
    console.error('示例: tsx src/scripts/run-migration.ts add-notes-to-orders.sql');
    process.exit(1);
  }

  try {
    await runMigration(migrationFile);
    console.log('\n✅ 所有迁移执行成功！');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 迁移执行失败！');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
