/**
 * Vercel部署健康检查脚本
 * 用于在Vercel终端中快速检查部署状态
 */

import { getDb } from 'coze-coding-dev-sdk';

async function healthCheck() {
  console.log('='.repeat(60));
  console.log('Vercel部署健康检查');
  console.log('='.repeat(60));
  console.log('');

  // 1. 环境变量检查
  console.log('1. 环境变量检查');
  console.log('-'.repeat(40));

  const requiredEnvs = ['DATABASE_URL', 'JWT_SECRET'];
  const optionalEnvs = ['NEXT_PUBLIC_APP_NAME', 'NEXT_PUBLIC_BASE_URL'];

  let envPassed = true;
  requiredEnvs.forEach((env) => {
    const value = process.env[env];
    if (value) {
      console.log(`✓ ${env}: 已配置`);
    } else {
      console.log(`✗ ${env}: 未配置`);
      envPassed = false;
    }
  });

  if (envPassed) {
    console.log('所有必需的环境变量已配置 ✓');
  } else {
    console.log('错误: 缺少必需的环境变量 ✗');
    process.exit(1);
  }
  console.log('');

  // 2. 数据库连接测试
  console.log('2. 数据库连接测试');
  console.log('-'.repeat(40));

  try {
    const db = await getDb();

    // 测试连接
    const result = await db.execute('SELECT NOW() as current_time');
    console.log(`✓ 数据库连接成功`);
    console.log(`  当前时间: ${result.rows[0].current_time}`);

    // 检查表是否存在
    const tables = ['users', 'novels', 'chapters', 'api_keys', 'security_logs'];
    for (const table of tables) {
      const tableResult = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = '${table}'
        )
      `);
      const exists = tableResult.rows[0].exists;
      if (exists) {
        console.log(`✓ 表 ${table}: 存在`);
      } else {
        console.log(`✗ 表 ${table}: 不存在`);
      }
    }
    console.log('');
  } catch (error: any) {
    console.log(`✗ 数据库连接失败: ${error.message}`);
    console.log('错误: 无法连接到数据库 ✗');
    process.exit(1);
  }

  // 3. 超级管理员检查
  console.log('3. 超级管理员检查');
  console.log('-'.repeat(40));

  try {
    const db = await getDb();
    const email = '208343256@qq.com';
    const escapedEmail = email.replace(/'/g, "''");

    const result = await db.execute(`
      SELECT id, email, username, role, is_super_admin, is_active, is_banned
      FROM users WHERE email = '${escapedEmail}'
    `);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✓ 超级管理员账户存在');
      console.log(`  邮箱: ${user.email}`);
      console.log(`  用户名: ${user.username}`);
      console.log(`  角色: ${user.role}`);
      console.log(`  超级管理员: ${user.is_super_admin ? '是' : '否'}`);
      console.log(`  状态: ${user.is_active ? '激活' : '未激活'}`);

      if (!user.is_super_admin) {
        console.log('');
        console.log('⚠ 警告: 该账户不是超级管理员');
        console.log('  运行以下命令将其升级为超级管理员:');
        console.log(`  npx tsx src/scripts/upgrade-super-admin.ts ${user.id}`);
      }
    } else {
      console.log('✗ 超级管理员账户不存在');
      console.log('  运行以下命令创建超级管理员:');
      console.log('  npx tsx src/scripts/init-super-admin.ts');
    }
    console.log('');
  } catch (error: any) {
    console.log(`✗ 查询失败: ${error.message}`);
    console.log('');
  }

  // 4. JWT配置检查
  console.log('4. JWT配置检查');
  console.log('-'.repeat(40));

  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    if (jwtSecret.length >= 32) {
      console.log(`✓ JWT_SECRET: 已配置 (长度: ${jwtSecret.length})`);
      console.log('  状态: 有效');
    } else {
      console.log(`✗ JWT_SECRET: 长度不足 (当前: ${jwtSecret.length}, 建议: 32+)`);
    }
  } else {
    console.log('✗ JWT_SECRET: 未配置');
  }
  console.log('');

  // 5. 总结
  console.log('='.repeat(60));
  console.log('健康检查完成');
  console.log('='.repeat(60));
  console.log('');
  console.log('下一步:');
  console.log('1. 访问 https://tomato-ai-writer.vercel.app/api/diagnose 进行在线诊断');
  console.log('2. 访问 https://tomato-ai-writer.vercel.app/test-vercel 查看完整报告');
  console.log('3. 访问 https://tomato-ai-writer.vercel.app/simple-login 测试登录功能');
  console.log('4. 访问 https://tomato-ai-writer.vercel.app/workspace 进入工作台');
  console.log('');
}

healthCheck().catch((error) => {
  console.error('健康检查失败:', error);
  process.exit(1);
});
