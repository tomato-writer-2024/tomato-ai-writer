const bcrypt = require('bcryptjs');
const { getDb } = require('coze-coding-dev-sdk');
const crypto = require('crypto');

async function testRegister(email, username, password) {
  try {
    console.log(`\n========== 测试注册 ==========\n`);
    console.log(`邮箱: ${email}`);
    console.log(`用户名: ${username}`);
    console.log(`密码: ${password}`);
    console.log(`\n--------------------------------\n`);

    // 连接数据库
    console.log('连接数据库...');
    const db = await getDb();
    console.log('✅ 数据库连接成功');

    // 检查用户是否已存在
    console.log('\n检查用户是否已存在...');
    const existing = await db.execute(
      `SELECT id, email FROM users WHERE email = '${email}'`
    );

    if (existing.rows.length > 0) {
      console.error(`❌ 用户已存在: ${email}`);
      console.log(`用户ID: ${existing.rows[0].id}`);
      process.exit(1);
    }

    console.log('✅ 用户不存在，可以注册');

    // 生成UUID
    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();

    console.log('\n创建用户...');
    console.log(`UUID: ${userId}`);
    console.log(`PasswordHash: ${passwordHash.substring(0, 20)}...`);

    try {
      await db.execute(
        `INSERT INTO users (
          id, email, password_hash, username, role, membership_level,
          is_active, is_banned, is_super_admin,
          daily_usage_count, monthly_usage_count, storage_used,
          created_at, updated_at
        )
        VALUES (
          '${userId}',
          '${email}',
          '${passwordHash}',
          '${username}',
          'FREE',
          'FREE',
          true,
          false,
          false,
          0,
          0,
          0,
          '${now}',
          '${now}'
        )`
      );

      console.log('\n✅ 用户创建成功！');
      console.log(`\n用户信息:`);
      console.log(`  ID: ${userId}`);
      console.log(`  邮箱: ${email}`);
      console.log(`  用户名: ${username}`);
      console.log(`  密码: ${password}`);
      console.log(`\n====================================\n`);

      // 验证用户是否创建成功
      console.log('\n验证用户创建...');
      const verifyResult = await db.execute(
        `SELECT id, email, username, role, created_at FROM users WHERE email = '${email}'`
      );

      if (verifyResult.rows.length > 0) {
        console.log('✅ 用户验证成功！');
        console.log(`用户数据:`, verifyResult.rows[0]);
      } else {
        console.log('❌ 用户验证失败！');
      }

      process.exit(0);
    } catch (insertError) {
      console.error('\n❌ 插入用户失败:', insertError.message);
      console.error('错误详情:', insertError);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ 注册失败:', error);
    process.exit(1);
  }
}

// 运行测试
const email = process.argv[2] || '208343256@qq.com';
const username = process.argv[3] || '测试用户';
const password = process.argv[4] || 'Pass@2025';

testRegister(email, username, password);
