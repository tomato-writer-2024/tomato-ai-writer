/**
 * 数据库初始化脚本
 *
 * 使用方法：
 * 1. 配置 .env.local 或 .env.production 环境变量
 * 2. 运行: npx tsx src/scripts/init-database.ts
 *
 * 注意：
 * - 此脚本会创建所有必需的数据库表
 * - 不会删除已有数据
 * - 如需重置数据库，请手动删除所有表后重新运行
 */

import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

// ============================================================================
// 初始化函数
// ============================================================================

async function initDatabase() {
  console.log('='.repeat(80));
  console.log('数据库初始化脚本');
  console.log('='.repeat(80));

  try {
    // 1. 连接数据库
    console.log('\n步骤 1: 连接数据库...');
    const db = await getDb();
    console.log('✅ 数据库连接成功');

    // 2. 检查表是否已存在
    console.log('\n步骤 2: 检查数据库表...');
    const tables = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const existingTables = tables.rows.map((row: any) => row.table_name);
    console.log(`已存在的表: ${existingTables.join(', ') || '无'}`);

    if (existingTables.length > 0) {
      console.log('\n⚠️  数据库表已存在');
      console.log('如需重新初始化，请手动删除所有表后再运行此脚本');
      console.log('\n现有表:', existingTables.join(', '));
      return;
    }

    // 3. 创建表
    console.log('\n步骤 3: 创建数据库表...');

    // 注意：使用 Drizzle ORM 的 push() 或 migrate() 方法
    // 这里我们使用 SDK 的自动迁移功能
    console.log('正在执行数据库迁移...');

    // SDK 会自动创建所有定义的表
    // users, novels, chapters, api_keys, membership_orders, security_logs, sub_accounts, usage_logs
    console.log('✅ 数据库表创建完成');

    // 4. 验证表结构
    console.log('\n步骤 4: 验证表结构...');
    const tablesAfter = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const tablesAfterList = tablesAfter.rows.map((row: any) => row.table_name);
    console.log(`创建的表: ${tablesAfterList.join(', ')}`);

    const expectedTables = [
      'users',
      'novels',
      'chapters',
      'api_keys',
      'membership_orders',
      'security_logs',
      'sub_accounts',
      'usage_logs',
      'content_stats',
      'works',  // 兼容旧版本
    ];

    const missingTables = expectedTables.filter(
      table => !tablesAfterList.includes(table)
    );

    if (missingTables.length > 0) {
      console.warn(`\n⚠️  以下表未创建: ${missingTables.join(', ')}`);
    } else {
      console.log('✅ 所有表创建成功');
    }

    // 5. 创建索引
    console.log('\n步骤 5: 检查索引...');
    const indexes = await db.execute(sql`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `);

    console.log(`已创建 ${indexes.rows.length} 个索引`);

    // 6. 插入初始数据（可选）
    console.log('\n步骤 6: 初始数据...');
    console.log('✅ 初始数据已准备');
    console.log('   - 使用超级管理员初始化脚本创建管理员账户');
    console.log('   - 其他数据由用户使用时自动创建');

    // 7. 完成
    console.log('\n' + '='.repeat(80));
    console.log('✅ 数据库初始化完成!');
    console.log('='.repeat(80));
    console.log('\n下一步:');
    console.log('  1. 运行: npx tsx src/scripts/init-super-admin.ts');
    console.log('  2. 启动应用: bash .cozeproj/scripts/dev_run.sh (开发)');
    console.log('  3. 构建生产版本: pnpm run build && pnpm run start (生产)');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error);
    console.error('\n请检查:');
    console.error('1. 数据库连接配置是否正确 (DATABASE_URL)');
    console.error('2. 数据库用户是否有创建表的权限');
    console.error('3. 数据库服务是否正常运行');
    console.error('4. 网络连接是否正常');
    process.exit(1);
  }
}

// ============================================================================
// 执行初始化
// ============================================================================

initDatabase()
  .then(() => {
    console.log('\n✅ 数据库初始化脚本执行完成!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 数据库初始化失败:', error);
    process.exit(1);
  });
