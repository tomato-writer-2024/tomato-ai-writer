# 本地命令行登录测试指南

## 方法1：使用curl命令（推荐）

在本地命令行执行以下命令：

```bash
curl -X POST http://localhost:5000/api/auth/login-direct \
  -H "Content-Type: application/json" \
  -d '{"email":"208343256@qq.com","password":"TomatoAdmin@2024"}'
```

### 预期输出（格式化后）：

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "8e819829-1743-4a44-94d3-6250fa883cb8",
      "email": "208343256@qq.com",
      "username": "管理员",
      "role": "SUPER_ADMIN",
      "membershipLevel": "ENTERPRISE",
      "membershipExpireAt": "2027-12-31T00:00:00.000Z",
      "isActive": true,
      "isBanned": false,
      "isSuperAdmin": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 美化输出（安装jq后）：

```bash
curl -X POST http://localhost:5000/api/auth/login-direct \
  -H "Content-Type: application/json" \
  -d '{"email":"208343256@qq.com","password":"TomatoAdmin@2024"}' | jq
```

## 方法2：使用脚本文件测试

创建测试脚本 `test-login.sh`：

```bash
#!/bin/bash

echo "=========================================="
echo "登录测试"
echo "=========================================="
echo ""

# 测试登录
echo "正在测试登录..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login-direct \
  -H "Content-Type: application/json" \
  -d '{"email":"208343256@qq.com","password":"TomatoAdmin@2024"}')

echo "$RESPONSE" | jq .

# 检查是否成功
SUCCESS=$(echo "$RESPONSE" | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
  echo ""
  echo "=========================================="
  echo "✅ 登录成功！"
  echo "=========================================="

  # 提取token
  TOKEN=$(echo "$RESPONSE" | jq -r '.data.token')
  USER_EMAIL=$(echo "$RESPONSE" | jq -r '.data.user.email')
  USER_ROLE=$(echo "$RESPONSE" | jq -r '.data.user.role')

  echo "用户邮箱: $USER_EMAIL"
  echo "用户角色: $USER_ROLE"
  echo ""
  echo "Token (前50字符): ${TOKEN:0:50}..."
  echo ""
  echo "完整Token已保存，可复制用于API测试"
else
  echo ""
  echo "=========================================="
  echo "❌ 登录失败"
  echo "=========================================="
  ERROR=$(echo "$RESPONSE" | jq -r '.error')
  echo "错误信息: $ERROR"
fi
```

执行脚本：

```bash
chmod +x test-login.sh
./test-login.sh
```

## 方法3：使用Node.js脚本测试

创建测试脚本 `test-login.js`：

```javascript
const http = require('http');

const data = JSON.stringify({
  email: '208343256@qq.com',
  password: 'TomatoAdmin@2024'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login-direct',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('==========================================');
console.log('登录测试');
console.log('==========================================\n');

const req = http.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('响应状态:', res.statusCode);
    console.log('\n响应内容:\n');

    try {
      const response = JSON.parse(body);
      console.log(JSON.stringify(response, null, 2));

      if (response.success) {
        console.log('\n==========================================');
        console.log('✅ 登录成功！');
        console.log('==========================================');
        console.log('用户邮箱:', response.data.user.email);
        console.log('用户角色:', response.data.user.role);
        console.log('Token:', response.data.token.substring(0, 50) + '...');
      } else {
        console.log('\n==========================================');
        console.log('❌ 登录失败');
        console.log('==========================================');
        console.log('错误:', response.error);
      }
    } catch (e) {
      console.log('解析响应失败:', e.message);
      console.log('原始响应:', body);
    }
  });
});

req.on('error', (e) => {
  console.error('请求失败:', e.message);
});

req.write(data);
req.end();
```

执行脚本：

```bash
node test-login.js
```

## 方法4：使用Python脚本测试

创建测试脚本 `test-login.py`：

```python
import requests
import json

url = 'http://localhost:5000/api/auth/login-direct'
data = {
    'email': '208343256@qq.com',
    'password': 'TomatoAdmin@2024'
}

print('=' * 50)
print('登录测试')
print('=' * 50)
print()

try:
    response = requests.post(url, json=data)
    print(f'响应状态: {response.status_code}')
    print('\n响应内容:\n')

    result = response.json()
    print(json.dumps(result, indent=2, ensure_ascii=False))

    if result.get('success'):
        print()
        print('=' * 50)
        print('✅ 登录成功！')
        print('=' * 50)
        print(f"用户邮箱: {result['data']['user']['email']}")
        print(f"用户角色: {result['data']['user']['role']}")
        print(f"Token: {result['data']['token'][:50]}...")
    else:
        print()
        print('=' * 50)
        print('❌ 登录失败')
        print('=' * 50)
        print(f"错误: {result.get('error')}")

except requests.exceptions.RequestException as e:
    print(f'请求失败: {e}')
except json.JSONDecodeError as e:
    print(f'解析响应失败: {e}')
```

执行脚本：

```bash
python test-login.py
```

## 测试检查清单

- [ ] 服务器运行中（5000端口）
- [ ] API返回success: true
- [ ] 用户信息正确（SUPER_ADMIN角色）
- [ ] Token成功生成
- [ ] Token不为空且有效

## 常见问题排查

### 1. 连接被拒绝

```bash
curl: (7) Failed to connect to localhost port 5000
```

**解决方案**：检查服务器是否启动

```bash
ss -tuln | grep 5000
```

### 2. 返回404

```bash
404 Not Found
```

**解决方案**：检查API路径是否正确

### 3. 返回401/403

```json
{
  "success": false,
  "error": "邮箱或密码错误"
}
```

**解决方案**：检查邮箱和密码是否正确

### 4. 返回500

```json
{
  "success": false,
  "error": "服务器错误"
}
```

**解决方案**：检查服务器日志

```bash
# 查看服务器日志
# 如果服务器在后台运行，查看日志文件或重启服务器
```

## 快速验证命令

```bash
# 一键测试并格式化输出
curl -s -X POST http://localhost:5000/api/auth/login-direct \
  -H "Content-Type: application/json" \
  -d '{"email":"208343256@qq.com","password":"TomatoAdmin@2024"}' | jq '.'
```

## 保存Token到文件

```bash
# 保存Token到文件
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login-direct \
  -H "Content-Type: application/json" \
  -d '{"email":"208343256@qq.com","password":"TomatoAdmin@2024"}' | jq -r '.data.token')

echo "$TOKEN" > token.txt
echo "Token已保存到 token.txt"
```

## 使用Token访问受保护API

```bash
# 读取Token
TOKEN=$(cat token.txt)

# 访问受保护的API（示例）
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer $TOKEN"
```
