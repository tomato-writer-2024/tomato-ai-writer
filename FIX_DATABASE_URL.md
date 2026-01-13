# 快速修复数据库连接问题

## 问题原因

错误信息：`Database URL not configured. Set PGDATABASE_URL environment variable.`

**原因**：
- `.env.local` 中的 `DATABASE_URL` 配置的是本地 PostgreSQL
- 你可能没有安装本地 PostgreSQL 数据库
- 数据库连接失败

---

## 解决方案（3 选 1）

### 方案 1：使用 Supabase（推荐，5 分钟搞定）⭐

#### 步骤 1：注册 Supabase

1. 访问 https://supabase.com/
2. 点击 "Start your project"
3. 使用 GitHub 账号登录（或注册新账号）

#### 步骤 2：创建项目

1. 点击 "New Project"
2. 填写信息：
   - **Name**: `tomato-ai-writer`
   - **Database Password**: 设置一个强密码（请记住！）
   - **Region**: 选择 `Southeast Asia (Singapore)`（如果你在中国）
   - **Pricing Plan**: Free（免费）

3. 点击 "Create new project"
4. 等待 2-3 分钟，项目创建完成

#### 步骤 3：获取数据库连接字符串

1. 进入项目（点击项目名称）
2. 左侧菜单 → **Settings** → **Database**
3. 找到 **Connection string**
4. 选择 **URI** 格式
5. 点击复制按钮

连接字符串格式类似：
```
postgresql://postgres.xxxx:your-password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

#### 步骤 4：更新 .env.local 文件

打开 `.env.local` 文件，找到 `DATABASE_URL` 这一行，替换为你的 Supabase 连接字符串：

```env
# 之前
DATABASE_URL=postgresql://postgres:password@localhost:5432/tomato_ai

# 替换为
DATABASE_URL=postgresql://postgres.xxxx:your-password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**注意**：
- `your-password` 是你在创建 Supabase 项目时设置的数据库密码
- 不要泄露这个密码！

#### 步骤 5：重新启动服务器

```bash
# 在命令行中按 Ctrl + C 停止当前服务器
# 然后重新启动
npm run dev
```

#### 步骤 6：初始化数据库

在浏览器中访问：
```
http://localhost:5000/api/init-admin?email=admin@example.com&password=Admin@123456
```

这次应该成功了！

---

### 方案 2：使用本地 PostgreSQL（需要安装）

#### 步骤 1：安装 PostgreSQL

1. 访问 https://www.postgresql.org/download/windows/
2. 下载并安装 PostgreSQL（推荐版本：16.x）
3. 安装时记住设置的密码（默认 postgres）

#### 步骤 2：创建数据库

打开命令提示符，执行：

```bash
# 登录 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE tomato_ai;

# 退出
\q
```

#### 步骤 3：验证 .env.local 配置

确认 `.env.local` 中的数据库配置正确：

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/tomato_ai
```

- `postgres`: 用户名（默认）
- `password`: 安装时设置的密码
- `localhost`: 数据库地址
- `5432`: 数据库端口（默认）
- `tomato_ai`: 数据库名称

#### 步骤 4：重启服务器

```bash
# 按 Ctrl + C 停止
# 重新启动
npm run dev
```

---

### 方案 3：使用 Coze Coding 平台数据库（如果可用）

如果 Coze Coding 平台提供了数据库服务，可以按照提示操作。

#### 步骤 1：查询 Coze Coding 数据库配置

查看 Coze Coding 平台的文档，找到数据库配置信息。

#### 步骤 2：更新 .env.local

根据 Coze Coding 提供的配置，更新 `.env.local` 中的数据库连接。

#### 步骤 3：重启服务器

```bash
npm run dev
```

---

## 推荐操作流程（使用 Supabase）

### 1. 注册并创建 Supabase 项目

访问 https://supabase.com/
- 创建项目：`tomato-ai-writer`
- 设置密码：`YourStrongPassword123!`
- 等待 2-3 分钟

### 2. 获取连接字符串

Settings → Database → Connection string → 复制

### 3. 更新 .env.local

```env
DATABASE_URL=postgresql://postgres.xxxx:YourStrongPassword123!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### 4. 重启服务器

```bash
# 在命令行中
Ctrl + C
npm run dev
```

### 5. 创建超级管理员

在浏览器中访问：
```
http://localhost:5000/api/init-admin?email=admin@example.com&password=Admin@123456
```

### 6. 登录管理员后台

访问：
```
http://localhost:5000/admin/login
```

---

## 验证数据库连接

### 方法 1：使用健康检查 API

访问：
```
http://localhost:5000/api/health
```

返回信息应该包含：
```json
{
  "status": "ok",
  "database": "connected",
  ...
}
```

### 方法 2：查看命令行日志

运行 `npm run dev` 后，查看命令行输出：
- ✅ 成功：显示 "✓ Ready in X.Xs"
- ❌ 失败：显示错误信息

### 方法 3：测试创建管理员

访问：
```
http://localhost:5000/api/init-admin?email=admin@example.com&password=Admin@123456
```

- ✅ 成功：返回 `{"success": true}`
- ❌ 失败：返回错误信息

---

## 常见错误及解决方案

### 错误 1: "Connection refused"

**原因**：数据库服务未运行

**解决方案**：
- Supabase: 检查项目是否运行正常
- 本地 PostgreSQL: 检查服务是否启动

### 错误 2: "password authentication failed"

**原因**：密码错误

**解决方案**：
- Supabase: 确认密码正确
- 本地 PostgreSQL: 确认安装时设置的密码

### 错误 3: "database does not exist"

**原因**：数据库未创建

**解决方案**：
- Supabase: 自动创建，无需手动操作
- 本地 PostgreSQL: 执行 `CREATE DATABASE tomato_ai;`

### 错误 4: "FATAL: password authentication failed for user \"postgres\""

**原因**：DATABASE_URL 中的密码与实际密码不匹配

**解决方案**：
- 检查 `.env.local` 中的密码是否正确
- 重新获取正确的密码并更新配置

---

## 快速命令参考

```bash
# 重启服务器（停止当前 + 重新启动）
Ctrl + C
npm run dev

# 测试数据库连接
curl http://localhost:5000/api/health

# 创建超级管理员
# 浏览器访问：
http://localhost:5000/api/init-admin?email=admin@example.com&password=Admin@123456

# 初始化数据库表
npx drizzle-kit push
```

---

## 下一步

配置好数据库后：

1. ✅ 重启服务器
2. ✅ 创建超级管理员
3. ✅ 登录管理员后台
4. ✅ 测试功能

---

**推荐**：使用 Supabase，免费、快速、无需安装任何软件！

**开始时间**: 现在
**完成时间**: 5-10 分钟

有问题随时告诉我！🚀
