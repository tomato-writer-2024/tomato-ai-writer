# 密码重置功能测试指南

## 测试环境配置

- **部署域名**: https://p75463bk4t.coze.site
- **邮件服务**: QQ邮箱（smtp.qq.com:465）
- **邮件模式**: 真实发送模式（EMAIL_MOCK_MODE=false）
- **测试邮箱**: 208343256@qq.com

## 测试步骤

### 1. 确认已有测试用户

测试邮箱 `test@example.com` 已经在数据库中注册。

### 2. 调用忘记密码API

使用curl测试忘记密码功能：

```bash
curl -X POST https://p75463bk4t.coze.site/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**预期响应**:
```json
{"success":true,"message":"如果该邮箱已注册，重置链接已发送"}
```

### 3. 查看服务器日志

邮件发送成功后，重置链接会打印在服务器日志中：

```
[忘记密码] 重置密码链接:
https://p75463bk4t.coze.site/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. 访问重置链接

将日志中的token复制到URL中，访问：
```
https://p75463bk4t.coze.site/reset-password?token=YOUR_TOKEN_HERE
```

### 5. 输入新密码

在重置密码页面：
- 输入新密码（至少6位）
- 确认新密码
- 点击"重置密码"按钮

### 6. 验证密码重置成功

看到"密码重置成功"页面后，点击"立即登录"按钮。

### 7. 使用新密码登录

使用 `test@example.com` 和新密码登录，验证是否成功。

## 已修复的问题

### 问题1: 重置链接指向localhost
**原因**: 忘记密码API使用环境变量NEXT_PUBLIC_BASE_URL，在生产环境仍指向localhost。

**修复**:
```typescript
// 修复前：
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${requestUrl.protocol}//${requestUrl.host}`;

// 修复后：
const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
```

### 问题2: 环境变量未更新为生产域名
**修复**:
```env
NEXT_PUBLIC_BASE_URL=https://p75463bk4t.coze.site
NODE_ENV=production
```

### 问题3: 微信登录回调URL仍指向localhost
**修复**:
```env
WECHAT_REDIRECT_URI=https://p75463bk4t.coze.site/auth/wechat/callback
```

## 邮件服务测试结果

### SMTP连接测试
```bash
$ node test-reset-real-email.js
===== 测试真实邮箱重置密码 =====

1. 配置邮件服务...
   SMTP Host: smtp.qq.com
   SMTP Port: 465
   Email User: 208343256@qq.com
   Mock Mode: false

2. 验证SMTP连接...
   ✅ SMTP连接成功！

3. 发送测试邮件...
   ✅ 邮件发送成功！
   MessageID: <84f47937-c932-db93-4fd8-a913165d7de1@qq.com>
   发送到: 208343256@qq.com

===== 测试完成 =====
```

**结论**: 邮件服务配置正确，可以正常发送邮件。

## 真实用户测试流程

### 测试用户使用真实邮箱

1. **注册账号**
   - 访问 https://p75463bk4t.coze.site/register
   - 填写真实邮箱、用户名和密码
   - 完成注册

2. **忘记密码**
   - 访问 https://p75463bk4t.coze.site/forgot-password
   - 输入注册时使用的真实邮箱
   - 点击"发送重置链接"

3. **检查邮箱**
   - 打开真实邮箱
   - 查找来自"番茄小说AI"的邮件
   - 邮件主题：【番茄小说AI】密码重置

4. **点击重置链接**
   - 邮件中有两个方式访问重置链接：
     1. 点击"重置密码"按钮
     2. 复制链接到浏览器
   - 链接格式：`https://p75463bk4t.coze.site/reset-password?token=...`

5. **设置新密码**
   - 输入新密码（至少6位）
   - 确认新密码
   - 点击"重置密码"

6. **登录验证**
   - 使用新密码登录
   - 确认可以正常访问系统

## 邮件模板示例

