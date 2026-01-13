# 快速启动检查清单

> 使用此清单快速诊断和解决本地部署问题。

---

## 问题诊断

### 当前状态

❌ **Vercel 生产环境无法访问**
- 原因：数据库未初始化、环境变量未配置、代码未部署

❌ **本地环境缺少依赖**
- `tsx` 未安装，无法运行脚本

---

## 快速修复（按顺序执行）

### 步骤 1: 安装依赖（本地环境）

```bash
# 进入项目目录
cd C:\tomato-ai-writer\tomato-ai-writer

# 安装项目依赖
npm install

# 验证安装
node -v
npm -v
```

---

### 步骤 2: 配置数据库

#### 选项 A: 使用 Supabase（推荐，最快）

1. 访问 https://supabase.com 并注册账户
2. 创建新项目（名称：`tomato-ai-writer`）
3. 获取 Connection String：
   - 进入项目 → Settings → Database
   - 复制 `Connection string`
   - 格式：`postgresql://postgres.xxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`

4. 在项目根目录创建 `.env.local` 文件：

```env
DATABASE_URL=postgresql://postgres.xxxx:your-password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
JWT_SECRET=your-super-secret-jwt-key-123456789
NODE_ENV=development
DISABLE_RATE_LIMIT=true
```

#### 选项 B: 使用本地 PostgreSQL

1. 安装 PostgreSQL：https://www.postgresql.org/download/windows/
2. 创建数据库：
   ```sql
   CREATE DATABASE fanqie_ai;
   ```

3. 配置 `.env.local`：

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fanqie_ai
DB_USER=postgres
DB_PASSWORD=your-password
JWT_SECRET=your-super-secret-jwt-key-123456789
NODE_ENV=development
DISABLE_RATE_LIMIT=true
```

---

### 步骤 3: 初始化数据库表

```bash
# 使用 Drizzle Kit 自动创建表（推荐，不需要 tsx）
npx drizzle-kit push
```

**预期输出**：
```
✓ Successfully pushed 14 tables to the database
```

**如果失败**：
- 检查 `DATABASE_URL` 是否正确
- 检查数据库服务是否运行
- 检查网络连接

---

### 步骤 4: 创建超级管理员

#### 方法 1: 使用 API（推荐，最简单）

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 在浏览器中访问：
   ```
   http://localhost:5000/api/init-admin?email=admin@example.com&password=Admin@123456&username=超级管理员
   ```

3. 确认返回成功：
   ```json
   {
     "success": true,
     "message": "超级管理员创建成功"
   }
   ```

#### 方法 2: 安装 tsx 并运行脚本

```bash
# 1. 安装 tsx
npm install -D tsx

# 2. 运行初始化脚本
npm run init-admin
```

---

### 步骤 5: 启动开发服务器

```bash
npm run dev
```

**预期输出**：
```
✓ Ready in 3.2s
○ Local:        http://localhost:5000
```

---

### 步骤 6: 测试访问

打开浏览器访问：

| 页面 | 地址 | 说明 |
|------|------|------|
| **首页** | http://localhost:5000 | 用户首页 |
| **管理员登录** | http://localhost:5000/admin/login | 管理员登录页 |
| **健康检查** | http://localhost:5000/api/health | 系统状态检查 |

---

### 步骤 7: 登录管理员后台

1. 访问：http://localhost:5000/admin/login
2. 输入：
   - 邮箱：`admin@example.com`（或你创建管理员时的邮箱）
   - 密码：`Admin@123456`（或你创建管理员时的密码）
3. 登录成功后自动跳转到仪表盘

---

## 生产环境部署（Vercel）

### 步骤 1: 推送代码到 GitHub

```bash
# 添加所有文件
git add -A

# 提交
git commit -m "feat: 完成本地部署准备"

# 推送到 GitHub
git push origin main
```

### 步骤 2: 配置 Vercel 环境变量

1. 访问 https://vercel.com/tomato-writer-2024/tomato-ai-writer
2. 进入 Settings → Environment Variables
3. 添加以下变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | Supabase 连接字符串 | `postgresql://postgres.xxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres` |
| `JWT_SECRET` | JWT 密钥 | `your-super-secret-jwt-key-123456789` |
| `NODE_ENV` | 环境 | `production` |

### 步骤 3: 触发自动部署

推送代码后，Vercel 会自动部署（约 2-3 分钟）

### 步骤 4: 初始化生产环境数据库

在生产环境中创建超级管理员：

```
https://tomato-ai-writer.vercel.app/api/init-admin?email=your-admin-email@example.com&password=YourPassword123
```

