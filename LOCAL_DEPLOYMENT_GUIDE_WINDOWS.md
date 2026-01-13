# 本地部署指南（Windows 完整版）

> 本指南适用于 Windows 10/11 系统，帮助你在本地完整部署番茄小说AI写作工具。

---

## 目录

1. [前置准备](#前置准备)
2. [数据库配置](#数据库配置)
3. [环境变量配置](#环境变量配置)
4. [安装依赖](#安装依赖)
5. [数据库初始化](#数据库初始化)
6. [创建超级管理员](#创建超级管理员)
7. [启动本地服务](#启动本地服务)
8. [访问应用](#访问应用)
9. [管理员后台使用](#管理员后台使用)
10. [常见问题](#常见问题)

---

## 前置准备

### 1. 安装 Node.js

访问 [Node.js 官网](https://nodejs.org/) 下载并安装：
- 推荐 **LTS 版本**（长期支持版）
- 当前推荐：**Node.js 20.x** 或更高版本

验证安装：
```bash
node -v
# 应显示: v20.x.x
```

### 2. 安装 Git（可选，如果需要从 GitHub 克隆代码）

访问 [Git 官网](https://git-scm.com/) 下载并安装：
- 下载后安装，一路点击"Next"即可

验证安装：
```bash
git --version
# 应显示: git version 2.x.x
```

### 3. 准备数据库

你有以下几种数据库选择：

#### 选项 A：使用 Supabase（推荐，免费）

1. 访问 [Supabase](https://supabase.com/) 并注册账户
2. 创建新项目：
   - 项目名称：`tomato-ai-writer`
   - 数据库密码：设置一个强密码（请记住）
   - 选择最接近你地区的区域
3. 等待项目创建完成（约 2 分钟）
4. 获取数据库连接信息：
   - 进入项目 → Settings → Database
   - 复制 **Connection string**（PostgreSQL connection string）
   - 格式：`postgresql://postgres.xxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`

#### 选项 B：使用本地 PostgreSQL

1. 下载并安装 [PostgreSQL](https://www.postgresql.org/download/windows/)
2. 安装时记住设置的用户名和密码
3. 使用 pgAdmin 或命令行创建数据库：
   ```sql
   CREATE DATABASE fanqie_ai;
   ```

#### 选项 C：使用 Docker（适用于开发者）

```bash
docker run --name tomato-db \
  -e POSTGRES_PASSWORD=your-password \
  -e POSTGRES_DB=fanqie_ai \
  -p 5432:5432 \
  -d postgres:16-alpine
```

---

## 环境变量配置

### 1. 创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# Windows PowerShell
New-Item -Path ".env.local" -ItemType File -Force

# 或使用 CMD
type nul > .env.local
```

### 2. 配置数据库连接

编辑 `.env.local` 文件，添加以下内容：

#### 使用 Supabase（推荐）：

```env
# 数据库连接（使用 Supabase 提供的 Connection String）
DATABASE_URL=postgresql://postgres.xxxx:your-password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

#### 使用本地 PostgreSQL：

```env
# 数据库连接（分开配置）
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fanqie_ai
DB_USER=postgres
DB_PASSWORD=your-password
```

### 3. 配置其他环境变量

在 `.env.local` 中继续添加：

```env
# JWT 密钥（用于用户认证，请设置一个强密钥）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456789

# AI 服务配置（豆包大模型）
AI_API_KEY=your-ai-api-key
AI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3

# 对象存储配置（可选，用于文件存储）
S3_ENDPOINT=your-s3-endpoint
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=your-bucket-name
S3_REGION=auto

# 邮件服务配置（可选，用于发送通知）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=tomato-writer@example.com

# 开发环境配置
NODE_ENV=development
DISABLE_RATE_LIMIT=true
```

---

## 安装依赖

### 1. 安装项目依赖

```bash
# 使用 npm（推荐）
npm install

# 或使用 pnpm（如果已安装）
pnpm install
```

### 2. 验证依赖安装

```bash
# 检查 node_modules 是否存在
dir node_modules

# 或测试运行开发服务器（稍后启动）
npm run dev
```

---

## 数据库初始化

### 方法 1：使用 Drizzle Kit（推荐，不需要 tsx）

Drizzle Kit 是官方工具，可以自动创建数据库表结构。

```bash
# 推送数据库表结构到数据库
npx drizzle-kit push
```

这个命令会：
- 连接到数据库（使用 .env.local 中的配置）
- 自动创建所有需要的表
- 创建索引和约束

**预期输出**：
```
✓ Successfully pushed 14 tables to the database
```

### 方法 2：使用 API（需要先启动服务）

1. 先启动开发服务器（见下一节）
2. 访问健康检查 API：
   ```
   http://localhost:5000/api/health
   ```

如果数据库表不存在，API 会返回相应的提示信息。

---

## 创建超级管理员

### 方法 1：使用 API（推荐，最简单）

1. 确保开发服务器正在运行
2. 在浏览器中访问以下 URL：

```
http://localhost:5000/api/init-admin?email=admin@example.com&password=Admin@123456&username=超级管理员
```

3. 替换参数：
   - `email`: 你想要的管理员邮箱
   - `password`: 管理员密码（至少8位，包含字母和数字）
   - `username`: 管理员用户名（可选）

4. 成功后会返回：
   ```json
   {
     "success": true,
     "message": "超级管理员创建成功",
     "data": {
       "id": "uuid",
       "email": "admin@example.com",
       "username": "超级管理员",
       "role": "DEVELOPER",
       "membershipLevel": "PREMIUM"
     }
   }
   ```

### 方法 2：使用命令行脚本（需要安装 tsx）

```bash
# 安装 tsx（一次性）
npm install -D tsx

# 运行初始化脚本
npm run init-admin
```

---

## 启动本地服务

### 1. 启动开发服务器

```bash
npm run dev
```

**预期输出**：
```
✓ Ready in 3.2s
○ Local:        http://localhost:5000
○ Network:      http://192.168.x.x:5000
```

### 2. 验证服务运行

打开浏览器访问：
- **首页**: http://localhost:5000
- **健康检查**: http://localhost:5000/api/health

---

## 访问应用

### 1. 用户访问

用户可以直接访问：
- **首页**: http://localhost:5000
- **注册页面**: http://localhost:5000/register
- **登录页面**: http://localhost:5000/login

### 2. 管理员访问

管理员后台位于：
- **管理员登录**: http://localhost:5000/admin/login
- **管理员仪表盘**: http://localhost:5000/admin/dashboard
- **用户管理**: http://localhost:5000/admin/users
- **测试报告**: http://localhost:5000/admin/testing

---

## 管理员后台使用

### 1. 管理员登录

1. 访问 http://localhost:5000/admin/login
2. 输入管理员邮箱和密码
3. 点击"登录"按钮

### 2. 管理员仪表盘

仪表盘提供以下功能：

| 功能 | 说明 | 路径 |
|------|------|------|
| **系统概览** | 查看系统状态、用户统计、数据趋势 | `/admin/dashboard` |
| **用户管理** | 查看用户列表、编辑用户信息、禁用/启用用户 | `/admin/users` |
| **订单管理** | 查看会员订单、审核支付凭证 | `/admin/orders` |
| **测试报告** | 查看自动化测试结果、性能数据 | `/admin/testing` |
| **审计日志** | 查看系统操作日志、安全事件 | `/admin/audit` |
| **功能测试** | 测试新功能、查看实验数据 | `/admin/new-features-test` |

### 3. 管理员权限

超级管理员（DEVELOPER 角色）拥有以下权限：
- ✅ 创建/编辑/删除用户
- ✅ 升级/降级会员等级
- ✅ 审核支付订单
- ✅ 查看所有系统日志
- ✅ 运行自动化测试
- ✅ 访问所有功能模块

---

## 常见问题

### Q1: 提示 "Cannot find module 'tsx'" 错误

**解决方案**：

方法 1：安装 tsx
```bash
npm install -D tsx
```

方法 2：使用 API 代替命令行脚本（推荐）
- 使用 `/api/init-admin` 创建管理员
- 使用 `/api/health` 检查系统状态

---

### Q2: 数据库连接失败

**检查清单**：

1. ✅ 验证数据库服务是否运行
   - Supabase: 访问 Supabase Dashboard 查看项目状态
   - 本地 PostgreSQL: 检查服务是否启动

2. ✅ 验证连接字符串是否正确
   ```bash
   # 测试连接（需要安装 postgres 客户端）
   psql "postgresql://user:password@host:port/database"
   ```

3. ✅ 验证环境变量是否正确配置
   ```bash
   # Windows PowerShell
   Get-Content .env.local
   ```

4. ✅ 检查防火墙是否阻止连接
   - Supabase 使用 6543 端口
   - 本地 PostgreSQL 使用 5432 端口

---

### Q3: 提示 "Table 'xxx' does not exist"

**解决方案**：

运行数据库迁移命令：
```bash
npx drizzle-kit push
```

如果仍然失败，手动检查数据库：
```bash
# 使用 psql 连接数据库
psql $DATABASE_URL

# 查看表列表
\dt

# 如果表不存在，检查是否有错误
```

---

### Q4: 管理员登录失败

**检查清单**：

1. ✅ 确认管理员账户是否创建成功
   - 访问 http://localhost:5000/api/health
   - 查看"超级管理员"字段

2. ✅ 确认邮箱和密码是否正确
   - 密码至少 8 位
   - 区分大小写

3. ✅ 检查 JWT_SECRET 是否配置
   ```bash
   Get-Content .env.local | Select-String "JWT_SECRET"
   ```

4. ✅ 清除浏览器缓存和 Cookie
   - 打开浏览器开发者工具
   - Application → Storage → Clear site data

---

### Q5: 页面显示 "访问遇到小插曲"

**原因**：可能是前端代码错误或 API 调用失败

**解决方案**：

1. 检查开发服务器终端是否有错误信息
2. 打开浏览器开发者工具（F12）
   - Console: 查看 JavaScript 错误
   - Network: 查看网络请求是否成功
3. 检查 API 响应：
   ```bash
   # 测试健康检查 API
   curl http://localhost:5000/api/health
   ```

---

### Q6: Vercel 部署后无法访问

**可能原因**：

1. ❌ 数据库未初始化
2. ❌ 环境变量未配置
3. ❌ 代码未推送到 GitHub

**解决方案**：

1. 在本地运行 `npx drizzle-kit push` 初始化数据库
2. 在 Vercel Dashboard 中配置环境变量
3. 推送代码到 GitHub 触发自动部署

---

## 生产环境部署

### 部署到 Vercel

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量（与本地相同）
4. 部署后访问：
   - **生产环境**: https://tomato-ai-writer.vercel.app
   - **管理员后台**: https://tomato-ai-writer.vercel.app/admin/login

### 生产环境初始化

在生产环境中创建超级管理员：

```
https://tomato-ai-writer.vercel.app/api/init-admin?email=your-admin-email@example.com&password=YourPassword123
```

---

## 下一步

完成本地部署后，你可以：

1. ✅ **测试核心功能**
   - 注册新用户
   - 创建小说作品
   - 使用 AI 续写功能
   - 测试支付流程

2. ✅ **查看管理员后台**
   - 用户管理
   - 订单审核
   - 数据统计

3. ✅ **部署到生产环境**
   - 推送到 GitHub
   - 在 Vercel 中配置
   - 测试生产环境

---

## 获取帮助

如果遇到问题：

1. 📖 查看完整文档：
   - [Vercel 部署指南](./vercel-deployment-guide.md)
   - [环境变量清单](./vercel-env-checklist.md)
   - [部署修复指南](./DEPLOYMENT_FIX_GUIDE.md)

2. 🐛 提交 Issue：
   - 在 GitHub 仓库提交 Issue
   - 附上错误信息和截图

3. 💬 联系技术支持：
   - 邮箱：support@tomatowriter.com

---

**最后更新**: 2025-01-13
**版本**: 1.0.0
