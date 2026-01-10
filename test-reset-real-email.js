/**
 * 测试真实邮箱重置密码功能
 * 使用配置的QQ邮箱接收测试邮件
 */

// 从环境变量加载配置（不使用dotenv，直接读取）
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// 解析.env.local文件
function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      env[key] = value;
    }
  });
  return env;
}

const env = parseEnvFile('.env.local');

console.log('===== 测试真实邮箱重置密码 =====\n');

// 1. 配置邮件服务
console.log('1. 配置邮件服务...');
console.log(`   SMTP Host: ${env.EMAIL_HOST}`);
console.log(`   SMTP Port: ${env.EMAIL_PORT}`);
console.log(`   Email User: ${env.EMAIL_USER}`);
console.log(`   Mock Mode: ${env.EMAIL_MOCK_MODE}\n`);

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: parseInt(env.EMAIL_PORT),
  secure: env.EMAIL_SECURE === 'true',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

// 2. 验证SMTP连接
console.log('2. 验证SMTP连接...');
transporter.verify((error, success) => {
  if (error) {
    console.error('   ❌ SMTP连接失败:', error.message);
    process.exit(1);
  }
  console.log('   ✅ SMTP连接成功！\n');

  // 3. 发送测试邮件到QQ邮箱
  console.log('3. 发送测试邮件...');
  const testEmail = env.EMAIL_USER; // 发送到配置的QQ邮箱
  const testUrl = `${env.NEXT_PUBLIC_BASE_URL}/reset-password?token=test-token-12345`;

  transporter.sendMail({
    from: env.EMAIL_FROM,
    to: testEmail,
    subject: '【测试】密码重置链接测试',
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
      <p>这是一封测试邮件，用于验证密码重置功能是否正常工作。</p>
      <p><strong>测试链接：</strong></p>
      <div style="text-align: center;">
        <a href="${testUrl}" class="button">重置密码</a>
      </div>
      <p>或者复制以下链接到浏览器中打开：</p>
      <p style="word-break: break-all; color: #666;">${testUrl}</p>
      <hr>
      <p style="font-size: 12px; color: #999;">
        配置信息:<br>
        Base URL: ${env.NEXT_PUBLIC_BASE_URL}<br>
        Mock Mode: ${env.EMAIL_MOCK_MODE}<br>
        Node Env: ${env.NODE_ENV}
      </p>
    </div>
  </div>
</body>
</html>
    `,
  })
  .then(info => {
    console.log(`   ✅ 邮件发送成功！`);
    console.log(`   MessageID: ${info.messageId}`);
    console.log(`   发送到: ${testEmail}\n`);

    console.log('===== 测试完成 =====');
    console.log(`\n请检查邮箱 ${testEmail} 中的测试邮件。`);
    console.log('如果邮件中的链接可以正常访问，说明密码重置功能正常工作。');
  })
  .catch(err => {
    console.error('   ❌ 邮件发送失败:', err.message);
    process.exit(1);
  });
});
