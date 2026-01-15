# Netlify 环境变量配置指南

本指南详细说明了在 Netlify 上部署番茄小说AI写作工具时需要配置的所有环境变量。

---

## 📋 环境变量总览

| 变量名 | 类型 | 是否必填 | 默认值 | 说明 |
|--------|------|---------|--------|------|
| `NEXT_PUBLIC_BASE_URL` | string | 是 | - | 应用的完整 URL |
| `JWT_SECRET` | string | 是 | - | JWT 访问令牌密钥 |
| `JWT_REFRESH_SECRET` | string | 是 | - | JWT 刷新令牌密钥 |
| `DOUBAO_API_KEY` | string | 是 | - | 豆包大模型 API Key |
| `DATABASE_URL` | string | 是 | - | Neon PostgreSQL 连接字符串 |
| `NEXT_PUBLIC_APP_NAME` | string | 否 | 番茄小说AI写作助手 | 应用名称 |
| `DOUBAO_MODEL` | string | 否 | doubao-pro-4k | 豆包模型选择 |
| `EMAIL_HOST` | string | 否 | smtp.163.com | SMTP 服务器地址 |
| `EMAIL_PORT` | number | 否 | 465 | SMTP 端口 |
| `EMAIL_SECURE` | boolean | 否 | true | 是否使用 SSL |
| `EMAIL_USER` | string | 否 | - | 邮箱账号 |
| `EMAIL_PASS` | string | 否 | - | 邮箱授权码 |
| `EMAIL_FROM` | string | 否 | - | 发件人地址 |
| `EMAIL_MOCK_MODE` | boolean | 否 | true | Mock 模式开关 |
| `MAX_FILE_SIZE` | number | 否 | 10485760 | 最大文件上传大小（字节） |
| `ALLOWED_FILE_TYPES` | string | 否 | image/jpeg,image/png,... | 允许的文件类型 |
| `RESET_TOKEN_EXPIRES_IN` | number | 否 | 30 | 密码重置 Token 有效期（分钟） |
| `ACCESS_TOKEN_EXPIRES_IN` | number | 否 | 24 | 访问 Token 有效期（小时） |
| `REFRESH_TOKEN_EXPIRES_IN` | number | 否 | 7 | 刷新 Token 有效期（天） |
| `PASSWORD_MIN_LENGTH` | number | 否 | 8 | 密码最小长度 |
| `RATE_LIMIT_MAX_REQUESTS_PER_HOUR` | number | 否 | 100 | 每小时最大请求次数 |
| `RATE_LIMIT_WINDOW_SECONDS` | number | 否 | 3600 | 限流窗口（秒） |
| `PAYMENT_SUCCESS_REDIRECT` | string | 否 | /workspace | 支付成功跳转地址 |
| `PAYMENT_FAILED_REDIRECT` | string | 否 | /payment?failed=true | 支付失败跳转地址 |
| `LOG_LEVEL` | string | 否 | info | 日志级别 |
| `ENABLE_VERBOSE_LOGGING` | boolean | 否 | false | 是否启用详细日志 |

---

## 🔴 必须配置的环境变量

### 1. NEXT_PUBLIC_BASE_URL

**作用**：指定应用的完整 URL，用于 API 调用、链接生成等。

**配置示例**：
```
开发环境:  http://localhost:5000
生产环境:  https://your-app-name.netlify.app
自定义域名: https://app.yourdomain.com
```

**注意**：
- 必须包含 `http://` 或 `https://`
- 不要以 `/` 结尾
- 部署到 Netlify 后，将默认域名替换为实际域名

---

### 2. JWT_SECRET

**作用**：用于签名和验证 JWT 访问令牌的密钥。

**生成方法**：
- 访问 https://www.uuidgenerator.net/api/guid
- 复制生成的 UUID（示例：`a1b2c3d4-e5f6-7890-abcd-ef1234567890`）
- 或使用在线随机字符串生成器生成 32 位以上字符串

