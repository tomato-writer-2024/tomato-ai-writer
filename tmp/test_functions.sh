#!/bin/bash

# 番茄AI写作助手 - 功能测试脚本
# 用于验证所有核心API是否正常工作

BASE_URL="${BASE_URL:-http://localhost:5000}"
echo "=========================================="
echo "番茄AI写作助手 - 功能测试"
echo "=========================================="
echo "测试地址: $BASE_URL"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数器
TESTS_PASSED=0
TESTS_FAILED=0

# 测试函数
test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local headers="$5"

    echo -n "测试: $name ... "

    if [ -z "$headers" ]; then
        headers='-H "Content-Type: application/json"'
    fi

    if [ -z "$data" ]; then
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" $headers)
    else
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" $headers -d "$data")
    fi

    # 检查响应是否包含success:true或预期结果
    if echo "$response" | grep -q '"success":true' || echo "$response" | grep -q '"database":"connected"'; then
        echo -e "${GREEN}✓ 通过${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ 失败${NC}"
        echo "响应: $response"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# 测试函数（带token）
test_api_with_token() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local token="$5"

    test_api "$name" "$method" "$endpoint" "$data" "-H \"Content-Type: application/json\" -H \"Authorization: Bearer $token\""
}

# ========================================
# 基础健康检查
# ========================================
echo "=========================================="
echo "1. 基础健康检查"
echo "=========================================="

test_api "健康检查" "GET" "/api/health"

# ========================================
# 用户认证功能
# ========================================
echo ""
echo "=========================================="
echo "2. 用户认证功能"
echo "=========================================="

# 测试登录（使用固定测试用户）
echo "使用测试用户: test@example.com"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}')

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ 用户登录: 通过${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # 提取token和用户ID
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    USER_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
else
    echo -e "${RED}✗ 用户登录: 失败${NC}"
    echo "响应: $LOGIN_RESPONSE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# ========================================
# 小说管理功能
# ========================================
echo ""
echo "=========================================="
echo "3. 小说管理功能"
echo "=========================================="

if [ -n "$TOKEN" ]; then
    # 创建小说
    CREATE_NOVEL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/novels" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{"title":"测试小说_'$(date +%s)'","description":"这是一本测试小说","genre":"玄幻"}')

    if echo "$CREATE_NOVEL_RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}✓ 创建小说: 通过${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        # 提取小说ID
        NOVEL_ID=$(echo "$CREATE_NOVEL_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

        # 获取小说列表
        test_api_with_token "获取小说列表" "GET" "/api/novels" "" "$TOKEN"
    else
        echo -e "${RED}✗ 创建小说: 失败${NC}"
        echo "响应: $CREATE_NOVEL_RESPONSE"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi

    # ========================================
    # 章节管理功能
    # ========================================
    echo ""
    echo "=========================================="
    echo "4. 章节管理功能"
    echo "=========================================="

    if [ -n "$NOVEL_ID" ]; then
        # 创建章节
        CREATE_CHAPTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/chapters" \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer $TOKEN" \
          -d '{"novelId":"'$NOVEL_ID'","chapterNum":1,"title":"第一章","content":"这是第一章的内容"}')

        if echo "$CREATE_CHAPTER_RESPONSE" | grep -q '"success":true'; then
            echo -e "${GREEN}✓ 创建章节: 通过${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))

            # 获取章节列表
            test_api_with_token "获取章节列表" "GET" "/api/chapters?novelId=$NOVEL_ID" "" "$TOKEN"
        else
            echo -e "${RED}✗ 创建章节: 失败${NC}"
            echo "响应: $CREATE_CHAPTER_RESPONSE"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    else
        echo -e "${YELLOW}⚠ 跳过章节测试（小说ID为空）${NC}"
    fi

    # ========================================
    # 素材库功能
    # ========================================
    echo ""
    echo "=========================================="
    echo "5. 素材库功能"
    echo "=========================================="

    test_api_with_token "获取素材列表" "GET" "/api/materials" "" "$TOKEN"
else
    echo -e "${YELLOW}⚠ 跳过小说和章节测试（Token为空）${NC}"
fi

# ========================================
# 测试结果总结
# ========================================
echo ""
echo "=========================================="
echo "测试结果总结"
echo "=========================================="
echo -e "通过: ${GREEN}$TESTS_PASSED${NC}"
echo -e "失败: ${RED}$TESTS_FAILED${NC}"
echo "总计: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ 所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}✗ 有 $TESTS_FAILED 个测试失败${NC}"
    exit 1
fi
