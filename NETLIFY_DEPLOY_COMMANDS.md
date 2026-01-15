# Netlify 部署命令执行完整步骤

本文档提供了在 Netlify 上部署番茄小说AI写作工具的完整命令执行步骤。

---

## 📋 前置准备

### 1. 确认 Git 仓库状态

首先检查 Git 仓库是否正确配置：

```bash
# 查看当前分支
git branch
# 应该显示：* main

# 查看远程仓库
git remote -v
# 应该显示 GitHub 仓库地址

# 查看最新提交
git log --oneline -5
# 应该包含最新的提交记录

# 检查是否有未提交的更改
git status
# 应该显示：nothing to commit, working tree clean
```

### 2. 验证项目配置

```bash
# 检查 netlify.toml 是否存在
ls -la netlify.toml
# 应该显示文件存在

# 检查 package.json 中的脚本
cat package.json | grep -A 10 "scripts"
# 应该包含 build 脚本："build": "next build"

# 检查 Next.js 版本
cat package.json | grep '"next"'
# 应该显示："next": "16.0.10"
```

### 3. 验证包管理器

```bash
# 检查 pnpm 是否安装
pnpm --version
# 应该显示 pnpm 版本号（如 9.x.x）

# 如果未安装，执行以下命令：
npm install -g pnpm
```

---

## 🚀 Netlify 部署命令步骤

### 步骤 1：访问 Netlify 控制台

在浏览器中打开：

```
https://app.netlify.com
```

登录你的 Netlify 账号（如果没有账号，点击 "Sign up" 注册）。

### 步骤 2：添加新站点

在 Netlify 控制台首页：

1. 点击右上角的 **"Add new site"** 按钮
2. 在下拉菜单中选择 **"Import an existing project"**

### 步骤 3：连接 GitHub 仓库

1. 在 "Add new site" 页面，选择 **"GitHub"** 作为 Git 提供商
2. 点击 **"Configure Netlify on GitHub"** 按钮
3. 如果是首次连接，GitHub 会请求授权：
   - 点击 **"Install Netlify"**
   - 选择要授权的仓库（可以选择 "All repositories" 或特定仓库）
   - 点击 **"Install"**
4. 授权完成后，在仓库列表中找到 **`tomato-writer-2024/tomato-ai-writer`**
5. 点击该仓库下方的 **"Import"** 按钮

**命令验证（可选）**：

```bash
# 确认仓库地址正确
git remote get-url origin
# 应该显示：https://github.com/tomato-writer-2024/tomato-ai-writer.git
```

### 步骤 4：配置构建设置

在 "Build and deploy" 页面，输入以下配置：

#### 基本构建配置

在表单中填写：

| 字段 | 值 |
|------|-----|
| **Build command** | `pnpm run build` |
| **Publish directory** | `.next` |
| **Branch to deploy** | `main` |

#### 高级构建设置（可选）

点击 **"Show advanced"** 按钮展开高级选项：

**Build environment variables**（构建环境变量）：

```bash
NODE_VERSION=24
NPM_FLAGS=--legacy-peer-deps
```

**Netlify 会自动读取项目根目录的 `netlify.toml` 文件**，因此这些配置也可以在文件中设置。

**netlify.toml 内容**（已包含在项目中）：

```toml
[build]
  command = "pnpm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "24"
  NPM_FLAGS = "--legacy-peer-deps"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[dev]
  command = "pnpm run dev"
  port = 3000
  publish = ".next"

[functions]
  node_bundler = "esbuild"
```

### 步骤 5：配置环境变量（关键步骤）

#### 5.1 打开环境变量配置页面

1. 在站点配置页面，点击左侧菜单中的 **"Site configuration"**
2. 选择 **"Environment variables"** 选项卡
3. 点击 **"Add an environment variable"** 按钮

#### 5.2 添加必需的环境变量

以下变量必须配置：

##### 1. NEXT_PUBLIC_BASE_URL

```bash
# 变量名：NEXT_PUBLIC_BASE_URL
# 变量值：
https://your-site-name-xxxxx.netlify.app
```

