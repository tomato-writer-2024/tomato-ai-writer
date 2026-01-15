#!/bin/bash

# 番茄小说AI写作工具 - 端到端测试脚本

BASE_URL="http://localhost:5000"
API_URL="$BASE_URL/api"
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_USERNAME="testuser_$(date +%s)"
TEST_PASSWORD="test123456"
TOKEN=""
USER_ID=""

echo "========================================"
echo "开始端到端测试"
echo "========================================"

# 测试1: 用户注册
echo -e "\n[测试1] 用户注册"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$TEST_USERNAME\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"confirmPassword\": \"$TEST_PASSWORD\"
  }")
echo "注册响应: $REGISTER_RESPONSE"

# 提取token和user_id
TOKEN=$(echo $REGISTER_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null || echo "")
USER_ID=$(echo $REGISTER_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['user']['id'])" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
  echo "❌ 注册失败"
  exit 1
fi
echo "✅ 注册成功, User ID: $USER_ID"

# 测试2: 验证登录
echo -e "\n[测试2] 用户登录"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login-direct" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")
echo "登录响应: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败"
  exit 1
fi
echo "✅ 登录成功"

# 测试3: 创建小说
echo -e "\n[测试3] 创建小说"
NOVEL_RESPONSE=$(curl -s -X POST "$API_URL/novels" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"测试小说\",
    \"description\": \"这是一部测试小说\",
    \"genre\": \"玄幻\",
    \"status\": \"DRAFT\",
    \"type\": \"SERIES\",
    \"tags\": [\"爽文\", \"快节奏\"]
  }")
echo "创建小说响应: $NOVEL_RESPONSE"

NOVEL_ID=$(echo $NOVEL_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || echo "")

if [ -z "$NOVEL_ID" ]; then
  echo "❌ 创建小说失败"
  exit 1
fi
echo "✅ 创建小说成功, Novel ID: $NOVEL_ID"

# 测试4: 创建章节
echo -e "\n[测试4] 创建章节"
CHAPTER_RESPONSE=$(curl -s -X POST "$API_URL/chapters" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"novelId\": \"$NOVEL_ID\",
    \"chapterNum\": 1,
    \"title\": \"第一章：开始\",
    \"content\": \"这是一个测试章节的内容。\",
    \"wordCount\": 10,
    \"isPublished\": false
  }")
echo "创建章节响应: $CHAPTER_RESPONSE"

CHAPTER_ID=$(echo $CHAPTER_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || echo "")

if [ -z "$CHAPTER_ID" ]; then
  echo "❌ 创建章节失败"
  exit 1
fi
echo "✅ 创建章节成功, Chapter ID: $CHAPTER_ID"

# 测试5: 获取订单列表
echo -e "\n[测试5] 获取订单列表"
ORDERS_RESPONSE=$(curl -s -X GET "$API_URL/orders" \
  -H "Authorization: Bearer $TOKEN")
echo "订单列表响应: $ORDERS_RESPONSE"

# 测试6: 获取小说列表
echo -e "\n[测试6] 获取小说列表"
NOVELS_RESPONSE=$(curl -s -X GET "$API_URL/novels" \
  -H "Authorization: Bearer $TOKEN")
echo "小说列表响应: $NOVELS_RESPONSE"

# 测试7: 获取章节列表
echo -e "\n[测试7] 获取章节列表"
CHAPTERS_RESPONSE=$(curl -s -X GET "$API_URL/chapters?novelId=$NOVEL_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "章节列表响应: $CHAPTERS_RESPONSE"

# 测试8: 获取通知列表
echo -e "\n[测试8] 获取通知列表"
NOTIFICATIONS_RESPONSE=$(curl -s -X GET "$API_URL/notifications" \
  -H "Authorization: Bearer $TOKEN")
echo "通知列表响应: $NOTIFICATIONS_RESPONSE"

# 测试9: 社区发帖
echo -e "\n[测试9] 社区发帖"
POST_RESPONSE=$(curl -s -X POST "$API_URL/community/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"测试帖子\",
    \"content\": \"这是一个测试帖子的内容。\",
    \"category\": \"讨论\",
    \"tags\": [\"测试\"]
  }")
echo "发帖响应: $POST_RESPONSE"

POST_ID=$(echo $POST_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || echo "")

if [ -z "$POST_ID" ]; then
  echo "❌ 发帖失败"
  exit 1
fi
echo "✅ 发帖成功, Post ID: $POST_ID"

# 测试10: 获取帖子列表
echo -e "\n[测试10] 获取帖子列表"
POSTS_RESPONSE=$(curl -s -X GET "$API_URL/community/posts" \
  -H "Authorization: Bearer $TOKEN")
echo "帖子列表响应: $POSTS_RESPONSE"

# 测试11: 获取用户资料
echo -e "\n[测试11] 获取用户资料"
PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/user/profile" \
  -H "Authorization: Bearer $TOKEN")
echo "用户资料响应: $PROFILE_RESPONSE"

echo -e "\n========================================"
echo "✅ 端到端测试完成"
echo "========================================"
