# 番茄小说AI写作工具 - 超级管理员使用文档

## 📋 重要说明（部署前必读）

### 环境配置要求

在部署到外网之前，请务必配置环境变量。系统支持两种运行模式：

#### 模式一：Mock模式（开发和测试）

适合开发和测试环境，不需要真实的邮件和微信配置。

**配置**：
```env
# 必需配置
DATABASE_URL=postgresql://username:password@host:5432/database_name
JWT_SECRET=your-super-secret-jwt-key
DOUBAO_API_KEY=your-doubao-api-key
NEXT_PUBLIC_BASE_URL=http://localhost:5000
NODE_ENV=development

# Mock模式（默认）
EMAIL_MOCK_MODE=true
WECHAT_MOCK_MODE=true
PAYMENT_MOCK_MODE=true
```

**特点**：
- 邮件：模拟发送成功，控制台输出内容
- 微信：模拟登录成功，使用模拟数据
- 支付：模拟支付成功，无需真实付款

#### 模式二：真实模式（生产环境）

适合生产环境，需要真实的邮件和微信配置。

**配置**：
```env
# 必需配置
DATABASE_URL=postgresql://username:password@host:5432/database_name
JWT_SECRET=your-super-secret-jwt-key
DOUBAO_API_KEY=your-doubao-api-key
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NODE_ENV=production

# 真实邮件发送（配置163邮箱示例）
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@163.com
EMAIL_PASS=your-authorization-code
EMAIL_FROM=your-email@163.com
EMAIL_MOCK_MODE=false

# 真实微信登录
WECHAT_APPID=wx1234567890abcdef
WECHAT_SECRET=your-wechat-app-secret
WECHAT_MOCK_MODE=false
WECHAT_REDIRECT_URI=https://yourdomain.com/auth/wechat/callback
```

**获取方式**：
- 163邮箱授权码：设置 → POP3/SMTP → 开启服务 → 获取授权码
- 微信AppID/Secret：微信开放平台 → 创建应用 → 审核通过

### 配置文件

1. 复制模板：
```bash
cp .env.example .env.local
```

2. 编辑配置：
```bash
vim .env.local
```

3. 详细配置指南：查看 [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md)

---

## 📋 基本信息

**项目名称**：番茄小说AI辅助写作工具  
**版本**：v1.0.0  
**更新时间**：2024年  

---

## 🔐 超级管理员登录信息

### 登录网址

**本地开发环境**：
```
http://localhost:5000/admin/login
```

**生产环境**（部署后）：
```
https://[你的域名]/admin/login
```

### 默认管理员账号

**首次使用需要初始化超级管理员**：

**初始化方式**：
1. 访问超级管理员登录页面
2. 点击页面底部的"初始化超级管理员"按钮
3. 系统会自动创建以下账号：
   - **邮箱**：`admin@tomato-ai.com`
   - **密码**：`Admin@123456`
   - **用户名**：`超级管理员`

**或使用API初始化**：
```bash
curl -X POST http://localhost:5000/api/admin/superadmin/init \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tomato-ai.com",
    "username": "超级管理员",
    "password": "Admin@123456"
  }'
```

### 登录流程

1. 打开浏览器，访问登录网址
2. 输入管理员邮箱和密码
3. 点击"登录"按钮
4. 系统验证超级管理员身份
5. 登录成功后自动跳转到管理后台

---

## 🎛️ 后台管理功能

### 仪表盘 (`/admin/dashboard`)

**功能**：
- 查看系统统计数据
- 快速执行批量操作
- 查看测试运行状态
- 访问各项管理功能

**统计指标**：
- 总用户数
- 测试用户数
- 各会员等级分布
- 用户状态分布（活跃/封禁）

### 用户管理 (`/admin/users`)

**功能**：
- 查看所有用户列表
- 搜索和筛选用户
- 查看用户详细信息
- 管理用户状态（启用/封禁）
- 删除用户账号

**操作按钮**：
- 刷新列表
- 批量生成测试用户
- 导出用户数据

### 测试报告 (`/admin/testing`)

**功能**：
- 查看测试执行历史
- 查看测试结果报告
- 下载测试报告
- 重新运行测试

**测试功能**：
- 批量生成1000+测试用户
- 自动化测试20个核心功能模块
- 生成详细HTML测试报告
- 质量指标评估

