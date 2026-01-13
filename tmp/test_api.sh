#!/bin/bash

# 番茄AI写作助手 - API测试脚本
# 用于快速测试所有核心API接口

BASE_URL="http://localhost:5000"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
TOTAL=0
PASSED=0
FAILED=0

# 测试函数
test_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local auth=$5

    TOTAL=$((TOTAL + 1))

    echo -n "测试: $name ... "

    local cmd="curl -s -X $method"

    if [ -n "$data" ]; then
        cmd="$cmd -H 'Content-Type: application/json' -d '$data'"
    fi

    if [ -n "$auth" ]; then
        cmd="$cmd -H 'Authorization: Bearer $auth'"
    fi

    cmd="$cmd $BASE_URL$endpoint"

    response=$(eval $cmd)

    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✓ 通过${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ 失败${NC}"
        echo "响应: $response"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo "======================================"
echo "番茄AI写作助手 - API测试脚本"
echo "======================================"
echo ""

# 1. 健康检查
echo "1. 基础功能测试"
echo "-------------------"
test_api "健康检查" "GET" "/api/health" "" ""
echo ""

# 2. 注册新用户
echo "2. 用户认证测试"
echo "-------------------"
test_api "用户注册" \
    "POST" \
    "/api/auth/register" \
    '{"username":"testapiuser","email":"testapi@example.com","password":"Test123","confirmPassword":"Test123"}' \
    ""

# 登录获取Token
login_response=$(curl -s -X POST $BASE_URL/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"testapi@example.com","password":"Test123"}')

token=$(echo $login_response | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$token" ]; then
    echo -e "${RED}登录失败，无法获取Token${NC}"
    echo "响应: $login_response"
    token="placeholder_token"
else
    echo -e "${GREEN}登录成功，Token: ${token:0:20}...${NC}"
fi

echo ""

# 3. 用户相关API
echo "3. 用户相关API"
echo "-------------------"
test_api "获取用户资料" "GET" "/api/user/profile" "" "$token"
test_api "获取用户统计" "GET" "/api/user/stats" "" "$token"
echo ""

# 4. 作品管理API
echo "4. 作品管理API"
echo "-------------------"
test_api "获取小说列表" "GET" "/api/novels" "" "$token"
test_api "创建小说" \
    "POST" \
    "/api/novels" \
    '{"title":"测试小说","genre":"玄幻","description":"这是一个测试小说"}' \
    "$token"

# 获取小说ID（假设第一个创建的小说）
novels_response=$(curl -s -X GET $BASE_URL/api/novels \
    -H "Authorization: Bearer $token")

novel_id=$(echo $novels_response | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

if [ -n "$novel_id" ]; then
    echo -e "${GREEN}获取到小说ID: $novel_id${NC}"

    test_api "获取小说详情" "GET" "/api/novels/$novel_id" "" "$token"
    test_api "获取章节列表" "GET" "/api/chapters?novelId=$novel_id" "" "$token"
    test_api "创建章节" \
        "POST" \
        "/api/chapters" \
        "{\"novelId\":\"$novel_id\",\"chapterNum\":1,\"title\":\"第一章\",\"content\":\"这是第一章的内容\"}" \
        "$token"
fi
echo ""

# 5. 素材管理API
echo "5. 素材管理API"
echo "-------------------"
test_api "获取素材列表" "GET" "/api/materials" "" "$token"
test_api "获取素材统计" "GET" "/api/materials/stats" "" "$token"
echo ""

# 6. 核心创作API（可能需要较长时间）
echo "6. 核心创作API（可能需要较长时间）"
echo "-------------------"
# 这些API可能需要较长时间，暂时跳过
# test_api "标题生成" "POST" "/api/title-generator" '{"genre":"玄幻","style":"热血"}' "$token"
# test_api "大纲生成" "POST" "/api/outline-generator" '{"title":"测试大纲","genre":"玄幻"}' "$token"
# test_api "黄金开头" "POST" "/api/golden-start/generate" '{"title":"测试小说","genre":"玄幻"}' "$token"

echo -e "${YELLOW}注意：核心创作API需要较长时间，已跳过测试${NC}"
echo ""

# 7. 订单和支付API
echo "7. 订单和支付API"
echo "-------------------"
test_api "获取订单列表" "GET" "/api/orders" "" "$token"
echo ""

# 8. 数据统计API
echo "8. 数据统计API"
echo "-------------------"
test_api "获取统计数据" "GET" "/api/stats" "" "$token"
echo ""

# 总结
echo "======================================"
echo "测试总结"
echo "======================================"
echo -e "总测试数: $TOTAL"
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ 所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}✗ 有 $FAILED 个测试失败${NC}"
    exit 1
fi
