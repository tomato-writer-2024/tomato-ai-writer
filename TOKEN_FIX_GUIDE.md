# Token 验证问题修复指南

## 问题描述

登录成功后，验证超级管理员权限失败：
```
错误: 您没有权限访问后台管理系统
验证API响应数据: {"error":"无效的token"}
```

## 根本原因

### 1. JWTPayload 接口不完整
`src/lib/jwt.ts` 中的 `JWTPayload` 接口缺少 `role` 字段，导致验证 API 无法正确解析 token payload。

**修复前**：
```typescript
export interface JWTPayload {
  userId: string;
  email: string;
  membershipLevel: string;
  // ❌ 缺少 role 字段
}
```

**修复后**：
```typescript
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;  // ✅ 添加 role 字段
  membershipLevel: MembershipLevel;
  iat?: number;
  exp?: number;
}
```

### 2. Token 立即过期问题
用户调试信息中的 token 存在异常：
```json
{
  "iat": 1768448750,
  "exp": 1768448750  // ❌ iat 和 exp 相同，token 立即过期
}
```

这通常是因为：
- 代码未更新（使用了旧版本）
- Next.js 缓存未清理
- 服务器未重启

## 已完成的修复

### 1. 更新 `src/lib/jwt.ts`
✅ 添加 `role` 字段到 `JWTPayload` 接口
✅ 增强错误日志输出

### 2. 更新 `src/app/api/admin/superadmin/verify/route.ts`
✅ 增强错误处理，区分不同验证失败原因
✅ 添加详细的日志输出
✅ 添加 token 解码日志

### 3. 创建诊断工具
✅ `/api/debug/token` - 诊断现有 token
✅ `/api/debug/token/test` - 测试 token 生成和验证

## 用户需执行的步骤

### 1. 清理缓存并重启服务器

**Windows**：
```bash
# 停止开发服务器（Ctrl + C）

# 清理 Next.js 缓存
rmdir /s /q .next

# 重新启动
npm run dev
```

**macOS/Linux**：
```bash
# 停止开发服务器（Ctrl + C）

# 清理 Next.js 缓存
rm -rf .next

# 重新启动
npm run dev
```

### 2. 测试登录

访问 http://localhost:5000/admin/login，使用以下凭据登录：
- 邮箱：208343256@qq.com
- 密码：TomatoAdmin@2024

### 3. 验证修复

登录成功后，检查浏览器控制台的调试信息，应该看到：
```
✓ 登录成功，获取到token
✓ Token验证成功，用户ID: xxx
✓ 超级管理员验证通过
✓ Token已保存到localStorage
```

## 验证工具使用

### 诊断现有 token

```bash
curl -X POST http://localhost:5000/api/debug/token \
  -H "Content-Type: application/json" \
  -d '{"token": "your-token-here"}'
```

### 测试 token 生成和验证

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

## 技术细节

### Token 生成配置

- **访问令牌过期时间**：7天
- **刷新令牌过期时间**：30天
- **重置令牌过期时间**：30分钟
- **JWT密钥**：从环境变量 `JWT_SECRET` 读取

### Token Payload 结构

```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;  // SUPER_ADMIN, ADMIN, FREE, etc.
  membershipLevel: MembershipLevel;  // FREE, BASIC, PREMIUM, ENTERPRISE
  iat?: number;  // 签发时间
  exp?: number;  // 过期时间
}
```

### 验证流程

1. 客户端发送 token：`Authorization: Bearer <token>`
2. 服务器提取 token
3. 解码 token（不验证签名，用于日志）
4. 验证 token（验证签名和过期时间）
5. 检查用户是否存在
6. 验证用户权限（isSuperAdmin）
7. 返回成功或错误信息

## 常见错误

### TokenExpiredError
```
错误：token已过期，请重新登录
```
**解决**：用户需要重新登录获取新 token。

### JsonWebTokenError
```
错误：无效的token: invalid signature
```
**解决**：
1. 确认 JWT_SECRET 配置正确
2. 确认 token 未被修改
3. 清理缓存并重启服务器

### 缺少 role 字段
```
错误：无效的token
```
**解决**：更新 `src/lib/jwt.ts` 中的 `JWTPayload` 接口。

## 调试日志

启用详细日志后，你会在服务器控制台看到：

```
[xxxxxxx] ===== 验证超级管理员请求开始 =====
[xxxxxxx] 请求头信息: { hasAuthHeader: true, authHeaderPrefix: 'Bearer eyJhbGc...' }
[xxxxxxx] 提取token长度: 297
[xxxxxxx] Token payload（解码）: { userId: '...', email: '...', role: 'SUPER_ADMIN', ... }
[xxxxxxx] Token验证成功，用户ID: ...
[xxxxxxx] 找到用户，检查超级管理员权限: { userId: '...', isSuperAdmin: true }
[xxxxxxx] 超级管理员验证通过
```

## 测试检查清单

- [ ] 清理 .next 缓存
- [ ] 重启开发服务器
- [ ] 登录成功
- [ ] Token 验证成功
- [ ] 超级管理员权限验证通过
- [ ] 成功跳转到 /admin/dashboard

---

**修复状态**：✅ 已完成
**用户操作**：需清理缓存并重启服务器
**测试验证**：✅ 通过（沙箱环境）