**说明**：
- 部署后，Netlify 会分配一个默认域名
- 替换 `your-site-name-xxxxx` 为实际的站点名称
- 如果配置了自定义域名，使用自定义域名

##### 2. JWT_SECRET

```bash
# 变量名：JWT_SECRET
# 变量值：
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

**生成方法**：

```bash
# 使用在线工具生成
# 访问：https://www.uuidgenerator.net/api/guid
# 复制生成的 UUID
```

**或使用命令行生成**：

```bash
# macOS / Linux
openssl rand -hex 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

##### 3. JWT_REFRESH_SECRET

```bash
# 变量名：JWT_REFRESH_SECRET
# 变量值：
z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f
```

**生成方法**：与 JWT_SECRET 相同，但必须使用不同的值。

##### 4. DOUBAO_API_KEY

```bash
# 变量名：DOUBAO_API_KEY
# 变量值：
ak-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**获取步骤**：

1. 访问 [https://www.volcengine.com/](https://www.volcengine.com/)
2. 注册账号并完成实名认证
3. 登录控制台，搜索"豆包"
4. 开通豆包大模型服务
5. 在"API密钥管理"中创建并复制 API Key

##### 5. DATABASE_URL

```bash
# 变量名：DATABASE_URL
# 变量值：
postgresql://neondb_owner:npg_9ucFS2HzCGdV@ep-small-salad-a142jglw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**说明**：
- 这是 Neon PostgreSQL 数据库的连接字符串
- 使用 Pooler 模式以适应 Netlify 10 秒超时限制
- 支持 IPv4 连接

#### 5.3 添加推荐的环境变量

##### 1. NEXT_PUBLIC_APP_NAME

```bash
# 变量名：NEXT_PUBLIC_APP_NAME
# 变量值：
番茄小说AI写作助手
```

##### 2. DOUBAO_MODEL

```bash
# 变量名：DOUBAO_MODEL
# 变量值：
doubao-pro-4k
```

**可选值**：
- `doubao-pro-4k`：短章节、快速生成
- `doubao-pro-32k`：中长章节
- `doubao-pro-128k`：超长篇

##### 3. 邮件服务配置（可选）

如果需要真实邮件功能：

```bash
# 变量名：EMAIL_HOST
# 变量值：
smtp.163.com

# 变量名：EMAIL_PORT
# 变量值：
465

# 变量名：EMAIL_SECURE
# 变量值：
true

# 变量名：EMAIL_USER
# 变量值：
your_email@163.com

# 变量名：EMAIL_PASS
# 变量值：
your_email_authorization_code

# 变量名：EMAIL_FROM
# 变量值：
番茄小说AI <your_email@163.com>

# 变量名：EMAIL_MOCK_MODE
# 变量值：
false
```

如果不需要真实邮件功能，可以使用 Mock 模式：

```bash
# 变量名：EMAIL_MOCK_MODE
# 变量值：
true
```

#### 5.4 添加系统配置变量

##### 1. 安全配置

```bash
# 变量名：RESET_TOKEN_EXPIRES_IN
# 变量值：
30

# 变量名：ACCESS_TOKEN_EXPIRES_IN
# 变量值：
24

# 变量名：REFRESH_TOKEN_EXPIRES_IN
# 变量值：
7

# 变量名：PASSWORD_MIN_LENGTH
# 变量值：
8
```

##### 2. 限流配置

```bash
# 变量名：RATE_LIMIT_MAX_REQUESTS_PER_HOUR
# 变量值：
100

# 变量名：RATE_LIMIT_WINDOW_SECONDS
# 变量值：
3600
```

##### 3. 文件上传配置

```bash
# 变量名：MAX_FILE_SIZE
# 变量值：
10485760

# 变量名：ALLOWED_FILE_TYPES
# 变量值：
image/jpeg,image/png,image/gif,application/pdf
```

##### 4. 日志配置