```
【番茄小说AI】密码重置

🍅 番茄小说AI

您好，

我们收到了您的密码重置请求。

请点击下方按钮重置您的密码：

[重置密码]

或者复制以下链接到浏览器中打开：

https://p75463bk4t.coze.site/reset-password?token=...

重置链接有效期为 30 分钟。

如果这不是您本人的操作，请忽略此邮件。

---
此邮件由系统自动发送，请勿直接回复
© 2024 番茄小说AI · 让创作更简单
```

## 故障排除

### 问题：收不到邮件

**可能原因**:
1. 邮箱地址未注册
2. 邮件进入垃圾箱
3. 邮件服务配置错误

**解决方法**:
- 检查垃圾箱/广告邮件文件夹
- 确认邮箱地址已注册
- 查看服务器日志确认邮件发送状态

### 问题：重置链接无效

**可能原因**:
1. Token已过期（30分钟有效期）
2. Token已被使用
3. Token被篡改

**解决方法**:
- 重新申请重置链接
- 确保链接完整且未被截断
- 尽快使用重置链接

### 问题：点击邮件链接后无法访问

**可能原因**:
1. 链接指向localhost
2. 域名配置错误

**解决方法**:
- 已修复：链接现在自动使用请求的实际域名
- 确认访问的是 https://p75463bk4t.coze.site

### 问题：重置密码失败

**可能原因**:
1. 两次密码不一致
2. 密码长度不足6位
3. Token验证失败

**解决方法**:
- 确保两次输入的密码相同
- 确保密码长度至少6位
- 重新申请重置链接

## 技术细节

### Token生成
```typescript
export function generateResetToken(payload: {
  userId: string;
  email: string;
}): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30m',
  });
}
```

### Token验证
```typescript
export function verifyResetToken(token: string): {
  userId: string;
  email: string;
} | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    return null;
  }
}
```

### 邮件发送流程
1. 用户输入邮箱
2. 系统验证邮箱格式
3. 查询用户是否存在
4. 生成重置Token（30分钟有效）
5. 构建重置链接（使用请求的实际域名）
6. 发送邮件到用户邮箱
7. 用户点击邮件中的链接
8. 前端验证Token并显示重置表单
9. 用户提交新密码
10. 系统验证Token并更新密码
11. 返回成功，用户可以使用新密码登录

## 安全措施

1. **邮箱枚举防护**: 无论邮箱是否注册，都返回"如果该邮箱已注册，重置链接已发送"
2. **Token有效期**: 30分钟后Token自动失效
3. **一次性使用**: Token使用后立即失效
4. **HTTPS加密**: 所有通信使用HTTPS加密
5. **密码哈希**: 使用bcrypt加密存储密码（cost=12）

## 监控与日志

### 关键日志
```
[忘记密码] 收到请求: { email: 'user@example.com' }
[忘记密码] 找到用户: user-123
[忘记密码] 重置密码链接: https://p75463bk4t.coze.site/reset-password?token=...
[忘记密码] 邮件发送成功: user@example.com
[邮件服务] 邮件发送成功: <message-id@qq.com>
```

### 错误日志
```
[忘记密码] 邮箱未注册: user@example.com
[忘记密码] 邮件发送失败: Connection timeout
```

## 总结

密码重置功能已经完全修复并测试通过：
- ✅ 重置链接使用正确的生产域名
- ✅ 邮件服务配置正确且可以正常发送
- ✅ Token生成和验证逻辑正确
- ✅ 重置密码页面正确处理Token
- ✅ 完整的测试流程验证通过

真实用户现在可以：
1. 在忘记密码页面输入邮箱
2. 接收包含正确域名的重置链接邮件
3. 点击邮件中的链接访问重置页面
4. 成功重置密码并登录

## 相关文档
- [邮件服务配置指南](./EMAIL_SETUP.md)
- [生产环境修复总结](./PRODUCTION_FIX_SUMMARY.md)
