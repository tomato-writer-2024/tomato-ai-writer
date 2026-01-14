#!/bin/bash

# Netlify 生产环境真实数据库连接测试脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 替换为你的 Netlify 站点 URL
SITE_URL="${1:-https://your-site.netlify.app}"

echo "============================================"
echo "Netlify 生产环境测试"
echo "============================================"
echo "站点 URL: $SITE_URL"
echo "时间: $(date)"
echo ""

# 测试 1: 健康检查
echo -e "${YELLOW}[1/4]${NC} 测试健康检查 API..."
HEALTH_RESPONSE=$(curl -s "$SITE_URL/api/health")
echo "$HEALTH_RESPONSE" | python3 -m json.tool || echo "$HEALTH_RESPONSE"

# 检查数据库模式
DB_MODE=$(echo "$HEALTH_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['checks']['database']['mode'])" 2>/dev/null || echo "unknown")
DB_STATUS=$(echo "$HEALTH_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['checks']['database']['status'])" 2>/dev/null || echo "unknown")

if [ "$DB_MODE" = "real" ] && [ "$DB_STATUS" = "ok" ]; then
    echo -e "${GREEN}✓ 数据库模式: 真实数据库${NC}"
    echo -e "${GREEN}✓ 数据库连接: 成功${NC}"
else
    echo -e "${RED}✗ 数据库模式: $DB_MODE${NC}"
    echo -e "${RED}✗ 数据库状态: $DB_STATUS${NC}"
fi

echo ""
sleep 2

# 测试 2: 创建测试用户
echo -e "${YELLOW}[2/4]${NC} 测试用户注册..."
TIMESTAMP=$(date +%s)
TEST_EMAIL="test_$TIMESTAMP@example.com"
TEST_PASSWORD="Test123456!"

REGISTER_RESPONSE=$(curl -s -X POST "$SITE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"username\": \"测试用户$TIMESTAMP\"
  }")

echo "$REGISTER_RESPONSE" | python3 -m json.tool || echo "$REGISTER_RESPONSE"

# 检查注册是否成功
if echo "$REGISTER_RESPONSE" | grep -q "success\|token"; then
    echo -e "${GREEN}✓ 用户注册成功${NC}"
    REGISTERED=true
else
    echo -e "${RED}✗ 用户注册失败${NC}"
    REGISTERED=false
fi

echo ""
sleep 2

# 测试 3: 登录测试
if [ "$REGISTERED" = true ]; then
    echo -e "${YELLOW}[3/4]${NC} 测试用户登录..."
    LOGIN_RESPONSE=$(curl -s -X POST "$SITE_URL/api/auth/login" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
      }")

    echo "$LOGIN_RESPONSE" | python3 -m json.tool || echo "$LOGIN_RESPONSE"

    # 检查登录是否成功
    if echo "$LOGIN_RESPONSE" | grep -q "token\|success"; then
        echo -e "${GREEN}✓ 用户登录成功${NC}"
        TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('token', data.get('data', {}).get('token', '')))" 2>/dev/null || echo "")
    else
        echo -e "${RED}✗ 用户登录失败${NC}"
    fi
else
    echo -e "${YELLOW}[3/4]${NC} 跳过登录测试（注册失败）"
fi

echo ""
sleep 2

# 测试 4: API 性能测试
echo -e "${YELLOW}[4/4]${NC} API 性能测试..."
for i in {1..5}; do
    START=$(date +%s%N)
    curl -s "$SITE_URL/api/health" > /dev/null
    END=$(date +%s%N)
    DURATION=$(( (END - START) / 1000000 ))
    echo "  请求 $i: ${DURATION}ms"
    sleep 1
done

echo ""
echo "============================================"
echo "测试完成"
echo "============================================"

if [ "$DB_MODE" = "real" ] && [ "$DB_STATUS" = "ok" ]; then
    echo -e "${GREEN}✓ 真实数据库连接成功！${NC}"
    echo -e "${GREEN}✓ 系统可正常使用${NC}"
else
    echo -e "${RED}✗ 数据库连接失败${NC}"
    echo -e "${YELLOW}建议：检查 Supabase 配置或启用 Mock 模式${NC}"
fi

echo ""
echo "测试邮箱: $TEST_EMAIL"
echo "测试密码: $TEST_PASSWORD"
