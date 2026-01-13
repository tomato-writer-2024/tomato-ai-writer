# Vercel部署完整指南

## 前提条件

1. 已有GitHub仓库并推送代码
2. 已注册Vercel账号（支持GitHub账号登录）
3. 已有PostgreSQL数据库（推荐使用Supabase，免费且稳定）

## 第一步：配置Vercel项目

### 1.1 导入项目到Vercel

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New" → "Project"
3. 选择GitHub仓库：`tomato-writer-2024/tomato-ai-writer`
4. 点击 "Import"

### 1.2 配置项目设置

在Vercel项目配置页面，设置以下参数：

**Build Settings:**
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

**Environment Variables:**（关键步骤）

在 "Environment Variables" 部分添加以下环境变量：

#### 必需的环境变量：

```bash
# 数据库配置（必需）
DATABASE_URL=postgresql://username:password@host:5432/database_name

# JWT密钥（必需，请使用强随机字符串）
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# 应用基础配置
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=番茄小说AI写作助手
NEXT_PUBLIC_BASE_URL=https://tomato-ai-writer.vercel.app
```

#### 可选的环境变量（用于生产环境）：

```bash
# 邮件服务（可选）
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@163.com
EMAIL_PASS=your-email-authorization-code
EMAIL_FROM=your-email@163.com

# 微信登录（可选）
WECHAT_APPID=wx1234567890abcdef
WECHAT_SECRET=your-wechat-app-secret-here
WECHAT_MOCK_MODE=true
WECHAT_REDIRECT_URI=https://tomato-ai-writer.vercel.app/auth/wechat/callback

# 豆包大模型（必需，用于AI功能）
DOUBAO_API_KEY=your-doubao-api-key-here
DOUBAO_MODEL=doubao-pro-4k

# 对象存储（可选，用于文件存储）
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=your-s3-access-key-id
S3_SECRET_KEY=your-s3-secret-key
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
```

### 1.3 部署项目

1. 点击 "Deploy" 按钮
2. 等待部署完成（通常需要2-5分钟）
3. 部署成功后，你会获得一个 `.vercel.app` 域名
4. 默认域名：`https://tomato-ai-writer.vercel.app`

## 第二步：配置数据库

### 2.1 使用Supabase（推荐，完全免费）