### 步骤 5: 访问生产环境

- **生产环境首页**: https://tomato-ai-writer.vercel.app
- **管理员后台**: https://tomato-ai-writer.vercel.app/admin/login

---

## 常见错误及解决方案

### 错误 1: "Cannot find module 'tsx'"

**原因**：tsx 未安装

**解决方案**：

方法 1：安装 tsx
```bash
npm install -D tsx
```

方法 2：使用 API 代替（推荐）
- 使用 `/api/init-admin` 创建管理员
- 使用 `npx drizzle-kit push` 初始化数据库

---

### 错误 2: "Connection refused" 或 "Database connection failed"

**原因**：数据库连接失败

**解决方案**：

1. 检查数据库服务是否运行：
   - Supabase: 访问 Dashboard 查看项目状态
   - 本地 PostgreSQL: 检查服务是否启动

2. 验证连接字符串：
   ```bash
   # 测试连接
   psql $DATABASE_URL
   ```

3. 检查防火墙：
   - Supabase: 端口 6543
   - 本地 PostgreSQL: 端口 5432

---

### 错误 3: "Table 'xxx' does not exist"

**原因**：数据库表未创建

**解决方案**：

```bash
# 运行数据库迁移
npx drizzle-kit push
```

如果仍然失败：
1. 检查数据库权限
2. 检查 Drizzle 配置
3. 手动创建表（参考 schema 文件）

---

### 错误 4: 管理员登录失败

**原因**：
1. 管理员未创建
2. 密码错误
3. JWT_SECRET 未配置

**解决方案**：

1. 检查管理员是否存在：
   ```sql
   SELECT * FROM users WHERE role = 'DEVELOPER';
   ```

2. 重新创建管理员：
   ```
   http://localhost:5000/api/init-admin?email=admin@example.com&password=Admin@123456
   ```

3. 检查 JWT_SECRET：
   ```bash
   Get-Content .env.local | Select-String "JWT_SECRET"
   ```

---

## 验证清单

完成部署后，使用此清单验证所有功能：

### 本地环境

- [ ] ✅ 依赖安装成功（`npm install`）
- [ ] ✅ 数据库连接正常（`npx drizzle-kit push`）
- [ ] ✅ 管理员创建成功（访问 `/api/init-admin`）
- [ ] ✅ 开发服务器启动成功（`npm run dev`）
- [ ] ✅ 首页可访问（http://localhost:5000）
- [ ] ✅ 管理员登录成功（/admin/login）
- [ ] ✅ 仪表盘显示正常（/admin/dashboard）
- [ ] ✅ 用户注册功能正常
- [ ] ✅ AI 写作功能正常

### 生产环境（Vercel）

- [ ] ✅ 代码推送到 GitHub
- [ ] ✅ Vercel 环境变量已配置
- [ ] ✅ Vercel 部署成功
- [ ] ✅ 生产环境可访问（https://tomato-ai-writer.vercel.app）
- [ ] ✅ 生产环境管理员已创建
- [ ] ✅ 生产环境管理员登录成功
- [ ] ✅ 生产环境功能测试通过

---

## 获取帮助

如果遇到问题：

### 1. 查看文档

- [本地部署指南（Windows）](./LOCAL_DEPLOYMENT_GUIDE_WINDOWS.md)
- [管理员后台使用指南](./ADMIN_BACKEND_GUIDE.md)
- [Vercel 部署指南](./vercel-deployment-guide.md)
- [环境变量清单](./vercel-env-checklist.md)

### 2. 检查日志

**开发服务器日志**：
- 查看终端输出
- 查看 `npm run dev` 的错误信息

**浏览器控制台**：
- 打开 F12 → Console
- 查看 JavaScript 错误

**网络请求**：
- 打开 F12 → Network
- 查看 API 请求状态

### 3. 健康检查

访问健康检查 API：
- 本地：http://localhost:5000/api/health
- 生产：https://tomato-ai-writer.vercel.app/api/health

返回信息包含：
- 数据库连接状态
- 环境变量配置
- 系统运行时间
- 超级管理员状态

---

## 快速命令参考

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 初始化数据库
npx drizzle-kit push

# 创建超级管理员（方法1：API）
# 访问：http://localhost:5000/api/init-admin?email=admin@example.com&password=Admin@123456

# 创建超级管理员（方法2：脚本）
npm install -D tsx
npm run init-admin

# 类型检查
npm run type-check

# 运行测试
npm test

# 构建生产版本
npm run build
```

---

**更新时间**: 2025-01-13
**版本**: 1.0.0
