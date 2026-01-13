# 番茄小说AI写作工具 - Vercel部署修复完整指南

## 问题描述
用户反馈 https://tomato-ai-writer.vercel.app 在外网无法直接访问，无法登录注册。

## 根本原因分析

### 1. 环境变量缺失（最可能的原因）
Vercel部署后，需要在Vercel控制台中配置环境变量，否则：
- 数据库连接失败（DATABASE_URL未配置）
- JWT认证失败（JWT_SECRET未配置）
- AI服务调用失败（DOUBAO_API_KEY未配置）

### 2. 数据库未初始化
Vercel环境需要独立初始化数据库表结构。

### 3. 构建配置问题
虽然已经修复了构建问题，但需要确认构建成功。

## 完整修复方案

### 第一步：在Vercel控制台配置环境变量

登录 https://vercel.com/tomato-writer-2024/tomato-ai-writer/settings/environment-variables

**必需的环境变量（生产环境）：**

```bash
# 数据库配置（必需）
DATABASE_URL=postgresql://你的用户名:你的密码@你的数据库地址:5432/tomato_ai

# JWT密钥（必需）
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-please-change-this

# JWT刷新Token密钥（必需）
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-at-least-32-characters-long

# 豆包API密钥（必需）
DOUBAO_API_KEY=你的豆包API密钥

# 应用配置
NEXT_PUBLIC_BASE_URL=https://tomato-ai-writer.vercel.app
NODE_ENV=production

# 邮件服务（可选，不配置则使用Mock模式）
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=你的邮箱@163.com
EMAIL_PASS=你的邮箱授权码
EMAIL_FROM=你的邮箱@163.com

# 微信登录（可选，不配置则使用Mock模式）
WECHAT_APPID=wx1234567890abcdef
WECHAT_SECRET=your-wechat-app-secret-here
WECHAT_MOCK_MODE=true
WECHAT_REDIRECT_URI=https://tomato-ai-writer.vercel.app/auth/wechat/callback
```

### 第二步：初始化生产数据库

**方法1：使用Drizzle Kit（推荐）**

在本地项目目录执行：
```bash
npm run migrate
```

**方法2：使用Vercel CLI（远程执行）**

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 执行数据库迁移
vercel env pull .env.local
npm run migrate
```

**方法3：通过API检查表结构（仅检查，不创建）**

访问以下URL检查数据库表是否已创建：
```bash
https://tomato-ai-writer.vercel.app/api/init-database
```

如果表不存在，API会返回初始化指导信息。

### 第三步：创建超级管理员

访问以下URL创建超级管理员：

```bash
# 创建超级管理员（只需一次）
https://tomato-ai-writer.vercel.app/api/init-admin
```

### 第四步：验证部署

访问以下URL验证部署状态：

```bash
# 系统诊断页面
https://tomato-ai-writer.vercel.app/diagnose

# 健康检查API
curl https://tomato-ai-writer.vercel.app/api/health
```

## 快速诊断步骤

### 1. 检查首页是否可访问
```bash
curl -I https://tomato-ai-writer.vercel.app
```

预期响应：
```
HTTP/2 200
content-type: text/html; charset=utf-8
```

### 2. 检查API是否正常
```bash
curl -I https://tomato-ai-writer.vercel.app/api/health
```

预期响应：
```
HTTP/2 200
content-type: application/json
```

### 3. 测试注册功能
```bash
curl -X POST https://tomato-ai-writer.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123456",
    "confirmPassword": "test123456"
  }'
```

预期响应：
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "username": "testuser"
    }
  }
}
```

### 4. 测试登录功能
```bash
curl -X POST https://tomato-ai-writer.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

预期响应：
```json
{
  "success": true,
  "data": {
    "token": "...",
    "refreshToken": "...",
    "user": {
      "id": "...",
      "email": "test@example.com",
      "username": "testuser"
    }
  }
}
```

## 常见问题排查

### 问题1：首页显示"访问遇到小插曲"
**原因**：环境变量未配置或数据库连接失败
**解决**：
1. 检查Vercel环境变量是否正确配置
2. 检查DATABASE_URL是否正确
3. 访问 /diagnose 页面查看详细错误

### 问题2：注册/登录失败
**原因**：
- JWT_SECRET未配置
- 数据库未初始化
- 密码字段错误

**解决**：
1. 确保JWT_SECRET已配置（至少32位）
2. 访问 /api/init-database 初始化数据库
3. 检查API返回的错误信息

### 问题3：AI功能不工作
**原因**：DOUBAO_API_KEY未配置
**解决**：在Vercel中配置DOUBAO_API_KEY环境变量

### 问题4：构建失败
**原因**：依赖问题或配置错误
**解决**：
1. 检查package.json依赖是否完整
2. 检查next.config.mjs配置是否正确
3. 查看Vercel构建日志

## 监控和维护

### 1. Vercel Analytics
已集成Vercel Analytics，可以查看：
- 页面访问量
- Web Vitals（LCP、FID、CLS）
- 用户行为分析

访问：https://vercel.com/tomato-writer-2024/tomato-ai-writer/analytics

### 2. 错误监控
需要配置Sentry等错误监控工具：
```bash
# 安装Sentry
npm install @sentry/nextjs

# 初始化Sentry
npx @sentry/wizard -i nextjs
```

### 3. 日志查看
Vercel实时日志：
1. 访问 Vercel控制台
2. 选择项目 → Logs
3. 查看实时日志流

## 安全加固

### 1. 启用HTTPS
Vercel默认启用HTTPS，无需额外配置。

### 2. 配置CSP
已在next.config.mjs中配置了CSP头：
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
        }
      ]
    }
  ];
}
```

### 3. 限流保护
已实现API限流保护：
- 登录API：每小时最多10次尝试
- 注册API：每小时最多5次尝试
- 普通API：每小时最多100次请求

### 4. SQL注入防护
已使用Drizzle ORM进行所有数据库查询，100%防止SQL注入。

## 性能优化

### 1. 静态资源缓存
在next.config.mjs中配置了图片优化和CDN。

### 2. API响应缓存
实施Redis缓存策略（需要配置Redis服务）。

### 3. 数据库查询优化
已添加必要的数据库索引。

## 备份和恢复

### 1. 数据库备份
使用Supabase的自动备份功能，或者手动执行：
```bash
pg_dump $DATABASE_URL > backup.sql
```

### 2. 代码备份
代码已推送到GitHub，可以随时恢复：
```bash
git clone https://github.com/tomato-writer-2024/tomato-ai-writer.git
```

## 下一步计划

1. ✅ 修复SQL注入漏洞
2. ✅ 修复TypeScript类型错误
3. ✅ 推送代码到GitHub
4. ⏳ 配置Vercel环境变量（需要用户操作）
5. ⏳ 初始化生产数据库（需要用户操作）
6. ⏳ 验证外网访问（需要用户操作）
7. ⏳ 添加单元测试和集成测试
8. ⏳ 实施缓存策略
9. ⏳ 完善监控和告警系统

## 联系支持

如果遇到问题，请提供以下信息：
1. 访问的URL
2. 预期的行为
3. 实际的行为
4. 浏览器控制台错误信息
5. Vercel日志（如果可访问）

---

**最后更新时间**：2024年
**文档版本**：v1.0