1. 注册 [Supabase](https://supabase.com)
2. 创建新项目
3. 进入项目设置 → Database
4. 获取连接字符串（URI格式）

**Supabase连接字符串格式：**
```
postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-ID].supabase.co:5432/postgres
```

### 2.2 运行数据库迁移

使用以下任一方式创建数据库表：

#### 方式1：使用Vercel终端（推荐）

1. 在Vercel项目页面，点击 "Deployments" → 选择最新部署
2. 点击 "..." → "Open Terminal"
3. 运行以下命令：

```bash
# 创建数据库表
npx tsx src/scripts/migrate.ts

# 创建超级管理员
npx tsx src/scripts/init-super-admin.ts
```

#### 方式2：使用SQL脚本

在Supabase的SQL编辑器中运行 `src/scripts/init-database.sql` 中的所有SQL语句。

### 2.3 验证数据库配置

访问以下URL检查数据库配置：

```
https://tomato-ai-writer.vercel.app/api/diagnose
```

应该看到类似以下响应：

```json
{
  "success": true,
  "data": {
    "checks": {
      "database": {
        "status": "连接成功"
      },
      "adminUser": {
        "status": "存在"
      }
    }
  }
}
```

## 第三步：验证部署

### 3.1 检查首页

访问：https://tomato-ai-writer.vercel.app

应该看到番茄小说AI写作助手的主页。

### 3.2 测试登录功能

使用以下命令测试登录：

```bash
curl -X POST https://tomato-ai-writer.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "208343256@qq.com",
    "password": "TomatoAdmin@2024"
  }'
```

应该返回：

```json
{
  "success": true,
  "data": {
    "token": "...",
    "refreshToken": "...",
    "user": {
      "id": "...",
      "email": "208343256@qq.com",
      "username": "测试用户",
      "role": "DEVELOPER",
      "membershipLevel": "PREMIUM"
    }
  }
}
```

### 3.3 测试用户统计API

```bash
# 先获取token
TOKEN=$(curl -s -X POST https://tomato-ai-writer.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"208343256@qq.com","password":"TomatoAdmin@2024"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 测试用户统计API
curl https://tomato-ai-writer.vercel.app/api/user/stats \
  -H "Authorization: Bearer $TOKEN"
```

### 3.4 访问工作台

在浏览器中访问：

https://tomato-ai-writer.vercel.app/workspace

使用超级管理员账号登录后，应该能看到工作台界面。

## 第四步：配置自定义域名（可选）

### 4.1 添加域名

1. 在Vercel项目设置中，进入 "Domains"
2. 点击 "Add Domain"
3. 输入你的域名（如：`example.com`）
4. 按照提示配置DNS记录

### 4.2 更新环境变量

将 `NEXT_PUBLIC_BASE_URL` 更新为你的自定义域名：

```bash
NEXT_PUBLIC_BASE_URL=https://example.com
```

## 第五步：监控和维护

### 5.1 查看部署日志

1. 进入Vercel项目
2. 点击 "Deployments"
3. 选择任意部署，点击 "Build Logs" 或 "Server Logs"

### 5.2 查看实时日志

在项目设置中，启用 "Realtime Logs"，可以实时查看应用程序日志。

### 5.3 性能监控

Vercel提供内置的性能监控，可以在项目设置中查看：
- Analytics（分析）
- Speed Insights（速度洞察）
- Edge Network（边缘网络）

## 常见问题排查

### 问题1：登录失败，提示"邮箱或密码错误"

**可能原因：**
- 数据库未正确配置
- 用户未创建
- 密码字段名称错误

**解决方案：**
1. 访问 `/api/diagnose` 检查数据库连接
2. 检查 `adminUser` 是否存在
3. 确认使用了正确的密码：`TomatoAdmin@2024`

### 问题2：页面显示"访问遇到小插曲"

**可能原因：**
- 部署失败
- 环境变量缺失
- 数据库连接失败

**解决方案：**
1. 检查Vercel部署日志
2. 确认所有必需的环境变量都已配置
3. 访问 `/api/diagnose` 进行诊断

### 问题3：数据库连接超时

**可能原因：**
- `DATABASE_URL` 格式错误
- 数据库不允许Vercel IP访问
- 数据库网络策略限制

**解决方案：**
1. 验证 `DATABASE_URL` 格式正确
2. 在数据库设置中允许所有IP访问（或添加Vercel的IP段）
3. 检查数据库防火墙设置

### 问题4：API返回404

**可能原因：**
- API路由未正确部署
- 构建过程中出现错误

**解决方案：**
1. 检查 `next.config.mjs` 配置
2. 查看构建日志
3. 确保API文件位于 `src/app/api/` 目录下

### 问题5：环境变量不生效

**可能原因：**
- 环境变量未添加到所有环境
- 环境变量名称拼写错误

**解决方案：**
1. 在Vercel项目设置中，确保环境变量已添加到 `Production`、`Preview`、`Development` 所有环境
2. 检查环境变量名称是否与代码中使用的名称一致
3. 重新部署项目以应用环境变量更改

## 性能优化建议

### 1. 启用Edge Functions

在API路由中添加 `export const runtime = 'edge'` 以启用边缘函数：

```typescript
export const runtime = 'edge';
```

### 2. 使用图片优化

Next.js内置图片优化，使用 `<Image>` 组件替代 `<img>`：

```typescript
import Image from 'next/image';

<Image src="/logo.png" width={200} height={200} alt="Logo" />
```

### 3. 配置CDN

Vercel自动提供CDN加速，无需额外配置。

### 4. 使用缓存策略

在API路由中添加适当的缓存头：

```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  },
});
```

## 安全建议

### 1. 使用强密码

确保 `JWT_SECRET` 至少32位，使用强随机字符串。

### 2. 限制API访问

在API路由中添加速率限制和身份验证。

### 3. 定期更新依赖

运行 `npm audit` 检查安全漏洞，及时更新依赖包。

### 4. 启用HTTPS

Vercel自动提供HTTPS，无需额外配置。

## 成本估算

使用Vercel的Hobby计划，完全免费：

- **带宽**：100GB/月
- **构建时间**：6000分钟/月
- **Serverless Functions**：无限制（但执行时间有限制）
- **团队成员**：1人

如果需要更高配置，可以升级到Pro计划（$20/月）。

## 下一步

1. 配置邮件服务以支持密码重置
2. 配置微信登录以支持OAuth登录
3. 配置豆包大模型以启用AI写作功能
4. 配置对象存储以支持文件上传
5. 配置自定义域名
6. 添加监控和告警

## 技术支持

如遇到问题，请：

1. 查看 [Vercel文档](https://vercel.com/docs)
2. 查看项目 [GitHub Issues](https://github.com/tomato-writer-2024/tomato-ai-writer/issues)
3. 访问诊断API：`https://tomato-ai-writer.vercel.app/api/diagnose`

## 更新日志

- 2026-01-13: 创建初始部署指南
- 2026-01-13: 添加诊断API和故障排查
