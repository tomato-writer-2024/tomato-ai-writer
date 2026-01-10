# 番茄小说AI写作工具 - API文档

## 目录

- [快速开始](#快速开始)
- [核心功能](#核心功能)
- [API端点](#api端点)
- [服务配置](#服务配置)
- [安全机制](#安全机制)
- [常见问题](#常见问题)

---

## 快速开始

### 1. 环境要求

- Node.js 18+
- PostgreSQL 12+
- 现代浏览器（Chrome/Firefox/Safari）

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制 `.env.local` 文件并配置必要的环境变量：

```bash
# 数据库连接
DATABASE_URL=postgresql://postgres:password@localhost:5432/tomato_ai

# JWT密钥
JWT_SECRET=your-super-secret-key-at-least-32-chars

# 豆包大模型API Key（可选，用于AI写作功能）
DOUBAO_API_KEY=your-doubao-api-key
```

### 4. 初始化数据库

```bash
# 创建超级管理员账户
curl -X POST http://localhost:5000/api/admin/superadmin/init \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "username": "admin",
    "password": "your_password"
  }'
```

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5000

---

## 核心功能

### 1. 用户认证
- 邮箱密码登录
- 微信OAuth2.0登录
- JWT Token认证
- 刷新Token机制

### 2. AI写作核心
- 章节撰写
- 精修润色
- 智能续写
- 65+生成器（角色、情节、世界观等）

### 3. 安全机制
- SQL参数化查询（防注入）
- 请求限流（防滥用）
- CSRF保护（防跨站攻击）
- 密码加密（bcrypt）

### 4. 第三方集成
- 邮件服务（163/QQ/Gmail等）
- 微信开放平台OAuth2.0
- 豆包大语言模型

---

## API端点

### 认证相关

#### 1. 用户登录

```http
POST /api/auth/login
Content-Type: application/json
X-CSRF-Token: your-csrf-token
```

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "username",
      "role": "FREE",
      "membershipLevel": "PREMIUM"
    }
  }
}
```

**限流：** 15分钟内最多5次（敏感操作）

#### 2. 微信登录

```http
POST /api/auth/wechat-login
Content-Type: application/json
X-CSRF-Token: your-csrf-token
```

**请求体：**
```json
{
  "code": "wechat_oauth_code"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "user": {
      "id": "user_id",
      "email": "wx_openid@wechat.user",
      "username": "微信用户"
    }
  }
}
```

**限流：** 15分钟内最多100次（标准限流）

### AI写作相关

#### 3. 章节撰写

```http
POST /api/ai/chapter
Content-Type: application/json
Authorization: Bearer your_jwt_token
X-CSRF-Token: your-csrf-token
```

**请求体：**
```json
{
  "prompt": "主角穿越到修仙世界，发现自己有一个系统...",
  "genre": "玄幻",
  "chapterNumber": 1,
  "wordCount": 3000,
  "style": "爽文风格",
  "context": "前文内容..."
}
```

**响应：** 流式输出（text/event-stream）

**限流：** 15分钟内最多100次

#### 4. 精修润色

```http
POST /api/ai/polish
Content-Type: application/json
Authorization: Bearer your_jwt_token
X-CSRF-Token: your-csrf-token
```

**请求体：**
```json
{
  "content": "需要润色的章节内容...",
  "genre": "都市",
  "style": "爽文风格",
  "focus": "all"
}
```

**响应：** 流式输出（text/event-stream）

**润色类型：**
- `all`: 全面润色
- `plot`: 剧情优化
- `dialogue`: 对话优化
- `emotion`: 情感强化
- `description`: 描写优化

#### 5. 智能续写

```http
POST /api/ai/continue
Content-Type: application/json
Authorization: Bearer your_jwt_token
X-CSRF-Token: your-csrf-token
```

**请求体：**
```json
{
  "context": "上文内容...",
  "genre": "玄幻",
  "continuationType": "plot",
  "wordCount": 2000,
  "style": "爽文风格"
}
```

**响应：** 流式输出（text/event-stream）

**续写类型：**
- `plot`: 剧情推进
- `scene`: 场景切换
- `dialogue`: 对话互动
- `action`: 动作场面
- `emotion`: 情感爆发
- `foreshadowing`: 伏笔铺垫
- `climax`: 爽点爆发

### 后台管理相关

#### 6. 初始化超级管理员

```http
POST /api/admin/superadmin/init
Content-Type: application/json
X-CSRF-Token: your-csrf-token
```

**请求体：**
```json
{
  "email": "admin@example.com",
  "username": "admin",
  "password": "your_password"
}
```

**限流：** 15分钟内最多3次（非常严格）

#### 7. 批量生成测试用户

```http
POST /api/admin/testing/batch-users
Content-Type: application/json
Authorization: Bearer admin_jwt_token
```

**请求体：**
```json
{
  "count": 10,
  "role": "FREE"
}
```

---

## 服务配置

### 邮件服务配置

#### 163邮箱配置

1. 登录163邮箱网页版
2. 进入"设置" -> "POP3/SMTP/IMAP"
3. 开启"IMAP/SMTP服务"
4. 获取授权码

**环境变量：**
```bash
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@163.com
EMAIL_PASS=your_authorization_code
EMAIL_FROM=番茄小说AI <your_email@163.com>
EMAIL_MOCK_MODE=false
```

#### QQ邮箱配置

1. 登录QQ邮箱网页版
2. 进入"设置" -> "账户"
3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
4. 开启"IMAP/SMTP服务"
5. 使用手机短信验证获取授权码

**环境变量：**
```bash
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@qq.com
EMAIL_PASS=your_authorization_code
EMAIL_FROM=番茄小说AI <your_email@qq.com>
EMAIL_MOCK_MODE=false
```

#### Gmail配置

1. 登录Google账户
2. 进入"安全性"设置
3. 开启"两步验证"
4. 在"两步验证"页面找到"应用专用密码"
5. 生成新的应用专用密码

**环境变量：**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=番茄小说AI <your_email@gmail.com>
EMAIL_MOCK_MODE=false
```

### 微信登录配置

#### 1. 注册微信开放平台账号

1. 访问 https://open.weixin.qq.com/
2. 注册开发者账号
3. 创建网站应用
4. 获取AppID和AppSecret

#### 2. 配置授权回调域名

在微信开放平台配置授权回调域名：
- 开发环境：使用本地IP或内网穿透工具
- 生产环境：使用实际域名

#### 3. 配置环境变量

```bash
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_app_secret
WECHAT_MOCK_MODE=false
WECHAT_REDIRECT_URI=http://localhost:5000/auth/wechat/callback
```

### 豆包大模型配置

#### 1. 获取API Key

1. 访问豆包AI开放平台
2. 注册开发者账号
3. 创建应用并获取API Key

#### 2. 配置环境变量

```bash
DOUBAO_API_KEY=your_doubao_api_key
DOUBAO_MODEL=doubao-seed-1-6-251015
```

**可用模型：**
- `doubao-seed-1-6-251015`: 平衡性能（默认）
- `doubao-seed-1-6-flash-250615`: 快速响应
- `doubao-seed-1-6-thinking-250715`: 深度思考
- `doubao-seed-1-6-vision-250815`: 视觉模型
- `doubao-seed-1-6-lite-251015`: 轻量级
- `deepseek-v3-2-251201`: DeepSeek V3.2
- `deepseek-r1-250528`: DeepSeek R1
- `kimi-k2-250905`: Kimi K2（长上下文）

---

## 安全机制

### 1. SQL参数化查询

所有数据库查询都使用参数化查询，防止SQL注入攻击：

```typescript
// ✅ 正确：使用参数化查询
const result = await db.execute(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// ❌ 错误：字符串拼接（已禁止）
const result = await db.execute(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

### 2. 请求限流

- **严格限流**：敏感操作（登录、注册）- 15分钟最多5次
- **标准限流**：常规API - 15分钟最多100次
- **宽松限流**：读取操作 - 1分钟最多60次
- **API密钥限流**：24小时最多10000次

**响应头：**
```
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200
```

### 3. CSRF保护

所有修改操作都需要CSRF令牌：

```http
POST /api/xxx
X-CSRF-Token: your-csrf-token
```

**获取CSRF令牌：**

```javascript
// 前端从Cookie中获取
const csrfToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('csrf_token='))
  .split('=')[1];
```

### 4. 密码安全

- 使用bcrypt加密（cost=12）
- 最小密码长度：8位
- 强制包含字母和数字

### 5. JWT Token

- **Access Token**: 7天有效期
- **Refresh Token**: 30天有效期
- **Reset Token**: 30分钟有效期

---

## 常见问题

### 1. 如何切换Mock模式和真实模式？

**邮件服务：**
```bash
# Mock模式
EMAIL_MOCK_MODE=true

# 真实模式
EMAIL_MOCK_MODE=false
```

**微信登录：**
```bash
# Mock模式
WECHAT_MOCK_MODE=true

# 真实模式
WECHAT_MOCK_MODE=false
```

### 2. 如何调试邮件发送？

在Mock模式下，邮件内容会输出到控制台：

```javascript
console.log('[邮件服务] 模拟发送邮件:', {
  to: email,
  subject: '...',
  html: '...'
});
```

### 3. 如何测试AI写作功能？

确保已配置豆包API Key：

```bash
curl -X POST http://localhost:5000/api/ai/chapter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "prompt": "主角穿越到修仙世界...",
    "genre": "玄幻"
  }'
```

### 4. 如何重置超级管理员密码？

```bash
# 使用脚本重置
node scripts/set-superadmin.js
```

### 5. 如何查看限流状态？

```bash
# 限流信息会在响应头中返回
curl -I http://localhost:5000/api/xxx
```

---

## 更新日志

### v1.0.0 (当前版本)
- ✅ 实现SQL参数化查询（防注入）
- ✅ 实现请求限流机制
- ✅ 实现CSRF保护
- ✅ 完善AI写作核心功能
- ✅ 支持真实邮件服务（163/QQ/Gmail）
- ✅ 支持真实微信OAuth2.0登录
- ✅ 65+生成器全面覆盖
- ✅ 0成本本地存储方案

---

## 技术支持

如有问题，请联系：
- 邮箱：support@example.com
- GitHub Issues：[项目地址]

---

**版权所有 © 2024 番茄小说AI写作工具**
