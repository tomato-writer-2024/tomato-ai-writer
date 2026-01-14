#!/bin/bash

echo "=========================================="
echo "API 测试脚本"
echo "=========================================="
echo ""

# 测试1: 检查登录API是否可访问
echo "测试1: 检查 /api/auth/login 端点"
curl -I http://localhost:5000/api/auth/login 2>&1
echo ""
echo ""

# 测试2: 测试超级管理员验证API
echo "测试2: 检查 /api/admin/superadmin/verify 端点"
curl -I http://localhost:5000/api/admin/superadmin/verify 2>&1
echo ""
echo ""

# 测试3: 尝试登录（正确的格式）
echo "测试3: 尝试登录"
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"208343256@qq.com","password":"TomatoAdmin@2024"}' \
  2>&1
echo ""
echo ""

# 测试4: 测试直接登录API
echo "测试4: 测试直接登录API"
curl -X POST http://localhost:5000/api/auth/login-direct \
  -H "Content-Type: application/json" \
  -d '{"email":"208343256@qq.com","password":"TomatoAdmin@2024"}' \
  2>&1
echo ""
echo ""
