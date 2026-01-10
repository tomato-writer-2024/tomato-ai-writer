# 重置密码功能故障排除指南

## 问题描述

用户报告可以收到重置密码的邮件，但点击邮件中的"重置密码"按钮后提示：
> 糟糕，访问遇到小插曲？别担心！，访问不了网页

## 问题原因

### 根本原因
邮件中的重置链接使用了 `localhost` 域名，导致在外网环境下无法访问。

### 详细说明

1. **环境变量配置问题**
   - `NEXT_PUBLIC_BASE_URL` 默认配置为 `http://localhost:5000`
   - 在生产环境中，这个值应该配置为实际的域名

2. **链接生成逻辑问题**
   - 原代码直接使用 `process.env.NEXT_PUBLIC_BASE_URL` 生成链接
   - 没有考虑生产环境下的实际域名

3. **邮件客户端安全提示**
   - 当邮件中的链接指向 `localhost` 时，邮件客户端可能显示安全提示
   - 腾讯邮箱等服务会扫描链接，如果链接不安全则显示警告

## 解决方案

### 1. 代码修复（已完成）

修改 `src/app/api/auth/forgot-password/route.ts`：

```typescript
// 修复前
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

// 修复后
const requestUrl = new URL(request.url);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${requestUrl.protocol}//${requestUrl.host}`;
const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
```

**优点**：
- 自动从请求中获取实际域名
- 无需手动配置环境变量
- 适用于开发和生产环境

### 2. 环境变量配置（生产环境必须）

在部署到生产环境时，确保配置正确的域名：

```bash
# 开发环境
NEXT_PUBLIC_BASE_URL=http://localhost:5000

# 生产环境（必须配置为实际域名）
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## 测试步骤

### 测试1：开发环境测试

1. 确保服务运行在 `http://localhost:5000`
2. 注册一个测试账号
3. 访问忘记密码页面，输入测试邮箱
4. 检查控制台日志，查看重置链接
5. 使用该链接访问重置密码页面
6. 输入新密码并提交

### 测试2：Mock模式测试

1. 设置 `EMAIL_MOCK_MODE=true`
2. 发送重置密码请求
3. 检查控制台日志中的重置链接
4. 复制链接到浏览器访问
5. 验证重置功能

### 测试3：生产环境测试

1. 配置正确的域名：`NEXT_PUBLIC_BASE_URL=https://yourdomain.com`
2. 部署到生产环境
3. 通过外网访问应用
4. 测试忘记密码和重置密码流程
5. 检查收到的邮件中链接是否正确

## 常见问题

### Q1: 邮件中的链接无法点击

**原因**：链接格式错误或域名不正确

**解决方案**：
- 检查 `NEXT_PUBLIC_BASE_URL` 是否配置正确
- 查看邮件原文，确认链接格式
- 尝试复制链接到浏览器手动访问

### Q2: 点击链接后显示"链接无效或已过期"

**原因**：
1. Token已过期（30分钟后）
2. Token被篡改
3. 用户不存在

**解决方案**：
- 重新申请重置密码
- 检查邮件接收时间，确认在30分钟内
- 确认用户账号存在

### Q3: 重置密码按钮点击无反应

**原因**：
1. 前端JS错误
2. 网络连接问题
3. API调用失败

**解决方案**：
- 打开浏览器开发者工具，查看Console错误
- 检查Network标签，查看API请求
- 确认服务器正常运行

### Q4: API返回"重置失败，请稍后重试"

**原因**：
1. 数据库连接失败
2. Token验证失败
3. 密码更新失败

**解决方案**：
- 检查服务器日志
- 确认数据库连接正常
- 查看错误详情

## 调试技巧

### 1. 查看服务器日志

在开发环境中，重置链接会打印在控制台：

```
========================================
[忘记密码] 重置密码链接:
http://localhost:5000/reset-password?token=xxx
========================================
```

### 2. 使用浏览器开发者工具

打开开发者工具（F12）：
- Console：查看JS错误
- Network：查看API请求和响应
- Application：查看Cookie和存储

### 3. 测试API端点

使用curl测试API：

```bash
# 测试忘记密码API
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 测试重置密码API（需要有效的token）
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"your_token","password":"newpassword"}'
```

## 安全建议

1. **Token有效期**：30分钟是合理的有效期，不建议延长
2. **Token使用限制**：每个token只能使用一次
3. **邮件内容安全**：不在邮件中包含敏感信息
4. **HTTPS加密**：生产环境必须使用HTTPS
5. **日志记录**：记录密码重置的安全事件

## 部署检查清单

部署到生产环境前，检查以下项目：

- [ ] 配置正确的域名 `NEXT_PUBLIC_BASE_URL`
- [ ] 配置邮件服务（非Mock模式）
- [ ] 配置HTTPS证书
- [ ] 测试完整的忘记密码流程
- [ ] 测试重置密码流程
- [ ] 检查邮件内容中的链接
- [ ] 验证Token验证逻辑
- [ ] 检查日志记录功能
- [ ] 测试错误处理

## 相关文件

- `src/app/api/auth/forgot-password/route.ts` - 忘记密码API
- `src/app/api/auth/reset-password/route.ts` - 重置密码API
- `src/app/reset-password/page.tsx` - 重置密码页面
- `src/lib/emailService.ts` - 邮件服务
- `.env.local` - 环境变量配置
- `EMAIL_SETUP.md` - 邮件服务配置指南

## 更新日志

### 2026-01-10
- 修复重置链接生成逻辑，自动从请求中获取域名
- 添加环境变量配置说明
- 创建故障排除文档

## 联系支持

如果遇到无法解决的问题，请提供以下信息：

1. 详细的错误信息
2. 服务器日志（去除敏感信息）
3. 浏览器控制台错误
4. Network请求详情
5. 环境变量配置（去除敏感信息）

---

**注意**：生产环境部署前，务必配置正确的域名并测试完整流程！