### 订单管理 (`/admin/orders`)

**功能**：
- 查看所有订单
- 按状态筛选（待支付/已支付/已失败/已过期）
- 查看订单详情
- 导出订单数据

**订单状态**：
- `PENDING` - 待支付
- `PAID` - 已支付
- `FAILED` - 支付失败
- `EXPIRED` - 已过期

---

## 🔄 功能闭环说明

### 1. 用户注册/登录闭环

**流程**：
1. 用户访问 `/auth/register` 注册账号
2. 系统发送验证邮件（Mock模式或SMTP）
3. 用户点击验证链接激活账号
4. 用户使用邮箱密码登录或微信登录
5. 系统生成JWT Token
6. 前端存储Token，后续请求自动携带

**涉及页面**：
- `/auth/register` - 注册页面
- `/auth/login` - 登录页面
- `/auth/forgot-password` - 忘记密码
- `/auth/reset-password` - 重置密码
- `/auth/wechat` - 微信授权页面

**涉及API**：
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/forgot-password` - 忘记密码
- `POST /api/auth/reset-password` - 重置密码
- `POST /api/auth/wechat-login` - 微信登录

---

### 2. 支付流程闭环

**流程**：
1. 用户访问 `/pricing` 查看套餐
2. 选择套餐和计费周期
3. 点击"立即订阅"，创建订单
4. 跳转到 `/payment?orderId=xxx`
5. 扫描微信二维码支付
6. 点击"确认支付"按钮
7. 系统自动升级会员等级
8. 跳转到 `/workspace` 开始使用

**涉及页面**：
- `/pricing` - 定价页面
- `/payment` - 支付页面

**涉及API**：
- `POST /api/orders` - 创建订单
- `GET /api/payment/[id]` - 获取订单信息
- `POST /api/payment/[id]/confirm` - 确认支付

**定价配置**：
- 免费版：¥0/月
- 基础版：¥29/月，¥22/月（年付）
- 高级版：¥99/月，¥89/月（年付）
- 企业版：¥299/月，¥269/月（年付）

---

### 3. AI写作功能闭环

**流程**：
1. 用户登录后访问 `/workspace`
2. 创建新作品或打开已有作品
3. 使用各种生成器（标题、大纲、章节、封面等）
4. 使用润色、续写、剧情分析等功能
5. 导出作品（TXT、DOCX、PDF格式）
6. 查看统计数据和作品质量评分

**核心功能（65个生成器）**：
- 标题生成器
- 大纲生成器
- 章节撰写器
- 精修润色
- 智能续写
- 封面生成器
- 剧情反转
- 爽点分析
- 原创性检测
- 质量评分
- 等等...

**涉及页面**：
- `/workspace` - 工作台
- `/novels/[id]` - 作品详情
- `/chapters/[id]` - 章节编辑
- `/analytics` - 数据分析

**涉及API**：
- `POST /api/generate` - 通用生成
- `POST /api/generators` - 获取生成器列表
- `POST /api/novels` - 创建小说
- `POST /api/chapters` - 创建章节
- `POST /api/polish` - 润色
- `POST /api/continue` - 续写
- `POST /api/analyze` - 分析
- `GET /api/materials` - 素材库
- 等等...

---

### 4. 会员权益闭环

**会员等级对比**：

| 功能 | 免费版 | 基础版 | 高级版 | 企业版 |
|------|--------|--------|--------|--------|
| 每日AI生成次数 | 5次 | 30次 | 无限 | 无限 |
| 每月AI生成次数 | 100次 | 500次 | 无限 | 无限 |
| 单次生成字数 | 2000字 | 3000字 | 5000字 | 10000字 |
| 存储空间 | 100MB | 500MB | 5GB | 50GB |
| 导出格式 | TXT | TXT/DOCX | TXT/DOCX/PDF | 全格式 |
| 批量处理 | 不支持 | 5章 | 20章 | 100章 |
| 原创性检测 | ❌ | ❌ | ✅ | ✅ |
| 质量评估报告 | ❌ | ❌ | ✅ | ✅ |
| 客服支持 | - | 邮件 | 优先 | 专属 |
| API访问 | ❌ | ❌ | ❌ | ✅ |
| 子账号管理 | ❌ | ❌ | ❌ | 10个 |

---

## 🔧 技术架构

### 前端技术栈
- **框架**：Next.js 16 (App Router)
- **语言**：TypeScript 5
- **样式**：Tailwind CSS 4
- **图标**：Lucide React

### 后端技术栈
- **框架**：Next.js API Routes
- **数据库**：PostgreSQL
- **ORM**：Drizzle ORM
- **认证**：JWT + bcrypt

### 集成服务
- **大语言模型**：豆包（Seed/Doubao）
- **图像生成**：豆包图像（Doubao Seedream）
- **语音服务**：豆包语音（Doubao Voice）
- **联网搜索**：Agent Web Search
- **数据库**：PostgreSQL
- **对象存储**：S3 Compatible Storage
- **邮件服务**：Nodemailer

---

## 🚀 部署指南

### 环境变量配置

创建 `.env.local` 文件：

```env
# 数据库配置
DATABASE_URL=postgresql://username:password@host:5432/dbname

