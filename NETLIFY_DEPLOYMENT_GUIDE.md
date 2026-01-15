# 番茄小说AI写作工具 - Netlify 部署完整指南

## 📋 部署前准备

### 1. 确认环境配置

首先检查以下文件是否存在且配置正确：

```bash
# 检查关键文件
ls -la netlify.toml
ls -la package.json
ls -la .env.production.example

# 验证 Git 远程仓库
git remote -v
```

### 2. 确认包管理器

本项目使用 **pnpm** 作为包管理器，已在 `netlify.toml` 中配置。

---

## 🚀 Netlify 部署步骤

### 步骤 1：登录 Netlify

访问 [https://app.netlify.com](https://app.netlify.com) 并登录你的账号。

### 步骤 2：添加新站点

1. 点击控制台右上角的 **"Add new site"** 按钮
2. 选择 **"Import an existing project"**

### 步骤 3：连接 Git 仓库

1. 选择 **"GitHub"** 作为 Git 提供商
2. 如果是首次连接，Netlify 会请求授权 GitHub 账号
3. 授权后，在仓库列表中找到 **`tomato-writer-2024/tomato-ai-writer`**
4. 点击该仓库下方的 **"Import"** 按钮

### 步骤 4：配置构建设置

在 "Build and deploy" 页面，输入以下配置：

#### 构建配置

```
Build command:        pnpm run build
Publish directory:    .next
Branch to deploy:     main (或 master)
```

#### 高级构建设置（可选）

点击 "Show advanced" 按钮，可以配置：
- **Build environment variables**：这里也可以设置环境变量
- **Branches**：配置自动部署的分支
- **Context**：为不同环境配置不同设置

Netlify 会自动检测项目根目录下的 `netlify.toml` 文件并应用配置：
```toml
[build]
  command = "pnpm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "24"
  NPM_FLAGS = "--legacy-peer-deps"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 步骤 5：配置环境变量（关键步骤）

#### 5.1 找到环境变量配置

在站点配置页面：
1. 点击左侧菜单中的 **"Site configuration"**
2. 选择 **"Environment variables"** 选项卡
3. 点击 **"Add an environment variable"** 按钮

#### 5.2 必需的环境变量

根据 `.env.production.example` 文件，添加以下环境变量：

##### 🔴 必须配置的变量

| 变量名 | 说明 | 示例值 | 是否必填 |
|--------|------|--------|---------|
| `NEXT_PUBLIC_BASE_URL` | 应用域名 | `https://your-app.netlify.app` | 是 |
| `JWT_SECRET` | JWT访问Token密钥 | 32位以上随机字符串 | 是 |
| `JWT_REFRESH_SECRET` | JWT刷新Token密钥 | 32位以上随机字符串 | 是 |
| `DOUBAO_API_KEY` | 豆包大模型API Key | `ak-xxxxxxxxxx` | 是 |
| `DATABASE_URL` | Neon数据库连接字符串 | 见下方说明 | 是 |

##### 🟡 可选但建议配置的变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | `番茄小说AI写作助手` |
| `DOUBAO_MODEL` | 豆包模型选择 | `doubao-pro-4k` |
| `EMAIL_HOST` | SMTP服务器 | `smtp.163.com` |
| `EMAIL_PORT` | SMTP端口 | `465` |
| `EMAIL_SECURE` | 是否SSL | `true` |
| `EMAIL_USER` | 邮箱账号 | `your_email@163.com` |
| `EMAIL_PASS` | 邮箱授权码 | `your_auth_code` |
| `EMAIL_FROM` | 发件人地址 | `番茄小说AI <your_email@163.com>` |
| `EMAIL_MOCK_MODE` | Mock模式开关 | `false` |

#### 5.3 环境变量配置详情

##### 数据库配置（Neon PostgreSQL）

```bash
DATABASE_URL=postgresql://neondb_owner:npg_9ucFS2HzCGdV@ep-small-salad-a142jglw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**说明**：
- 这是 Neon PostgreSQL 的连接字符串
- 使用 Pooler 模式以适应 Netlify 10秒超时限制
- 支持 IPv4 连接
- 包含 SSL 和 channel_binding 配置

##### JWT 密钥生成

访问以下任一网站生成 32 位以上随机字符串：
- https://www.uuidgenerator.net/api/guid
- https://www.random.org/strings/

示例：
```bash
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f
```

##### 豆包 API Key 获取

1. 访问 [https://www.volcengine.com/](https://www.volcengine.com/)
2. 注册账号并完成实名认证
3. 登录控制台，搜索"豆包"
4. 开通豆包大模型服务（新用户免费）
5. 在"API密钥管理"中创建并复制 API Key

##### 邮件服务配置（可选）

如果不需要真实邮件功能，可以设置：
```bash
EMAIL_MOCK_MODE=true
```

如果需要真实邮件功能（以 163 邮箱为例）：

1. 登录 163 邮箱
2. 进入"设置" → "POP3/SMTP/IMAP"
3. 开启 POP3/SMTP 服务
4. 生成授权码（不是登录密码！）

配置示例：
```bash
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@163.com
EMAIL_PASS=your_email_authorization_code_here
EMAIL_FROM=番茄小说AI <your_email@163.com>
EMAIL_MOCK_MODE=false
```

##### 安全配置

```bash
RESET_TOKEN_EXPIRES_IN=30
ACCESS_TOKEN_EXPIRES_IN=24
REFRESH_TOKEN_EXPIRES_IN=7
PASSWORD_MIN_LENGTH=8
```

##### 限流配置

```bash
RATE_LIMIT_MAX_REQUESTS_PER_HOUR=100
RATE_LIMIT_WINDOW_SECONDS=3600
```

##### 文件上传配置

```bash
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

##### 支付配置

```bash
PAYMENT_SUCCESS_REDIRECT=/workspace
PAYMENT_FAILED_REDIRECT=/payment?failed=true
```

##### 日志配置

```bash
LOG_LEVEL=info
ENABLE_VERBOSE_LOGGING=false
```

#### 5.4 环境变量作用域

Netlify 支持为不同环境配置不同的变量值：
- **All**：所有环境都使用此值
- **Production**：仅生产环境使用
- **Deploy preview**：仅预览部署使用
- **Branch deploys**：仅特定分支部署使用

**建议**：
- `NODE_ENV` 设置为 `production`（作用域：Production）
- `DATABASE_URL` 设置为 Neon 生产数据库（作用域：Production）
- `EMAIL_MOCK_MODE` 设置为 `true`（作用域：Deploy preview）

### 步骤 6：部署站点

1. 检查所有配置是否正确
2. 点击 **"Deploy site"** 按钮
3. Netlify 将自动：
   - 克隆 GitHub 仓库
   - 使用 pnpm 安装依赖
   - 执行 `pnpm run build` 构建项目
   - 部署到 Netlify CDN

### 步骤 7：监控部署过程

1. 点击 **"Deploys"** 选项卡
2. 查看最新的部署日志
3. 等待部署完成（通常需要 2-5 分钟）

**部署成功的标志**：
- 状态显示为 "Published"
- 绿色的对勾标记
- URL 可以正常访问

---

## ✅ 部署后验证

### 1. 访问应用

Netlify 会自动分配一个域名，格式为：
```
https://your-site-name-xxxxx.netlify.app
```

如果配置了自定义域名，访问你的自定义域名。

### 2. 验证核心功能

依次测试以下功能：

#### 用户认证
- [ ] 访问 `/login` 页面
- [ ] 注册新用户
- [ ] 登录系统
- [ ] 验证 Token 是否正常生成

#### AI 写作功能
- [ ] 创建新小说
- [ ] 测试章节撰写功能
- [ ] 测试精修润色功能
- [ ] 测试智能续写功能
- [ ] 验证 AI 响应时间 < 1 秒

#### 社区功能
- [ ] 发布帖子
- [ ] 点赞/评论
- [ ] 搜索功能

#### 管理后台
- [ ] 访问 `/admin/login`
- [ ] 登录超级管理员账号
- [ ] 查看订单管理
- [ ] 查看数据统计

#### 邮件通知
- [ ] 测试忘记密码功能
- [ ] 测试订单通知

### 3. 检查日志

在 Netlify 控制台：
1. 点击 **"Functions"** → **"functions logs"**
2. 查看是否有错误日志
3. 检查 API 响应是否正常

### 4. 性能检查

1. 使用 Chrome DevTools (F12) 检查：
   - 首屏加载时间
   - Network 请求状态
   - 控制台是否有错误

2. 使用 [https://pagespeed.web.dev/](https://pagespeed.web.dev/) 检查性能评分

---

## 🔧 常见问题排查

### 问题 1：构建失败

**症状**：部署日志显示构建错误

**排查步骤**：

```bash
# 1. 检查本地是否能构建成功
pnpm install
pnpm run build

# 2. 检查 Node 版本
node --version  # 应该是 v24.x.x
pnpm --version

# 3. 检查依赖是否正确安装
ls node_modules
```

**常见原因**：
- 依赖版本冲突
- TypeScript 类型错误
- 环境变量未正确配置

### 问题 2：API 路由 500 错误

**症状**：前端调用 API 时返回 500 错误

**排查步骤**：

1. 检查 Netlify Functions 日志
2. 确认环境变量是否正确配置
3. 检查数据库连接字符串
4. 验证 Neon 数据库是否在线

```bash
# 测试数据库连接
curl -X POST https://your-site.netlify.app/api/debug/test-db-connection
```

### 问题 3：登录后立即退出

**症状**：用户登录后立即被踢出

**可能原因**：
- JWT_SECRET 配置错误
- Token 过期时间配置错误
- 时区问题

**解决方案**：
```bash
# 确认 Token 过期时间配置正确
ACCESS_TOKEN_EXPIRES_IN=24
REFRESH_TOKEN_EXPIRES_IN=7
```

### 问题 4：AI 生成无响应

**症状**：调用 AI 写作功能没有响应

**排查步骤**：

1. 检查 `DOUBAO_API_KEY` 是否正确
2. 验证 API Key 是否有效（未过期）
3. 检查网络连接
4. 查看浏览器控制台错误信息

```bash
# 测试 API 连接
curl -X POST https://your-site.netlify.app/api/debug/ai-test
```

### 问题 5：邮件发送失败

**症状**：注册或密码重置时收不到邮件

**排查步骤**：

1. 检查 `EMAIL_MOCK_MODE` 是否为 `false`
2. 验证 SMTP 配置是否正确
3. 确认邮箱授权码是否有效
4. 检查垃圾邮件文件夹

**临时解决方案**：
```bash
# 开启 Mock 模式
EMAIL_MOCK_MODE=true
```

### 问题 6：部署速度慢

**症状**：部署时间超过 10 分钟

**优化方案**：

1. 检查 `node_modules` 是否被提交到 Git
   ```bash
   git status  # 不应包含 node_modules
   ```

2. 确保 `.gitignore` 正确配置
   ```
   node_modules/
   .next/
   .env.local
   ```

3. 启用 Netlify 缓存
   - 在 `netlify.toml` 中已自动配置

---

## 📊 监控与优化

### 性能监控

Netlify 内置了监控功能：

1. **Bandwidth**：流量使用情况
2. **Build minutes**：构建时间使用
3. **Functions**：函数调用次数和响应时间

### 免费版限制

Netlify 免费版限制：
- 带宽：100GB/月
- 构建时间：300 分钟/月
- Functions：125,000 次调用/月
- 站点：无限个

**优化建议**：
- 优化图片大小（使用 WebP 格式）
- 启用 CDN 缓存
- 减少 API 调用次数

---

## 🔄 持续部署

### 自动部署配置

Netlify 默认配置了自动部署：
- 推送到 `main` 分支 → 生产环境部署
- 推送到其他分支 → 预览部署

### 自定义分支部署

如果需要为特定分支配置部署：

1. 进入 **Site configuration** → **Build & deploy** → **Continuous Deployment**
2. 找到 **"Branches"** 部分
3. 点击 **"Edit settings"**
4. 添加分支和部署规则

---

## 🌐 自定义域名配置

### 绑定自定义域名

1. 进入 **Domain management**
2. 点击 **"Add custom domain"**
3. 输入你的域名（如 `app.yourdomain.com`）
4. 按照提示配置 DNS 记录

### DNS 配置示例

| 类型 | 名称 | 值 |
|------|------|-----|
| CNAME | app | your-site-name.netlify.app |

### HTTPS 自动配置

Netlify 会自动为自定义域名配置 SSL 证书（Let's Encrypt），无需手动配置。

---

## 📝 部署检查清单

部署前必须确认以下事项：

- [ ] Git 远程仓库已正确配置
- [ ] `netlify.toml` 文件存在且配置正确
- [ ] `.env.production.example` 已转换为实际环境变量
- [ ] `JWT_SECRET` 和 `JWT_REFRESH_SECRET` 已配置
- [ ] `DOUBAO_API_KEY` 已配置且有效
- [ ] `DATABASE_URL` 已配置（Neon PostgreSQL）
- [ ] 邮件服务已配置（或开启 Mock 模式）
- [ ] 本地 `pnpm run build` 成功
- [ ] TypeScript 类型检查通过（`pnpm run type-check`）
- [ ] 所有测试通过（`pnpm test`）

部署后必须验证以下事项：

- [ ] 站点可以正常访问
- [ ] 用户注册/登录功能正常
- [ ] AI 写作功能正常
- [ ] 社区功能正常
- [ ] 管理后台功能正常
- [ ] 邮件通知功能正常（或 Mock 模式生效）
- [ ] 控制台无错误信息
- [ ] API 响应正常
- [ ] 数据库连接正常

---

## 🎯 快速部署命令

如果你有 Netlify CLI 工具，可以使用命令行部署：

### 安装 Netlify CLI

```bash
# 全局安装 Netlify CLI
npm install -g netlify-cli

# 登录 Netlify
netlify login
```

### 初始化站点

```bash
# 在项目根目录执行
netlify init

# 选择：
# 1. &Create & configure a new site
# 2. 选择你的团队
# 3. 确认站点名称
```

### 部署

```bash
# 手动部署
netlify deploy --prod

# 自动部署（推送代码后）
git push origin main
```

### 查看部署日志

```bash
netlify logs
```

---

## 📞 技术支持

如遇到部署问题，可以：

1. 查看 [Netlify 文档](https://docs.netlify.com/)
2. 查看 [Next.js 部署指南](https://nextjs.org/docs/deployment)
3. 检查项目的 GitHub Issues
4. 查看 Netlify Functions 日志

---

## 🎉 部署成功标志

当你的应用满足以下条件时，说明部署成功：

✅ 访问自定义域名或 Netlify 域名可以正常显示页面
✅ 用户可以注册和登录
✅ AI 写作功能正常响应（< 1秒）
✅ 社区功能完整可用
✅ 管理后台可以正常访问和管理
✅ 所有 API 返回正确的 JSON 格式
✅ 数据库读写正常
✅ 无控制台错误
✅ 性能评分 > 90

---

**部署完成后，你的番茄小说AI写作工具就可以对外提供服务了！** 🚀
