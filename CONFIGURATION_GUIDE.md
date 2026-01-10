# 番茄小说AI写作工具 - 配置指南

## 📋 目录

1. [快速开始](#快速开始)
2. [邮件服务配置](#邮件服务配置)
3. [微信登录配置](#微信登录配置)
4. [豆包大模型配置](#豆包大模型配置)
5. [数据库配置](#数据库配置)
6. [对象存储配置](#对象存储配置)
7. [环境变量说明](#环境变量说明)
8. [Mock模式和真实模式](#mock模式和真实模式)
9. [安全建议](#安全建议)

---

## 快速开始

### 1. 复制环境变量模板

```bash
# 在项目根目录执行
cp .env.example .env.local
```

### 2. 编辑配置文件

```bash
# 使用你喜欢的编辑器打开 .env.local
vim .env.local
# 或
nano .env.local
# 或使用VS Code等编辑器
```

### 3. 最小化配置（仅开发测试）

如果你只想快速测试系统，以下是最小化配置：

```env
# 数据库配置（必需）
DATABASE_URL=postgresql://username:password@host:5432/database_name

# JWT密钥（必需）
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# 豆包API密钥（必需）
DOUBAO_API_KEY=your-doubao-api-key-here

# 应用域名（必需）
NEXT_PUBLIC_BASE_URL=http://localhost:5000

# 环境变量（开发）
NODE_ENV=development
```

**注意**：不配置邮件和微信服务时，系统会自动使用Mock模式（模拟发送成功），适合开发和测试。

---

## 邮件服务配置

### 配置方式一：使用163邮箱（推荐新手）

#### 步骤1：开通SMTP服务

1. 登录[163邮箱](https://mail.163.com)
2. 点击"设置" → "POP3/SMTP/IMAP"
3. 开启"POP3/SMTP服务"和"IMAP/SMTP服务"
4. 按照提示发送短信验证
5. 验证成功后会显示**授权码**（重要：不是登录密码）

#### 步骤2：配置环境变量

```env
# 163邮箱配置
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@163.com
EMAIL_PASS=your-authorization-code-here
EMAIL_FROM=your-email@163.com
```

#### 步骤3：禁用Mock模式

```env
# 禁用邮件Mock模式（启用真实邮件发送）
EMAIL_MOCK_MODE=false
```

#### 测试邮件发送

```bash
# 在项目根目录执行
curl -X POST http://localhost:5000/api/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "to": "test@example.com",
    "subject": "测试邮件",
    "content": "这是一封测试邮件"
  }'
```

---

### 配置方式二：使用QQ邮箱

#### 步骤1：开通SMTP服务

1. 登录[QQ邮箱](https://mail.qq.com)
2. 点击"设置" → "账户"
3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
4. 开启"IMAP/SMTP服务"或"POP3/SMTP服务"
5. 按照提示发送短信验证
6. 验证成功后会显示**授权码**（重要：不是QQ密码）

#### 步骤2：配置环境变量

```env
# QQ邮箱配置
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@qq.com
EMAIL_PASS=your-authorization-code-here
EMAIL_FROM=your-email@qq.com
```

---

### 配置方式三：使用Gmail

#### 步骤1：开启两步验证和应用密码

1. 登录[Gmail](https://mail.google.com)
2. 进入[Google账户安全设置](https://myaccount.google.com/security)
3. 开启"两步验证"
4. 进入"应用专用密码"页面
5. 创建一个新的应用密码
6. 复制生成的16位应用密码

#### 步骤2：配置环境变量

```env
# Gmail配置
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password
EMAIL_FROM=your-email@gmail.com
```

---

### 配置方式四：使用企业邮箱或自建SMTP服务器

如果你有自己的企业邮箱或自建SMTP服务器，请填写相应的配置：

```env
# 自定义SMTP配置
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your-password
EMAIL_FROM=noreply@yourdomain.com
```

---

### 常见问题

**Q1：邮件发送失败，提示"invalid login"**
A：请检查邮箱密码是否正确。163和QQ邮箱需要使用授权码，不是登录密码。

**Q2：邮件发送失败，提示"self signed certificate"**
A：如果是自建SSL证书的SMTP服务器，可以临时禁用证书验证（不推荐生产环境）。

**Q3：邮件发送很慢**
A：检查网络连接，或尝试使用更快的SMTP服务商（如阿里云邮件推送）。

**Q4：收不到邮件**
A：检查垃圾邮件文件夹，或检查发件人地址是否被黑名单。

---

## 微信登录配置

### 步骤1：注册微信开放平台账号

1. 前往[微信开放平台](https://open.weixin.qq.com)
2. 点击"立即注册"
3. 选择"开发者账号"
4. 填写开发者信息并提交审核

### 步骤2：创建网站应用

1. 登录微信开放平台
2. 进入"管理中心" → "网站应用"
3. 点击"创建网站应用"
4. 填写应用信息：
   - **应用名称**：番茄AI写作助手
   - **应用简介**：AI辅助创作、智能续写、精修润色
   - **应用官网**：https://yourdomain.com
   - **应用官网截图**：上传截图
5. 提交审核（通常需要1-7个工作日）

### 步骤3：获取AppID和AppSecret

1. 审核通过后，在管理中心找到你的应用
2. 点击"查看"进入应用详情
3. 复制**AppID**和**AppSecret**

### 步骤4：配置授权回调域

1. 在应用详情页面，找到"授权回调域"
2. 填写你的域名：`yourdomain.com`
3. **重要**：不要包含`http://`、`https://`或路径，只要域名

### 步骤5：配置环境变量

```env
# 微信登录配置
WECHAT_APPID=wx1234567890abcdef
WECHAT_SECRET=your-wechat-app-secret-here
WECHAT_MOCK_MODE=false
WECHAT_REDIRECT_URI=https://yourdomain.com/auth/wechat/callback
```

### 步骤6：更新代码中的授权链接

确保前端代码中的微信授权链接使用正确的AppID：

```javascript
// 微信授权链接
const wechatAuthUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${process.env.WECHAT_APPID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
```

---

### Mock模式（开发测试用）

如果你只想测试微信登录功能，不想配置真实的微信开放平台，可以使用Mock模式：

```env
# 启用Mock模式（默认）
WECHAT_MOCK_MODE=true
```

Mock模式特点：
- 模拟微信授权流程
- 使用模拟的用户数据
- 适合开发和测试
- **不适用于生产环境**

---

### 常见问题

**Q1：微信授权失败，提示"redirect_uri参数错误"**
A：请检查回调域名是否与微信开放平台配置的一致，不要包含协议和路径。

**Q2：微信授权成功，但登录失败**
A：检查WECHAT_SECRET是否正确，是否过期。

**Q3：如何获取微信用户信息**
A：使用code换取access_token后，调用sns/userinfo接口获取。

**Q4：Mock模式和真实模式有什么区别**
A：Mock模式使用模拟数据，不需要真实的AppID和AppSecret；真实模式需要真实的微信开放平台配置。

---

## 豆包大模型配置

### 步骤1：申请火山引擎账号

1. 前往[火山引擎控制台](https://console.volcengine.com)
2. 注册并登录账号
3. 实名认证（需要身份证）

### 步骤2：开通豆包大模型服务

1. 进入"火山方舟"页面
2. 选择"模型推理" → "立即开通"
3. 同意服务条款

### 步骤3：获取API Key

1. 进入"API密钥管理"页面
2. 点击"创建API Key"
3. 复制生成的API Key

### 步骤4：配置环境变量

```env
# 豆包大模型配置
DOUBAO_API_KEY=your-doubao-api-key-here
DOUBAO_MODEL=doubao-pro-4k
```

### 模型选择

| 模型 | 上下文长度 | 说明 |
|------|-----------|------|
| doubao-pro-4k | 4K | Pro版，高质量，适合短文本生成 |
| doubao-pro-32k | 32K | Pro版，适合长文本生成 |
| doubao-pro-128k | 128K | Pro版，超长上下文，适合全书生成 |
| doubao-lite-4k | 4K | Lite版，快速响应，适合实时交互 |

---

### 常见问题

**Q1：调用失败，提示"quota exceeded"**
A：检查API配额是否用完，可以在火山引擎控制台查看和充值。

**Q2：响应速度很慢**
A：尝试使用doubao-lite-4k模型，或者检查网络连接。

**Q3：生成质量不理想**
A：可以尝试调整temperature参数，或优化prompt。

---

## 数据库配置

### PostgreSQL配置

#### 方式一：使用云数据库（推荐）

**阿里云RDS PostgreSQL**
1. 登录[阿里云控制台](https://rdsnext.console.aliyun.com)
2. 创建RDS PostgreSQL实例
3. 设置白名单（允许服务器IP访问）
4. 获取连接信息

**腾讯云PostgreSQL**
1. 登录[腾讯云控制台](https://console.cloud.tencent.com/postgres)
2. 创建PostgreSQL实例
3. 获取连接信息

#### 方式二：使用本地PostgreSQL

```bash
# 安装PostgreSQL（Ubuntu/Debian）
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# 创建数据库
sudo -u postgres psql
CREATE DATABASE tomato_ai;
CREATE USER tomato_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE tomato_ai TO tomato_user;
\q
```

#### 配置环境变量

```env
# PostgreSQL连接字符串
DATABASE_URL=postgresql://username:password@host:5432/database_name
```

---

## 对象存储配置

### S3兼容存储配置

#### 方式一：使用阿里云OSS

1. 登录[阿里云OSS控制台](https://oss.console.aliyun.com)
2. 创建Bucket
3. 获取AccessKey ID和AccessKey Secret
4. 配置环境变量：

```env
S3_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
S3_ACCESS_KEY=your-access-key-id
S3_SECRET_KEY=your-access-key-secret
S3_BUCKET=your-bucket-name
S3_REGION=oss-cn-hangzhou
```

#### 方式二：使用AWS S3

1. 登录[AWS控制台](https://console.aws.amazon.com/s3)
2. 创建Bucket
3. 创建IAM用户并获取访问密钥
4. 配置环境变量：

```env
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=your-access-key-id
S3_SECRET_KEY=your-secret-key
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
```

---

## 环境变量说明

### 必需配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| DATABASE_URL | 数据库连接字符串 | postgresql://user:pass@host:5432/db |
| JWT_SECRET | JWT访问Token密钥 | 至少32位随机字符串 |
| DOUBAO_API_KEY | 豆包大模型API密钥 | 从火山引擎获取 |
| NEXT_PUBLIC_BASE_URL | 应用域名 | https://yourdomain.com |

### 可选配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| EMAIL_HOST | SMTP服务器地址 | smtp.163.com |
| EMAIL_PORT | SMTP端口 | 465 |
| EMAIL_SECURE | 是否使用SSL | true |
| EMAIL_USER | 邮箱账号 | - |
| EMAIL_PASS | 邮箱密码/授权码 | - |
| WECHAT_APPID | 微信AppID | - |
| WECHAT_SECRET | 微信AppSecret | - |
| WECHAT_MOCK_MODE | 是否使用Mock模式 | true |
| S3_ENDPOINT | S3端点 | https://s3.amazonaws.com |
| S3_ACCESS_KEY | S3访问密钥 | - |
| S3_SECRET_KEY | S3密钥密码 | - |
| S3_BUCKET | S3存储桶 | - |

---

## Mock模式和真实模式

### 邮件服务

**Mock模式（EMAIL_MOCK_MODE=true）**
- 模拟邮件发送成功
- 不实际发送邮件
- 适合开发和测试
- 日志中会显示模拟发送的信息

**真实模式（EMAIL_MOCK_MODE=false）**
- 真实发送邮件
- 需要配置SMTP服务器
- 适合生产环境

### 微信登录

**Mock模式（WECHAT_MOCK_MODE=true）**
- 模拟微信授权流程
- 使用模拟的用户数据
- 不需要真实的AppID和AppSecret
- 适合开发和测试

**真实模式（WECHAT_MOCK_MODE=false）**
- 真实的微信授权流程
- 需要微信开放平台配置
- 适合生产环境

### 支付流程

**Mock模式（PAYMENT_MOCK_MODE=true）**
- 模拟支付成功
- 不实际扣款
- 点击"确认支付"即可成功
- 适合开发和测试

**真实模式（PAYMENT_MOCK_MODE=false）**
- 需要集成真实的支付网关
- 用户需要真实支付
- 适合生产环境

---

## 安全建议

### 1. 密钥安全

- ✅ 使用强随机字符串作为密钥
- ✅ 不要将密钥提交到版本控制系统
- ✅ 定期更换密钥
- ✅ 使用不同的密钥用于不同环境

### 2. 数据库安全

- ✅ 使用强密码
- ✅ 限制数据库访问IP
- ✅ 定期备份数据库
- ✅ 使用SSL连接

### 3. API安全

- ✅ 使用HTTPS
- ✅ 实施速率限制
- ✅ 验证所有输入
- ✅ 记录安全日志

### 4. 邮件和微信配置

- ✅ 不要在代码中硬编码密钥
- ✅ 使用环境变量存储敏感信息
- ✅ 定期检查授权码和密钥是否过期
- ✅ 监控邮件发送失败和微信登录失败

---

## 验证配置

### 验证邮件服务

```bash
# 测试邮件发送
curl -X POST http://localhost:5000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "测试邮件",
    "content": "这是一封测试邮件"
  }'
```

### 验证微信登录

1. 访问微信授权页面：`/auth/wechat`
2. 完成授权流程
3. 检查是否成功登录

### 验证数据库连接

```bash
# 运行数据库迁移
pnpm db:push

# 或使用Drizzle Kit
npx drizzle-kit push
```

### 验证豆包大模型

```bash
# 测试生成功能
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "chapter",
    "prompt": "测试生成",
    "context": "测试上下文"
  }'
```

---

## 获取帮助

如有问题，请联系：

- **邮箱**：admin@tomato-ai.com
- **文档**：[项目文档](https://github.com/your-repo/docs)
- **Issues**：[GitHub Issues](https://github.com/your-repo/issues)

---

祝配置顺利！🎉