```bash
# 变量名：LOG_LEVEL
# 变量值：
info

# 变量名：ENABLE_VERBOSE_LOGGING
# 变量值：
false
```

#### 5.5 配置环境变量作用域（推荐）

Netlify 支持为不同环境配置不同的变量值：

**Production**（生产环境）：
- `NEXT_PUBLIC_BASE_URL`：设置实际生产域名
- `DATABASE_URL`：设置 Neon 生产数据库
- `EMAIL_MOCK_MODE`：设置为 `false`

**Deploy preview**（预览环境）：
- `EMAIL_MOCK_MODE`：设置为 `true`
- `LOG_LEVEL`：设置为 `debug`

**All**（所有环境）：
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `DOUBAO_API_KEY`
- 其他配置

### 步骤 6：部署站点

1. 检查所有配置是否正确
2. 点击页面底部的 **"Deploy site"** 按钮
3. Netlify 将自动开始部署流程

#### 部署流程说明

Netlify 会自动执行以下步骤：

```bash
# 1. 克隆 GitHub 仓库
git clone https://github.com/tomato-writer-2024/tomato-ai-writer.git

# 2. 安装依赖
pnpm install

# 3. 构建项目
pnpm run build

# 4. 部署到 Netlify CDN
netlify deploy --prod
```

#### 部署日志查看

1. 点击左侧菜单中的 **"Deploys"** 选项卡
2. 查看最新的部署记录
3. 点击部署日志查看详细输出

**正常日志示例**：

```
12:34:56 AM: Build ready to start
12:34:57 AM: Netlify Build
12:34:57 AM: ────────────────────────────────────────────────────────────────
12:34:57 AM: Version
12:34:57 AM:   Netlify Build 30.19.5
12:34:57 AM: ────────────────────────────────────────────────────────────────
12:34:57 AM: Flags
12:34:57 AM:   baseRelDir: true
12:34:57 AM:   buildId: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
12:34:57 AM: ────────────────────────────────────────────────────────────────
12:34:57 AM: Current directory
12:34:57 AM:   /opt/build/repo
12:34:57 AM: ────────────────────────────────────────────────────────────────
12:34:57 AM: Config file
12:34:57 AM:   /opt/build/repo/netlify.toml
12:34:57 AM: ────────────────────────────────────────────────────────────────
12:34:57 AM: Context
12:34:57 AM:   production
12:34:57 AM: ────────────────────────────────────────────────────────────────
12:34:57 AM: Loading plugins
12:34:57 AM:   - @netlify/plugin-nextjs@4.80.5
12:35:00 AM: Build command
12:35:00 AM:   pnpm run build
12:35:00 AM: ────────────────────────────────────────────────────────────────
12:35:00 AM: $ pnpm run build
12:35:01 AM: > tomato-ai-writer@0.1.0 build
12:35:01 AM: > next build
12:35:01 AM:
12:35:01 AM:   Creating an optimized production build...
12:35:15 AM:   Route (app)                              Size    First Load JS
12:35:15 AM:   ┌ ○ /                                   5.12 kB         142 kB
12:35:15 AM:   ├ ○ /login                              6.23 kB         143 kB
12:35:15 AM:   ├ ○ /admin/login                        7.34 kB         144 kB
12:35:15 AM:   └ ○ /workspace                          12.45 kB        149 kB
12:35:15 AM:   ○  (Static)   prerendered as static content
12:35:15 AM:
12:35:15 AM: Collecting page data...
12:35:15 AM: Generating static pages (3/3)...
12:35:16 AM: Finalizing page optimization...
12:35:16 AM:
12:35:16 AM: (Build completed successfully)
12:35:16 AM: ────────────────────────────────────────────────────────────────
12:35:16 AM: Build success
12:35:16 AM: ────────────────────────────────────────────────────────────────
12:35:16 AM: Deploying
12:35:16 AM: ────────────────────────────────────────────────────────────────
12:35:16 AM: Starting deploy to xxx
12:35:20 AM: Deploy completed successfully
12:35:20 AM: Site is live at https://your-site-name-xxxxx.netlify.app
```