**配置示例**：
```
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

**安全建议**：
- 至少 32 个字符
- 包含大小写字母、数字和特殊符号
- 不要使用容易猜测的密码
- **不要泄露给他人**

---

### 3. JWT_REFRESH_SECRET

**作用**：用于签名和验证 JWT 刷新令牌的密钥，用于在访问令牌过期后获取新的访问令牌。

**生成方法**：与 `JWT_SECRET` 相同，但必须使用不同的值。

**配置示例**：
```
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f
```

**安全建议**：
- 与 `JWT_SECRET` 完全不同
- 至少 32 个字符
- 不要泄露给他人

---

### 4. DOUBAO_API_KEY

**作用**：豆包大模型的 API 密钥，用于调用 AI 写作功能。

**获取步骤**：

1. 访问 [https://www.volcengine.com/](https://www.volcengine.com/)
2. 注册账号并完成实名认证（需要身份证）
3. 登录控制台
4. 搜索"豆包"或访问"火山引擎方舟大模型"
5. 开通豆包大模型服务（新用户有免费额度）
6. 进入"API密钥管理"
7. 点击"创建 API Key"
8. 复制生成的 API Key（格式：`ak-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

**配置示例**：
```
DOUBAO_API_KEY=ak-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**注意事项**：
- 格式通常为 `ak-` 开头
- 不要泄露给他人
- 定期检查 API Key 是否有效
- 注意免费额度的使用情况

---

### 5. DATABASE_URL

**作用**：Neon PostgreSQL 数据库的连接字符串。

**配置示例**（本项目已提供的 Neon 数据库）：
```
DATABASE_URL=postgresql://neondb_owner:npg_9ucFS2HzCGdV@ep-small-salad-a142jglw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**参数说明**：
- `postgresql://`：协议类型
- `neondb_owner`：用户名
- `npg_9ucFS2HzCGdV`：密码
- `ep-small-salad-a142jglw-pooler.ap-southeast-1.aws.neon.tech`：服务器地址（使用 Pooler 模式）
- `neondb`：数据库名
- `sslmode=require`：强制 SSL 连接
- `channel_binding=require`：通道绑定要求

**为什么使用 Pooler 模式**：
- Netlify 免费版函数超时限制为 10 秒
- Pooler 模式使用连接池，减少连接建立时间
- 适合 Serverless 架构

**安全建议**：
- 不要泄露数据库密码
- 定期检查数据库访问日志
- 确保只允许必要的 IP 访问

---

## 🟡 可选但推荐配置的环境变量

### 1. NEXT_PUBLIC_APP_NAME

**作用**：应用的显示名称，用于页面标题、邮件发送等。

**配置示例**：
```
NEXT_PUBLIC_APP_NAME=番茄小说AI写作助手
```

---

### 2. DOUBAO_MODEL

**作用**：指定使用的豆包模型版本。

**可选模型**：

| 模型名称 | 上下文长度 | 特点 | 适用场景 |
|---------|-----------|------|---------|
| `doubao-pro-4k` | 4K | 质量高，响应快 | 短章节、快速生成 |
| `doubao-pro-32k` | 32K | 长上下文 | 中长章节、连贯性要求高 |
| `doubao-pro-128k` | 128K | 超长上下文 | 长篇连载、多章节关联 |
| `doubao-lite-4k` | 4K | 快速响应 | 简单生成、测试 |

**配置示例**：
```
DOUBAO_MODEL=doubao-pro-4k
```

**推荐配置**：
- 短篇/快速生成：`doubao-pro-4k`
- 长篇连载：`doubao-pro-32k`
- 超长篇：`doubao-pro-128k`

---

### 3. 邮件服务配置

邮件服务用于发送注册验证、密码重置、订单通知等邮件。

#### 配置选项

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `EMAIL_HOST` | SMTP 服务器地址 | `smtp.163.com` |
| `EMAIL_PORT` | SMTP 端口 | `465` |
| `EMAIL_SECURE` | 是否使用 SSL | `true` |
| `EMAIL_USER` | 邮箱账号 | `your_email@163.com` |
| `EMAIL_PASS` | 邮箱授权码 | `your_auth_code` |
| `EMAIL_FROM` | 发件人地址 | `番茄小说AI <your_email@163.com>` |
| `EMAIL_MOCK_MODE` | Mock 模式开关 | `false` |

#### 使用 163 邮箱配置

