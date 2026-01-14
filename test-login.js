/**
 * 测试登录功能
 * node test-login.js
 */

const http = require('http');

console.log('========================================');
console.log('测试登录API功能');
console.log('========================================\n');

const loginData = {
  email: '208343256@qq.com',
  password: 'TomatoAdmin@2024'
};

const postData = JSON.stringify(loginData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login-simple',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('发送登录请求...');
console.log(`URL: http://localhost:5000/api/auth/login-simple`);
console.log(`邮箱: ${loginData.email}`);
console.log(`密码: ${'*'.repeat(loginData.password.length)}\n`);

const req = http.request(options, (res) => {
  console.log(`响应状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers, null, 2)}\n`);

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('响应内容:');
    console.log('----------------------------------------');
    console.log(data);
    console.log('----------------------------------------\n');

    try {
      const parsedData = JSON.parse(data);
      if (parsedData.success) {
        console.log('✅ 登录成功！');
        console.log(`用户: ${parsedData.data.user.username}`);
        console.log(`邮箱: ${parsedData.data.user.email}`);
        console.log(`角色: ${parsedData.data.user.role}`);
        console.log(`超级管理员: ${parsedData.data.user.isSuperAdmin}`);
        console.log(`Token (前50字符): ${parsedData.data.token.substring(0, 50)}...`);
      } else {
        console.log('❌ 登录失败:');
        console.log(`错误: ${parsedData.error}`);
      }
    } catch (parseError) {
      console.log('❌ JSON解析失败:');
      console.log(parseError.message);
    }

    console.log('\n========================================');
    console.log('测试完成');
    console.log('========================================');
  });
});

req.on('error', (error) => {
  console.error('请求失败:', error.message);
});

req.write(postData);
req.end();
