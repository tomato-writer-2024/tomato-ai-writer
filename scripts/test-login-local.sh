#!/bin/bash

echo "=========================================="
echo "本地命令行登录测试"
echo "=========================================="
echo ""

# 测试登录
echo "正在测试登录..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login-direct \
  -H "Content-Type: application/json" \
  -d '{"email":"208343256@qq.com","password":"TomatoAdmin@2024"}')

# 检查是否成功
SUCCESS=$(echo "$RESPONSE" | grep -o '"success":[^,]*' | cut -d: -f2)

if [ "$SUCCESS" = "true" ]; then
  echo ""
  echo "=========================================="
  echo "✅ 登录成功！"
  echo "=========================================="

  # 提取信息
  USER_EMAIL=$(echo "$RESPONSE" | grep -o '"email":"[^"]*"' | head -1 | cut -d: -f2 | tr -d '"')
  USER_ROLE=$(echo "$RESPONSE" | grep -o '"role":"[^"]*"' | head -1 | cut -d: -f2 | tr -d '"')
  USERNAME=$(echo "$RESPONSE" | grep -o '"username":"[^"]*"' | head -1 | cut -d: -f2 | tr -d '"')
  TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | head -1 | cut -d: -f2 | tr -d '"')

  echo ""
  echo "用户信息:"
  echo "  邮箱: $USER_EMAIL"
  echo "  用户名: $USERNAME"
  echo "  角色: $USER_ROLE"
  echo ""
  echo "Token (前60字符):"
  echo "  ${TOKEN:0:60}..."
  echo ""
  echo "完整响应:"
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

  # 保存Token到文件
  echo "$TOKEN" > /tmp/login-token.txt
  echo ""
  echo "Token已保存到: /tmp/login-token.txt"
  echo ""
  echo "使用Token测试其他API:"
  echo "  curl -H \"Authorization: Bearer \$(cat /tmp/login-token.txt)\" \\"
  echo "       http://localhost:5000/api/user/profile"

else
  echo ""
  echo "=========================================="
  echo "❌ 登录失败"
  echo "=========================================="
  echo ""
  echo "完整响应:"
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
  echo ""
  echo "请检查:"
  echo "1. 服务器是否运行在5000端口"
  echo "2. 数据库连接是否正常"
  echo "3. 邮箱和密码是否正确"
fi