1. 登录 [163 邮箱](https://mail.163.com/)
2. 进入"设置" → "POP3/SMTP/IMAP"
3. 开启"POP3/SMTP服务"
4. 按照提示验证身份（通常需要绑定手机）
5. 获取授权码（不是登录密码！）

**配置示例**：
```
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@163.com
EMAIL_PASS=your_email_authorization_code_here
EMAIL_FROM=番茄小说AI <your_email@163.com>
EMAIL_MOCK_MODE=false
```

#### 使用 QQ 邮箱配置

1. 登录 [QQ 邮箱](https://mail.qq.com/)
2. 进入"设置" → "账户"
3. 开启"POP3/SMTP服务"
4. 按照提示发送短信验证
5. 获取授权码

**配置示例**：
```
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@qq.com
EMAIL_PASS=your_qq_email_authorization_code_here
EMAIL_FROM=番茄小说AI <your_email@qq.com>
EMAIL_MOCK_MODE=false
```

#### 使用 Gmail 配置

1. 登录 [Gmail](https://mail.google.com/)
2. 进入"设置" → "安全性"
3. 开启"两步验证"
4. 生成"应用专用密码"

**配置示例**：
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=番茄小说AI <your_email@gmail.com>
EMAIL_MOCK_MODE=false
```

#### Mock 模式

如果不配置邮件服务或测试时，可以开启 Mock 模式：

```
EMAIL_MOCK_MODE=true
```

**Mock 模式效果**：
- 邮件不会真实发送
- 邮件内容会打印到控制台日志
- 适合开发和测试环境

---

## 🔵 系统配置环境变量

### 1. 安全配置

| 变量名 | 说明 | 默认值 | 建议值 |
|--------|------|--------|--------|
| `RESET_TOKEN_EXPIRES_IN` | 密码重置 Token 有效期（分钟） | 30 | 30 |
| `ACCESS_TOKEN_EXPIRES_IN` | 访问 Token 有效期（小时） | 24 | 24 |
| `REFRESH_TOKEN_EXPIRES_IN` | 刷新 Token 有效期（天） | 7 | 7 |
| `PASSWORD_MIN_LENGTH` | 密码最小长度 | 8 | 8 |

**配置示例**：
```
RESET_TOKEN_EXPIRES_IN=30
ACCESS_TOKEN_EXPIRES_IN=24
REFRESH_TOKEN_EXPIRES_IN=7
PASSWORD_MIN_LENGTH=8
```

---

### 2. 限流配置

防止 API 被滥用。

| 变量名 | 说明 | 默认值 | 建议值 |
|--------|------|--------|--------|
| `RATE_LIMIT_MAX_REQUESTS_PER_HOUR` | 每小时最大请求次数 | 100 | 100 |
| `RATE_LIMIT_WINDOW_SECONDS` | 限流窗口（秒） | 3600 | 3600 |

**配置示例**：
```
RATE_LIMIT_MAX_REQUESTS_PER_HOUR=100
RATE_LIMIT_WINDOW_SECONDS=3600
```

**注意事项**：
- 超过限制后返回 429 错误
- 限流按 IP 地址计算
- 超级管理员不受限流限制

---

### 3. 文件上传配置

| 变量名 | 说明 | 默认值 | 建议值 |
|--------|------|--------|--------|
| `MAX_FILE_SIZE` | 最大文件上传大小（字节） | 10485760 (10MB) | 10485760 |
| `ALLOWED_FILE_TYPES` | 允许的文件类型 | 见下方 | 见下方 |

**配置示例**：
```
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

**文件类型说明**：
- `image/jpeg`：JPEG 图片
- `image/png`：PNG 图片
- `image/gif`：GIF 图片
- `application/pdf`：PDF 文档

---

### 4. 支付配置

| 变量名 | 说明 | 默认值 | 建议值 |
|--------|------|--------|--------|
| `PAYMENT_SUCCESS_REDIRECT` | 支付成功后跳转地址 | /workspace | /workspace |
| `PAYMENT_FAILED_REDIRECT` | 支付失败后跳转地址 | /payment?failed=true | /payment?failed=true |

**配置示例**：
```
PAYMENT_SUCCESS_REDIRECT=/workspace
PAYMENT_FAILED_REDIRECT=/payment?failed=true
```

---

### 5. 日志配置

| 变量名 | 说明 | 默认值 | 建议值 |
|--------|------|--------|--------|
| `LOG_LEVEL` | 日志级别 | info | info |
| `ENABLE_VERBOSE_LOGGING` | 是否启用详细日志 | false | false |

**日志级别说明**：
- `error`：仅错误
- `warn`：警告和错误
- `info`：一般信息、警告和错误
- `debug`：所有信息（包括调试）

**配置示例**：
```
LOG_LEVEL=info
ENABLE_VERBOSE_LOGGING=false
```

**生产环境建议**：
- `LOG_LEVEL=info`
- `ENABLE_VERBOSE_LOGGING=false`

**开发环境建议**：
- `LOG_LEVEL=debug`
- `ENABLE_VERBOSE_LOGGING=true`

---

## 🚀 Netlify 环境变量配置步骤

### 方法 1：通过 Netlify 网页界面配置

1. 登录 [https://app.netlify.com](https://app.netlify.com)
2. 选择你的站点
3. 点击左侧菜单 **"Site configuration"**
4. 选择 **"Environment variables"** 选项卡
5. 点击 **"Add an environment variable"**
6. 输入变量名和值
7. 点击 **"Save"**
8. 重复步骤 5-7 添加所有环境变量

### 方法 2：使用 Netlify CLI 配置

```bash
# 安装 Netlify CLI（如果未安装）
npm install -g netlify-cli

# 登录 Netlify
netlify login

# 设置环境变量
netlify env:set JWT_SECRET "your-super-secret-jwt-key"
netlify env:set JWT_REFRESH_SECRET "your-refresh-token-key"
netlify env:set DOUBAO_API_KEY "your-doubao-api-key"
netlify env:set DATABASE_URL "your-database-url"
netlify env:set NEXT_PUBLIC_BASE_URL "https://your-app.netlify.app"

# 查看所有环境变量
netlify env:list
```

### 方法 3：使用 netlify.toml 配置

```toml
[build]
  command = "pnpm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "24"
  NPM_FLAGS = "--legacy-peer-deps"
  JWT_SECRET = "your-super-secret-jwt-key"
  JWT_REFRESH_SECRET = "your-refresh-token-key"

[context.production.environment]
  NEXT_PUBLIC_BASE_URL = "https://your-app.netlify.app"
  DATABASE_URL = "your-database-url"
  DOUBAO_API_KEY = "your-doubao-api-key"

[context.deploy-preview.environment]
  EMAIL_MOCK_MODE = "true"
```

**注意**：不推荐在 `netlify.toml` 中配置敏感信息（如 API Key、数据库密码），因为该文件会被提交到 Git 仓库。

---

## 🎯 不同环境的配置策略

### 开发环境（本地）

使用 `.env.local` 文件（不提交到 Git）：

```bash
NEXT_PUBLIC_BASE_URL=http://localhost:5000
JWT_SECRET=dev-jwt-secret-key
JWT_REFRESH_SECRET=dev-refresh-secret-key
DOUBAO_API_KEY=your-doubao-api-key
DATABASE_URL=postgresql://localhost:5432/tomato_ai
EMAIL_MOCK_MODE=true
LOG_LEVEL=debug
ENABLE_VERBOSE_LOGGING=true
```

### 生产环境（Netlify）

在 Netlify 环境变量中配置：

```bash
NEXT_PUBLIC_BASE_URL=https://your-app.netlify.app
JWT_SECRET=prod-jwt-secret-key-very-long-and-secure
JWT_REFRESH_SECRET=prod-refresh-secret-key-very-long-and-secure
DOUBAO_API_KEY=your-doubao-api-key
DATABASE_URL=postgresql://neondb_owner:password@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
EMAIL_MOCK_MODE=false
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@163.com
EMAIL_PASS=your_email_auth_code
EMAIL_FROM=番茄小说AI <your_email@163.com>
LOG_LEVEL=info
ENABLE_VERBOSE_LOGGING=false
```

### 预览环境（Pull Request）

在 Netlify 环境变量中配置（作用域：Deploy preview）：

```bash
NEXT_PUBLIC_BASE_URL=https://deploy-preview-xxx--your-app.netlify.app
EMAIL_MOCK_MODE=true
LOG_LEVEL=debug
```

---

## 🔒 安全最佳实践

1. **不要在代码中硬编码敏感信息**
   ```bash
   # ❌ 错误
   const apiKey = "ak-xxxxxxxxxxxxxxxx"
   
   # ✅ 正确
   const apiKey = process.env.DOUBAO_API_KEY
   ```

2. **不要将 `.env.local` 文件提交到 Git**
   ```
   # .gitignore
   .env.local
   .env.*.local
   ```

3. **使用不同的密钥用于不同环境**
   - 开发环境和生产环境使用不同的 JWT_SECRET
   - 预览环境可以使用 Mock 模式的密钥

4. **定期轮换密钥**
   - 每季度更换 JWT_SECRET
   - API Key 泄露后立即更换

5. **限制环境变量的作用域**
   - 生产环境变量不要设置为 "All"
   - 预览环境使用 Mock 模式

6. **监控环境变量的使用**
   - 定期检查 Netlify Functions 日志
   - 发现异常立即排查

---

## ✅ 配置验证清单

在部署前，确保以下配置已完成：

- [ ] `NEXT_PUBLIC_BASE_URL` 已配置且包含域名
- [ ] `JWT_SECRET` 已配置且至少 32 位
- [ ] `JWT_REFRESH_SECRET` 已配置且至少 32 位
- [ ] `DOUBAO_API_KEY` 已配置且格式正确（`ak-` 开头）
- [ ] `DATABASE_URL` 已配置且包含 Neon 连接字符串
- [ ] `NEXT_PUBLIC_APP_NAME` 已配置（可选）
- [ ] `DOUBAO_MODEL` 已配置（可选）
- [ ] 邮件服务已配置或 `EMAIL_MOCK_MODE=true`（至少选一个）
- [ ] `PASSWORD_MIN_LENGTH` 已配置（可选）
- [ ] `RATE_LIMIT_MAX_REQUESTS_PER_HOUR` 已配置（可选）
- [ ] `MAX_FILE_SIZE` 已配置（可选）
- [ ] `ALLOWED_FILE_TYPES` 已配置（可选）
- [ ] `LOG_LEVEL` 已配置（可选）
- [ ] `ENABLE_VERBOSE_LOGGING` 已配置（可选）

---

## 🔧 故障排查

### 问题 1：环境变量未生效

**症状**：API 报错提示环境变量未定义

**排查步骤**：

1. 检查 Netlify Functions 日志
   ```bash
   netlify logs
   ```

2. 验证环境变量是否已设置
   ```bash
   netlify env:list
   ```

3. 重新部署站点
   - 在 Netlify 控制台点击 **"Trigger deploy"**
   - 选择 **"Deploy site"**

4. 检查变量名拼写是否正确（区分大小写）

### 问题 2：数据库连接失败

**症状**：API 返回 500 错误，日志显示数据库连接失败

**排查步骤**：

1. 验证 `DATABASE_URL` 格式是否正确
2. 检查 Neon 数据库是否在线
3. 确认使用的是 Pooler 模式（包含 `-pooler`）
4. 检查 SSL 配置是否正确（`sslmode=require`）

### 问题 3：AI 功能无响应

**症状**：AI 写作功能调用后无响应或超时

**排查步骤**：

1. 检查 `DOUBAO_API_KEY` 是否有效
2. 验证 API Key 是否过期
3. 检查 Netlify Functions 是否超时（限制 10 秒）
4. 查看浏览器控制台错误信息

### 问题 4：邮件发送失败

**症状**：注册或密码重置后收不到邮件

**排查步骤**：

1. 检查 `EMAIL_MOCK_MODE` 是否为 `false`
2. 验证 SMTP 配置是否正确
3. 确认邮箱授权码是否有效
4. 检查垃圾邮件文件夹
5. 查看 Netlify Functions 日志

---

## 📚 相关文档

- [Netlify 环境变量文档](https://docs.netlify.com/site-settings/deploys/#environment-variables)
- [Next.js 环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)
- [Neon PostgreSQL 文档](https://neon.tech/docs)
- [豆包大模型文档](https://www.volcengine.com/docs/82379)

---

**配置完成后，记得重新部署站点以使环境变量生效！** 🚀
