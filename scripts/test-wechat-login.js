const { getDb } = require('../.next/server/app/api/auth/wechat-login/route.js');
const crypto = require('crypto');

async function testWechatLogin() {
  try {
    console.log('开始测试微信登录...');

    const db = await getDb();
    console.log('数据库连接成功');

    // 测试查询
    const wechatOpenId = 'test_openid_12345';
    const result = await db.execute(
      `SELECT id, email, username, wechat_open_id, wechat_union_id, avatar_url, role, membership_level
       FROM users WHERE wechat_open_id = '${wechatOpenId}'`
    );

    console.log('查询结果:', result.rows);

    if (result.rows.length === 0) {
      // 创建测试用户
      const userId = crypto.randomUUID();
      const now = new Date().toISOString();
      const randomPassword = crypto.randomUUID().substring(0, 32);
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(randomPassword, 12);

      await db.execute(
        `INSERT INTO users (
          id, email, password_hash, username, role, membership_level,
          membership_expire_at, daily_usage_count, monthly_usage_count, storage_used,
          is_active, is_banned, is_super_admin, wechat_open_id, wechat_union_id, avatar_url,
          created_at, updated_at
        )
        VALUES (
          '${userId}',
          'wx_${wechatOpenId}@wechat.user',
          '${passwordHash}',
          '微信测试用户',
          'FREE',
          'FREE',
          NULL,
          0,
          0,
          0,
          true,
          false,
          false,
          '${wechatOpenId}',
          'test_unionid_12345',
          'https://thirdwx.qlogo.cn/mmopen/vi_32/default_avatar.jpg',
          '${now}',
          '${now}'
        )`
      );

      console.log('测试用户创建成功:', userId);
    } else {
      console.log('测试用户已存在:', result.rows[0].id);
    }

    console.log('测试成功！');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testWechatLogin();
