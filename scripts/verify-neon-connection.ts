/**
 * Neon 数据库连接验证脚本
 *
 * 使用方法：
 * npx tsx scripts/verify-neon-connection.ts
 *
 * 功能：
 * 1. 验证环境变量配置
 * 2. 测试数据库连接
 * 3. 检查表结构
 * 4. 提供修复建议
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title: string) {
  log('\n' + '='.repeat(80), 'blue');
  log(title, 'blue');
  log('='.repeat(80), 'blue');
}

async function main() {
  header('Neon 数据库连接验证工具');

  // 步骤 1: 验证环境变量
  log('\n步骤 1: 验证环境变量配置', 'blue');
  log('-'.repeat(80));

  const checks = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    DATABASE_MOCK_MODE: process.env.DATABASE_MOCK_MODE,
    NODE_ENV: process.env.NODE_ENV,
  };

  let hasErrors = false;

  for (const [key, value] of Object.entries(checks)) {
    if (value === false || value === undefined) {
      log(`❌ ${key}: 未配置`, 'red');
      hasErrors = true;
    } else {
      if (key === 'DATABASE_MOCK_MODE') {
        const isMock = value === 'true' || value === '1';
        log(`${isMock ? '⚠️' : '✅'} ${key}: ${value} (${isMock ? 'Mock模式' : '真实数据库'})`, isMock ? 'yellow' : 'green');
      } else {
        log(`✅ ${key}: ${value}`, 'green');
      }
    }
  }

  if (hasErrors) {
    log('\n❌ 环境变量配置不完整，请检查 .env.local 文件', 'red');
    process.exit(1);
  }

  // 检查是否为Mock模式
  if (process.env.DATABASE_MOCK_MODE === 'true' || process.env.DATABASE_MOCK_MODE === '1') {
    log('\n⚠️  当前为Mock模式，不会连接真实数据库', 'yellow');
    log('如需验证Neon连接，请设置 DATABASE_MOCK_MODE=false', 'yellow');
    process.exit(0);
  }

  // 步骤 2: 验证数据库连接字符串
  log('\n步骤 2: 验证数据库连接字符串', 'blue');
  log('-'.repeat(80));

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    log('❌ DATABASE_URL 未设置', 'red');
    process.exit(1);
  }

  // 检查是否包含必需参数
  const hasHost = dbUrl.includes('@');
  const hasPort = /:\d+\//.test(dbUrl);
  const hasDbName = /\/[^\?]+/.test(dbUrl);
  const hasSsl = dbUrl.includes('sslmode=');

  log(`Host: ${hasHost ? '✅' : '❌'} ${hasHost ? '已配置' : '未配置'}`, hasHost ? 'green' : 'red');
  log(`Port: ${hasPort ? '✅' : '❌'} ${hasPort ? '已配置' : '未配置'}`, hasPort ? 'green' : 'red');
  log(`Database: ${hasDbName ? '✅' : '❌'} ${hasDbName ? '已配置' : '未配置'}`, hasDbName ? 'green' : 'red');
  log(`SSL: ${hasSsl ? '✅' : '⚠️'}  ${hasSsl ? '已配置' : '未配置（推荐启用）'}`, hasSsl ? 'green' : 'yellow');

  // 检查是否为Neon
  const isNeon = dbUrl.includes('neon.tech');
  if (isNeon) {
    log(`✅ 检测到 Neon 数据库`, 'green');
  } else {
    log(`⚠️  未检测到 Neon 数据库，当前使用: ${dbUrl.split('@')[1].split('/')[0]}`, 'yellow');
  }

  // 步骤 3: 测试数据库连接
  log('\n步骤 3: 测试数据库连接', 'blue');
  log('-'.repeat(80));

  let pool: Pool | null = null;

  try {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 10000,
    });

    log('正在连接数据库...', 'yellow');

    const startTime = Date.now();
    const client = await pool.connect();
    const connectTime = Date.now() - startTime;

    log(`✅ 数据库连接成功 (耗时: ${connectTime}ms)`, 'green');

    // 测试查询
    const result = await client.query('SELECT version()');
    const version = result.rows[0].version;

    log(`\nPostgreSQL 版本: ${version}`, 'blue');

    client.release();

    // 步骤 4: 检查表结构
    log('\n步骤 4: 检查数据库表结构', 'blue');
    log('-'.repeat(80));

    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const tables = tablesResult.rows.map((row) => row.table_name);

    if (tables.length === 0) {
      log('⚠️  数据库中没有任何表', 'yellow');
      log('提示: 运行 `npm run migrate` 创建表结构', 'yellow');
    } else {
      log(`找到 ${tables.length} 个表:`, 'green');
      tables.forEach((table) => {
        log(`  - ${table}`, 'green');
      });
    }

    // 检查预期的表
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

    const missingTables = expectedTables.filter((table) => !tables.includes(table));

    if (missingTables.length > 0) {
      log(`\n⚠️  缺少 ${missingTables.length} 个表: ${missingTables.join(', ')}`, 'yellow');
      log('提示: 运行 `npm run migrate` 创建缺失的表', 'yellow');
    } else {
      log(`\n✅ 所有预期表都已创建`, 'green');
    }

    // 步骤 5: 测试基本操作
    if (tables.includes('users')) {
      log('\n步骤 5: 测试数据库基本操作', 'blue');
      log('-'.repeat(80));

      // 测试查询
      const userCountResult = await pool.query('SELECT COUNT(*) as count FROM users');
      const userCount = parseInt(userCountResult.rows[0].count);
      log(`✅ 查询成功: 当前有 ${userCount} 个用户`, 'green');

      // 测试写入（如果用户表为空）
      if (userCount === 0) {
        log('\n提示: 数据库为空，建议创建超级管理员账号', 'yellow');
        log('运行以下命令创建超级管理员:', 'yellow');
        log(`curl -X POST http://localhost:5000/api/auth/register \\`, 'blue');
        log(`  -H "Content-Type: application/json" \\`, 'blue');
        log(`  -d '{"email":"admin@tomatowriter.com","password":"YourStrongPassword123!","username":"超级管理员"}'`, 'blue');
      }
    }

    // 步骤 6: 性能测试
    log('\n步骤 6: 数据库性能测试', 'blue');
    log('-'.repeat(80));

    const testQueries = [
      'SELECT 1',
      'SELECT NOW()',
      'SELECT version()',
      'SELECT COUNT(*) FROM information_schema.tables',
    ];

    const times: number[] = [];

    for (const query of testQueries) {
      const startTime = Date.now();
      await pool.query(query);
      const duration = Date.now() - startTime;
      times.push(duration);
      log(`查询: ${query.padEnd(60)} 耗时: ${duration}ms`, duration < 100 ? 'green' : 'yellow');
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    log(`\n平均响应时间: ${avgTime.toFixed(2)}ms`, avgTime < 100 ? 'green' : 'yellow');

    // 最终总结
    header('✅ 验证完成');
    log('\n数据库配置正常，可以开始使用！', 'green');
    log(`数据库: ${isNeon ? 'Neon PostgreSQL' : '其他数据库'}`, 'green');
    log(`表数量: ${tables.length}`, 'green');
    log(`平均响应时间: ${avgTime.toFixed(2)}ms`, 'green');

    if (missingTables.length > 0) {
      log('\n下一步:', 'yellow');
      log('1. 运行 `npm run migrate` 创建表结构', 'yellow');
      log('2. 创建超级管理员账号', 'yellow');
      log('3. 测试应用功能', 'yellow');
    }

  } catch (error: any) {
    log('\n❌ 数据库连接失败', 'red');
    log(`错误信息: ${error.message}`, 'red');

    if (error.code === 'ECONNREFUSED') {
      log('\n可能的原因:', 'yellow');
      log('1. 数据库地址或端口不正确', 'yellow');
      log('2. 数据库服务未启动', 'yellow');
      log('3. 网络连接问题', 'yellow');
    } else if (error.code === 'ENOTFOUND') {
      log('\n可能的原因:', 'yellow');
      log('1. 数据库主机名不正确', 'yellow');
      log('2. DNS解析失败', 'yellow');
    } else if (error.code === '28') {
      log('\n可能的原因:', 'yellow');
      log('1. 网络连接超时', 'yellow');
      log('2. 防火墙阻止连接', 'yellow');
    }

    log('\n修复建议:', 'yellow');
    log('1. 检查 .env.local 文件中的 DATABASE_URL 是否正确', 'yellow');
    log('2. 确认数据库服务正在运行', 'yellow');
    log('3. 检查网络连接', 'yellow');
    log('4. 联系数据库服务提供商', 'yellow');

    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// 执行
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    log(`\n❌ 未捕获的错误: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
