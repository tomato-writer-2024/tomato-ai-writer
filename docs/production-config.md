# 生产环境配置指南

本文档详细介绍了番茄小说AI写作工具在生产环境（Vercel）中的配置步骤。

## 目录

1. [Vercel 环境变量配置](#vercel-环境变量配置)
2. [Supabase 数据库配置](#supabase-数据库配置)
3. [豆包大模型配置](#豆包大模型配置)
4. [对象存储配置](#对象存储配置)
5. [邮件服务配置](#邮件服务配置)
6. [微信登录配置](#微信登录配置)
7. [验证部署](#验证部署)

---

## Vercel 环境变量配置

### 步骤 1：访问 Vercel 项目设置

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入项目 `tomato-writer-2024/tomato-ai-writer`
3. 点击 `Settings` → `Environment Variables`

### 步骤 2：添加生产环境变量

在 Vercel 项目设置中添加以下环境变量（选择 `Production` 环境）：

#### 必需的环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | `番茄小说AI写作助手` |
| `NEXT_PUBLIC_BASE_URL` | 应用基础URL | `https://your-app.vercel.app` |
| `JWT_SECRET` | JWT密钥 | 使用强随机字符串生成 |
| `JWT_REFRESH_SECRET` | 刷新令牌密钥 | 使用强随机字符串生成 |
| `DATABASE_URL` | PostgreSQL连接字符串 | `postgresql://user:pass@host:5432/dbname` |
| `DOUBAO_API_KEY` | 豆包大模型API密钥 | 从集成服务获取 |

#### 可选的环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `EMAIL_HOST` | SMTP服务器地址 | `smtp.163.com` |
| `EMAIL_PORT` | SMTP端口 | `465` |
| `EMAIL_SECURE` | 是否使用SSL | `true` |
| `EMAIL_USER` | 邮箱地址 | `your_email@163.com` |
| `EMAIL_PASS` | 邮箱授权码 | 授权码（非登录密码） |
| `EMAIL_FROM` | 发件人信息 | `番茄小说AI <your_email@163.com>` |
| `EMAIL_MOCK_MODE` | 是否使用Mock模式 | `false` |
| `WECHAT_APPID` | 微信AppID | `wx1234567890abcdef` |
| `WECHAT_SECRET` | 微信AppSecret | 从微信开放平台获取 |
| `WECHAT_MOCK_MODE` | 是否使用Mock模式 | `false` |
| `WECHAT_REDIRECT_URI` | 微信回调地址 | `https://your-app.vercel.app/api/auth/wechat/callback` |
| `S3_ENDPOINT` | S3服务端点 | `https://s3.amazonaws.com` |
| `S3_ACCESS_KEY` | S3访问密钥 | 从对象存储服务获取 |
| `S3_SECRET_KEY` | S3密钥 | 从对象存储服务获取 |
| `S3_BUCKET` | S3存储桶名称 | `your-bucket-name` |
| `S3_REGION` | S3区域 | `us-east-1` |
| `DISABLE_RATE_LIMIT` | 是否禁用限流 | `false` |

### 步骤 3：生成安全密钥

使用以下命令生成强随机密钥：

```bash
# 生成 JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 生成 JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Supabase 数据库配置

### 步骤 1：创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 `New Project` 创建新项目
3. 设置项目名称、数据库密码和区域
4. 等待项目创建完成（约2分钟）

### 步骤 2：获取数据库连接字符串

1. 进入项目 → `Settings` → `Database`
2. 在 `Connection string` 部分，选择 `URI` 格式
3. 复制连接字符串，格式如下：

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 步骤 3：在 Vercel 中配置

将获取的连接字符串作为 `DATABASE_URL` 环境变量添加到 Vercel。

### 步骤 4：运行数据库迁移

在 Supabase 的 SQL Editor 中执行以下 SQL 脚本创建数据表：

```sql
-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    role VARCHAR(50) DEFAULT 'FREE',
    membership_level VARCHAR(50) DEFAULT 'FREE',
    membership_expire_at TIMESTAMP WITH TIME ZONE,
    daily_usage_count INTEGER DEFAULT 0,
    monthly_usage_count INTEGER DEFAULT 0,
    storage_used BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    is_banned BOOLEAN DEFAULT false,
    ban_reason TEXT
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_membership ON users(membership_level);

-- 作品表
CREATE TABLE IF NOT EXISTS novels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    word_count INTEGER DEFAULT 0,
    chapter_count INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_novels_user_id ON novels(user_id);
CREATE INDEX IF NOT EXISTS idx_novels_status ON novels(status);
CREATE INDEX IF NOT EXISTS idx_novels_genre ON novels(genre);

-- 章节表
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    quality_score DECIMAL(5,2),
    originality_score DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(novel_id, chapter_number)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_chapters_novel_id ON chapters(novel_id);
CREATE INDEX IF NOT EXISTS idx_chapters_number ON chapters(chapter_number);

-- 内容统计表
CREATE TABLE IF NOT EXISTS content_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    words_written INTEGER DEFAULT 0,
    chapters_created INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2),
    quality_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_content_stats_user_id ON content_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_content_stats_date ON content_stats(date);

-- 素材表
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category VARCHAR(100),
    tags TEXT[],
    file_url TEXT,
    file_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_materials_user_id ON materials(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    membership_level VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
```

---

## 豆包大模型配置

豆包大模型通过集成服务（`integration-doubao-seed`）提供，无需单独配置 API Key。

集成服务会自动处理所有与大语言模型的交互，包括：
- 流式响应
- 错误重试
- 请求限流
- 模型选择

---

## 对象存储配置

对象存储用于存储用户上传的文件（如图片、文档等）。

### 选项 1：使用 AWS S3

1. 创建 AWS 账户并登录 [AWS Console](https://console.aws.amazon.com/)
2. 进入 S3 服务，创建存储桶（Bucket）
3. 设置存储桶访问权限（根据需求选择公开或私有）
4. 创建 IAM 用户并授予 S3 访问权限
5. 获取访问密钥（Access Key 和 Secret Key）

在 Vercel 中配置以下环境变量：

```
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
```

### 选项 2：使用其他兼容 S3 的服务

支持以下兼容 S3 API 的服务：
- 阿里云 OSS
- 腾讯云 COS
- 七牛云
- MinIO（自建）

配置方式与 AWS S3 相同，只需修改 `S3_ENDPOINT` 为对应服务的端点。

### 选项 3：不配置对象存储

如果不配置对象存储，系统将使用本地文件系统存储文件（适用于开发和测试环境）。在生产环境中建议配置对象存储以获得更好的可靠性和扩展性。

---

## 邮件服务配置

邮件服务用于发送验证邮件、通知邮件等。

### 推荐的邮件服务提供商

1. **163邮箱**（免费，适合个人和小项目）
   - 注册地址：https://mail.163.com/
   - SMTP服务器：`smtp.163.com`
   - 端口：`465`（SSL）或 `994`（SSL）

2. **QQ邮箱**（免费，适合个人和小项目）
   - 注册地址：https://mail.qq.com/
   - SMTP服务器：`smtp.qq.com`
   - 端口：`465`（SSL）

3. **Gmail**（免费，需要应用专用密码）
   - 注册地址：https://mail.google.com/
   - SMTP服务器：`smtp.gmail.com`
   - 端口：`587`（TLS）或 `465`（SSL）

### 配置步骤（以163邮箱为例）

1. 登录163邮箱
2. 点击 `设置` → `POP3/SMTP/IMAP`
3. 开启 `POP3/SMTP` 服务
4. 获取授权码（不是登录密码）
5. 在 Vercel 中配置以下环境变量：

```
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@163.com
EMAIL_PASS=your_authorization_code_here
EMAIL_FROM=番茄小说AI <your_email@163.com>
EMAIL_MOCK_MODE=false
```

### 测试邮件服务

部署后，可以通过以下方式测试邮件服务：

```bash
curl -X POST https://your-app.vercel.app/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"your_test_email@example.com"}'
```

---

## 微信登录配置

微信登录允许用户使用微信账号快速登录。

### 步骤 1：注册微信开放平台账号

1. 访问 [微信开放平台](https://open.weixin.qq.com/)
2. 注册开发者账号
3. 完成开发者资质认证（需要企业资质）

### 步骤 2：创建网站应用

1. 在开放平台中创建"网站应用"
2. 填写应用基本信息：
   - 应用名称：番茄小说AI写作助手
   - 应用简介：AI辅助小说创作工具
   - 应用官网：https://your-app.vercel.app
3. 提交审核（审核周期约1-7个工作日）

### 步骤 3：获取 AppID 和 AppSecret

审核通过后，在应用详情页面获取：
- AppID
- AppSecret

### 步骤 4：配置回调地址

在微信开放平台应用设置中，配置授权回调域名为：
```
your-app.vercel.app
```

### 步骤 5：在 Vercel 中配置

```
WECHAT_APPID=wx1234567890abcdef
WECHAT_SECRET=your-wechat-app-secret-here
WECHAT_MOCK_MODE=false
WECHAT_REDIRECT_URI=https://your-app.vercel.app/api/auth/wechat/callback
```

### 步骤 6：测试微信登录

1. 访问应用登录页面
2. 点击"微信登录"
3. 扫描二维码确认授权
4. 验证是否成功登录

---

## 验证部署

### 1. 检查部署状态

在 Vercel Dashboard 中查看部署状态：
- ✅ Build：构建成功
- ✅ Deploy：部署成功
- ✅ 所有环境变量已配置

### 2. 检查应用可访问性

```bash
# 检查首页
curl -I https://your-app.vercel.app

# 检查API
curl -I https://your-app.vercel.app/api/health
```

### 3. 功能测试清单

- [ ] 用户注册（邮箱）
- [ ] 用户登录（邮箱）
- [ ] 用户资料查看
- [ ] 创建作品
- [ ] 章节撰写
- [ ] 精修润色
- [ ] 智能续写
- [ ] 邮件验证
- [ ] 文件导入导出
- [ ] 素材管理

### 4. 监控和日志

在 Vercel Dashboard 中：
- 查看 `Functions` 日志
- 查看 `Build` 日志
- 配置告警（可选）

---

## 故障排查

### 问题 1：部署失败

**症状**：Vercel 构建失败

**解决方案**：
1. 检查构建日志，查看具体错误信息
2. 确保所有依赖都已正确安装
3. 检查 package.json 中的构建命令

### 问题 2：数据库连接失败

**症状**：应用无法连接数据库

**解决方案**：
1. 检查 `DATABASE_URL` 是否正确
2. 确保 Supabase 项目处于活跃状态
3. 检查 Supabase 的连接限制

### 问题 3：AI服务无法使用

**症状**：生成内容失败

**解决方案**：
1. 确认集成服务正常工作
2. 检查网络连接
3. 查看函数日志获取详细错误信息

### 问题 4：邮件发送失败

**症状**：验证邮件无法发送

**解决方案**：
1. 检查 SMTP 配置是否正确
2. 确认授权码（非登录密码）
3. 检查邮件服务商的发送限制

### 问题 5：微信登录失败

**症状**：微信登录无法使用

**解决方案**：
1. 确认 AppID 和 AppSecret 是否正确
2. 检查回调地址配置是否正确
3. 确认微信应用审核已通过

---

## 联系支持

如果遇到问题，请通过以下方式获取帮助：

- GitHub Issues: https://github.com/tomato-writer-2024/tomato-ai-writer/issues
- 邮箱：support@example.com
- 文档：https://your-app.vercel.app/docs

---

## 附录：环境变量快速参考

### 最小化配置（仅核心功能）

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=番茄小说AI写作助手
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
DATABASE_URL=postgresql://...
```

### 完整配置（所有功能）

```bash
# 基础配置
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=番茄小说AI写作助手
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# 认证
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# 数据库
DATABASE_URL=postgresql://...

# 邮件服务
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@163.com
EMAIL_PASS=your_authorization_code
EMAIL_FROM=番茄小说AI <your_email@163.com>
EMAIL_MOCK_MODE=false

# 微信登录
WECHAT_APPID=wx1234567890abcdef
WECHAT_SECRET=your-wechat-secret
WECHAT_MOCK_MODE=false
WECHAT_REDIRECT_URI=https://your-app.vercel.app/api/auth/wechat/callback

# 对象存储
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=your-bucket
S3_REGION=us-east-1

# 限流
DISABLE_RATE_LIMIT=false

# 支付
PAYMENT_SUCCESS_REDIRECT=/workspace
PAYMENT_FAILED_REDIRECT=/payment?failed=true
```

---

最后更新时间：2025-01-15