# JWT密钥
JWT_SECRET=your-secret-key-here

# 豆包大模型配置
DOUBAO_API_KEY=your-doubao-api-key

# 邮件服务配置（可选，未配置时使用Mock模式）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password

# 微信OAuth配置（可选）
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret
WECHAT_REDIRECT_URI=https://yourdomain.com/auth/wechat/callback

# 对象存储配置（可选）
S3_ENDPOINT=https://your-s3-endpoint.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=your-bucket-name
```

### 构建和启动

```bash
# 安装依赖
pnpm install

# 开发环境
pnpm dev

# 生产构建
pnpm build

# 启动生产服务
pnpm start
```

---

## 📊 数据库表结构

### users表（用户表）
- `id` - 用户ID
- `email` - 邮箱（唯一）
- `passwordHash` - 密码哈希
- `username` - 用户名
- `role` - 角色（FREE/ADMIN）
- `membershipLevel` - 会员等级（FREE/BASIC/PREMIUM/ENTERPRISE）
- `membershipExpireAt` - 会员到期时间
- `isSuperAdmin` - 是否为超级管理员
- `isActive` - 是否激活
- `isBanned` - 是否封禁
- `createdAt` - 创建时间
- `updatedAt` - 更新时间

### novels表（小说表）
- `id` - 小说ID
- `userId` - 用户ID
- `title` - 标题
- `description` - 简介
- `genre` - 题材
- `status` - 状态
- `wordCount` - 字数
- `chapterCount` - 章节数
- `coverUrl` - 封面URL
- `createdAt` - 创建时间
- `updatedAt` - 更新时间

### chapters表（章节表）
- `id` - 章节ID
- `novelId` - 小说ID
- `userId` - 用户ID
- `chapterNum` - 章节号
- `title` - 标题
- `content` - 内容
- `wordCount` - 字数
- `qualityScore` - 质量评分
- `createdAt` - 创建时间
- `updatedAt` - 更新时间

### membership_orders表（订单表）
- `id` - 订单ID
- `userId` - 用户ID
- `level` - 会员等级
- `months` - 月数
- `amount` - 金额（分）
- `paymentMethod` - 支付方式
- `paymentStatus` - 支付状态
- `transactionId` - 交易ID
- `paidAt` - 支付时间
- `createdAt` - 创建时间

---

## 🔒 安全说明

1. **超级管理员权限**：
   - isSuperAdmin为true的用户拥有最高权限
   - 可以访问所有管理功能
   - 可以修改任何用户信息
   - 可以执行批量操作

2. **数据隔离**：
   - 普通用户只能访问自己的数据
   - 管理员可以查看所有数据但不能修改超级管理员
   - API路由都有权限验证

3. **密码安全**：
   - 使用bcrypt加密存储
   - JWT Token有效期24小时
   - 支持密码重置功能

4. **API安全**：
   - 所有需要认证的API都验证Token
   - 管理员API验证role字段
   - 超级管理员API验证isSuperAdmin字段

---

## 📞 技术支持

如有问题，请联系：
- **邮箱**：admin@tomato-ai.com
- **GitHub Issues**：[项目地址]

---

## 📝 更新日志

### v1.0.0 (2024)
- ✅ 完成核心功能开发
- ✅ 集成豆包大语言模型
- ✅ 实现支付流程闭环
- ✅ 构建超级管理员后台
- ✅ 实现自动化测试框架
- ✅ 部署外网访问