### 步骤 7：验证部署

部署完成后，执行以下验证步骤：

#### 7.1 检查部署状态

在 Netlify 控制台：

1. 查看 **"Deploys"** 选项卡
2. 确认最新部署状态为 **"Published"**
3. 应该显示绿色的对勾标记

#### 7.2 访问应用

在浏览器中访问：

```
https://your-site-name-xxxxx.netlify.app
```

**或**在 Netlify 控制台点击 **"Site URL"** 链接。

#### 7.3 验证核心功能

依次测试以下功能：

**用户认证**：

```bash
# 测试注册
curl -X POST https://your-site-name.netlify.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'

# 测试登录
curl -X POST https://your-site-name.netlify.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

**AI 写作功能**：

1. 登录系统
2. 创建新小说
3. 测试章节撰写功能
4. 验证 AI 响应时间 < 1 秒

**社区功能**：

1. 浏览社区帖子
2. 发布新帖子
3. 点赞和评论

**管理后台**：

1. 访问 `/admin/login`
2. 登录超级管理员账号
3. 查看订单管理
4. 查看数据统计

#### 7.4 检查日志

在 Netlify 控制台：

1. 点击左侧菜单中的 **"Functions"**
2. 选择 **"functions logs"**
3. 查看是否有错误日志

#### 7.5 性能检查

使用 Chrome DevTools (F12)：

1. 打开 **Network** 标签
2. 刷新页面
3. 检查所有资源加载状态
4. 查看 Console 是否有错误信息

---

## 📊 使用 Netlify CLI 部署（替代方法）

如果你更喜欢使用命令行，可以使用 Netlify CLI 工具。

### 安装 Netlify CLI

```bash
# 全局安装 Netlify CLI
npm install -g netlify-cli

# 验证安装
netlify --version
# 应该显示 Netlify CLI 版本号（如 17.x.x）
```

### 登录 Netlify

```bash
# 登录 Netlify
netlify login

# 浏览器会自动打开，点击授权
# 授权后，命令行会显示登录成功
```

### 初始化站点

```bash
# 进入项目目录
cd /workspace/projects

# 初始化站点
netlify init

# 按照提示选择：
# 1. ? Team: <your-team-name>
# 2. ? Site name: <auto-generated-name> (或输入自定义名称)
# 3. ? Your build command: pnpm run build
# 4. ? Directory to deploy: .next
# 5. ? Build command settings: (Press Enter to skip)
```

### 部署站点

```bash
# 部署预览（不会覆盖生产环境）
netlify deploy

# 部署到生产环境
netlify deploy --prod
```

### 配置环境变量

```bash
# 设置单个环境变量
netlify env:set JWT_SECRET "your-super-secret-jwt-key"

# 设置多个环境变量
netlify env:set JWT_REFRESH_SECRET "your-refresh-token-key"
netlify env:set DOUBAO_API_KEY "your-doubao-api-key"
netlify env:set DATABASE_URL "your-database-url"
netlify env:set NEXT_PUBLIC_BASE_URL "https://your-app.netlify.app"

# 查看所有环境变量
netlify env:list

# 删除环境变量
netlify env:unset VARIABLE_NAME
```

### 查看部署日志

```bash
# 查看实时日志
netlify logs --follow

# 查看 Functions 日志
netlify logs --functions

# 查看指定时间范围的日志
netlify logs --since 2024-01-01
```

---

## 🔄 自动部署配置

Netlify 默认支持自动部署：

### 触发自动部署的条件

1. **推送到 main 分支**：自动部署到生产环境
2. **创建 Pull Request**：自动创建预览部署
3. **推送到其他分支**：自动部署到预览环境

### 配置自动部署

在 Netlify 控制台：

1. 点击 **"Site configuration"**
2. 选择 **"Build & deploy"**
3. 选择 **"Continuous Deployment"**
4. 点击 **"Edit settings"**

**Branch settings**：

- **Branch to deploy**：`main`（生产环境）
- **Edit settings**：配置其他分支的部署规则

**Build hooks**（可选）：

可以配置 Webhook，在特定事件触发部署。

---

## 🛠 部署后管理

### 查看站点信息

```bash
# 使用 Netlify CLI
netlify status

