/**
 * 测试邮件重置密码功能
 */
require('dotenv').config({ path: '.env.local' });

const { getDb } = require('coze-coding-dev-sdk');
const { users } = require('./src/storage/database/shared/schema');
const { eq } = require('drizzle-orm');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// 邮件服务配置
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 生成重置token
function generateResetToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '30m',
  });
}

async function testResetPasswordFlow() {
  console.log('===== 测试密码重置流程 =====\n');

  try {
    // 1. 检查数据库中是否有用户
    console.log('1. 查询数据库中的用户...');
    const db = await getDb();
    const allUsers = await db.select().from(users);

    console.log(`找到 ${allUsers.length} 个用户:`);
    allUsers.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Username: ${user.username || '(未设置)'}`);
    });

    if (allUsers.length === 0) {
      console.log('\n⚠️ 数据库中没有用户！请先注册一个用户。');
      return;
    }

    const testUser = allUsers[0];
    console.log(`\n使用用户进行测试: ${testUser.email}\n`);

    // 2. 生成重置token
    console.log('2. 生成重置token...');
    const resetToken = generateResetToken({
      userId: testUser.id,
      email: testUser.email,
    });
    console.log(`Token: ${resetToken.substring(0, 20)}...\n`);

    // 3. 生成重置链接
    console.log('3. 生成重置链接...');
    const baseUrl = 'https://p75463bk4t.coze.site';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    console.log(`重置链接: ${resetUrl}\n`);

    // 4. 发送测试邮件
    console.log('4. 发送测试邮件...');
    const emailResult = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: testUser.email,
      subject: '【测试】密码重置测试邮件',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍅 番茄小说AI - 测试邮件</h1>
    </div>
    <div class="content">
      <p>您好，</p>
      <p>这是一封测试邮件，用于验证密码重置功能。</p>
      <p><strong>测试用户:</strong> ${testUser.email}</p>
      <p><strong>重置链接:</strong></p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">重置密码</a>
      </div>
      <p>或者复制以下链接到浏览器中打开：</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
    </div>
  </div>
</body>
</html>
      `,
    });

    console.log(`✅ 邮件发送成功！MessageID: ${emailResult.messageId}\n`);

    // 5. 验证token
    console.log('5. 验证重置token...');
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'fallback-secret');
    console.log(`✅ Token验证成功:`, {
      userId: decoded.userId,
      email: decoded.email,
    });

    console.log('\n===== 测试完成 =====');
    console.log(`\n请检查邮箱 ${testUser.email} 中的测试邮件，并点击重置链接进行测试。`);

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
  }
}

testResetPasswordFlow();
