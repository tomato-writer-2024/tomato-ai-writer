# 🚀 Token 验证问题快速修复

## 问题描述
登录后显示"您没有权限访问后台管理系统"。

## ⚡ 快速修复（2 步解决）

### 1. 停止并清理缓存
```bash
# 停止开发服务器（Ctrl + C）

# Windows
rmdir /s /q .next

# macOS/Linux
rm -rf .next
```

### 2. 重新启动
```bash
npm run dev
```

## ✅ 验证修复

访问 http://localhost:5000/admin/login 登录，应该成功进入管理后台。

---

## 📖 详细说明

查看详细修复指南：[TOKEN_FIX_GUIDE.md](./TOKEN_FIX_GUIDE.md)

## 🔍 诊断工具

测试 token 生成和验证：
```bash
curl -X POST http://localhost:5000/api/debug/token/test \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "email": "test@example.com",
    "role": "SUPER_ADMIN",
    "membershipLevel": "ENTERPRISE"
  }'
```

---

**注意**：代码已全部修复，只需要清理本地缓存即可。