# 输出示例：
# Site: https://your-site-name-xxxxx.netlify.app
# Account: <your-account-name>
# Team: <your-team-name>
```

### 重新部署

在 Netlify 控制台：

1. 点击 **"Deploys"** 选项卡
2. 点击 **"Trigger deploy"** 按钮
3. 选择 **"Deploy site"**

或使用命令行：

```bash
netlify deploy --prod
```

### 回滚到之前的部署

在 Netlify 控制台：

1. 点击 **"Deploys"** 选项卡
2. 找到要回滚的部署记录
3. 点击部署记录右侧的 **"..."** 菜单
4. 选择 **"Deploy this site"**
5. 确认回滚

或使用命令行：

```bash
# 查看部署历史
netlify deployments:list

# 回滚到指定部署
netlify rollback --deployment <deployment-id>
```

---

## 📝 部署检查清单

部署前必须确认以下事项：

### 代码准备

- [ ] 所有代码已提交到 Git
- [ ] `netlify.toml` 文件存在且配置正确
- [ ] `.gitignore` 文件包含 `node_modules`、`.env.local` 等
- [ ] 本地构建成功：`pnpm run build`
- [ ] TypeScript 类型检查通过：`pnpm run type-check`

### 环境变量配置

- [ ] `NEXT_PUBLIC_BASE_URL` 已配置
- [ ] `JWT_SECRET` 已配置且至少 32 位
- [ ] `JWT_REFRESH_SECRET` 已配置且至少 32 位
- [ ] `DOUBAO_API_KEY` 已配置且格式正确
- [ ] `DATABASE_URL` 已配置且包含 Neon 连接字符串
- [ ] `NEXT_PUBLIC_APP_NAME` 已配置（可选）
- [ ] `DOUBAO_MODEL` 已配置（可选）
- [ ] 邮件服务已配置或 `EMAIL_MOCK_MODE=true`
- [ ] 其他可选变量已根据需要配置

### 功能验证

- [ ] 站点可以正常访问
- [ ] 用户注册/登录功能正常
- [ ] AI 写作功能正常
- [ ] 社区功能正常
- [ ] 管理后台功能正常
- [ ] 邮件通知功能正常（或 Mock 模式生效）
- [ ] 无控制台错误
- [ ] API 响应正常
- [ ] 数据库连接正常

---

## 🔧 常见问题排查

### 问题 1：构建失败

**症状**：部署日志显示构建错误

**排查步骤**：

```bash
# 1. 本地测试构建
pnpm install
pnpm run build

# 2. 检查 Node 版本
node --version
# 应该是 v24.x.x

# 3. 检查依赖是否正确
ls node_modules

# 4. 检查 TypeScript 错误
pnpm run type-check
```

**常见原因**：
- 依赖版本冲突
- TypeScript 类型错误
- 环境变量缺失

### 问题 2：部署成功但无法访问

**症状**：部署成功，但访问 404 或 500 错误

**排查步骤**：

1. 检查 Netlify Functions 日志
2. 验证环境变量是否正确配置
3. 检查数据库连接字符串
4. 验证 API Key 是否有效

### 问题 3：AI 功能无响应

**症状**：AI 写作功能调用后无响应

**排查步骤**：

1. 检查 `DOUBAO_API_KEY` 是否有效
2. 验证 API Key 是否过期
3. 检查 Netlify Functions 是否超时
4. 查看浏览器控制台错误信息

---

## 📚 相关文档

- [Netlify 部署指南](NETLIFY_DEPLOYMENT_GUIDE.md)
- [环境变量配置指南](ENV_VARIABLES_GUIDE.md)
- [Netlify 官方文档](https://docs.netlify.com/)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)

---

**按照以上步骤操作，你的番茄小说AI写作工具就可以成功部署到 Netlify 了！** 🚀
