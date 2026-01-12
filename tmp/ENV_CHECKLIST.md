# 环境变量配置检查清单

## 📋 检查项目

### ✅ Git同步状态
- [x] 本地Git状态：工作目录干净，无未提交更改
- [x] 最新提交：bbb0058 - 修复所有bug，准备Vercel部署
- [x] 远程仓库：https://github.com/tomato-writer-2024/tomato-ai-writer.git
- [x] 包管理器：已从pnpm切换到npm，package-lock.json已生成并推送

**结论**：✅ 所有代码已与GitHub同步

---

### 🔐 Vercel环境变量配置清单

#### 必需环境变量（生产环境必须配置）

1. **数据库配置**
   ```
   DATABASE_URL = postgresql://user:password@host:5432/dbname
   ```
   - [ ] 获取Supabase数据库连接字符串
   - [ ] 在Vercel项目设置中配置 DATABASE_URL
   - [ ] 验证连接字符串格式正确

2. **JWT密钥配置**
   ```
   JWT_SECRET = 32位以上强随机字符串
   JWT_REFRESH_SECRET = 32位以上强随机字符串
   ```
   - [ ] 生成两个不同的JWT密钥（至少32位）
   - [ ] 在Vercel项目设置中配置 JWT_SECRET
   - [ ] 在Vercel项目设置中配置 JWT_REFRESH_SECRET

3. **豆包大模型配置** ⭐ 核心
   ```
   DOUBAO_API_KEY = ak-xxxxxxxxxxxxxxxxxxxxxxxx
   DOUBAO_MODEL = doubao-pro-4k（可选，默认为此）
   ```
   - [ ] 前往火山引擎控制台获取API Key
   - [ ] 在Vercel项目设置中配置 DOUBAO_API_KEY
   - [ ] （可选）配置 DOUBAO_MODEL 选择模型

4. **应用基础配置**
   ```
   NEXT_PUBLIC_APP_NAME = 番茄小说AI写作助手
   NEXT_PUBLIC_BASE_URL = https://tomato-ai-writer.vercel.app
   NODE_ENV = production
   ```
   - [ ] 配置 NEXT_PUBLIC_APP_NAME
   - [ ] 配置 NEXT_PUBLIC_BASE_URL 为Vercel部署域名
   - [ ] 配置 NODE_ENV = production

#### 可选环境变量（建议配置）

5. **邮件服务配置** - 邮件发送功能
   ```
   EMAIL_HOST = smtp.163.com（或smtp.qq.com、smtp.gmail.com）
   EMAIL_PORT = 465
   EMAIL_SECURE = true
   EMAIL_USER = your-email@163.com
   EMAIL_PASS = 授权码（不是登录密码！）
   EMAIL_FROM = 番茄小说AI <your-email@163.com>
   EMAIL_MOCK_MODE = false（生产环境必须设为false）
   ```
   - [ ] 选择邮箱服务商（163/QQ/Gmail）
   - [ ] 开启SMTP服务并获取授权码
   - [ ] 配置所有邮件相关环境变量
   - [ ] 确保 EMAIL_MOCK_MODE = false

   **获取授权码方法**：
   - 163邮箱：设置 → POP3/SMTP/IMAP → 开启服务 → 获取授权码
   - QQ邮箱：设置 → 账户 → POP3/IMAP/SMTP服务 → 生成授权码
   - Gmail：账户安全性 → 两步验证 → 应用专用密码

6. **对象存储配置** - 文件上传功能
   ```
   S3_ENDPOINT = https://s3.amazonaws.com
   S3_ACCESS_KEY = access-key-id
   S3_SECRET_KEY = secret-key
   S3_BUCKET = bucket-name
   S3_REGION = us-east-1
   ```
   - [ ] （如需使用）配置对象存储服务
   - [ ] （如需使用）创建S3存储桶并配置密钥

7. **微信登录配置** - 社交登录功能
   ```
   WECHAT_APPID = wx1234567890abcdef
   WECHAT_SECRET = app-secret-here
   WECHAT_MOCK_MODE = false（生产环境）
   WECHAT_REDIRECT_URI = https://tomato-ai-writer.vercel.app/auth/wechat/callback
   ```
   - [ ] （如需使用）在微信开放平台注册应用
   - [ ] （如需使用）配置所有微信登录环境变量
   - [ ] （如需使用）确保回调地址与微信开放平台配置一致

#### 安全和限流配置（可选）

8. **安全配置**
   ```
   RESET_TOKEN_EXPIRES_IN = 30
   ACCESS_TOKEN_EXPIRES_IN = 24
   REFRESH_TOKEN_EXPIRES_IN = 7
   PASSWORD_MIN_LENGTH = 8
   ```
   - [ ] （可选）根据需要调整Token有效期
   - [ ] （可选）调整密码最小长度要求

9. **限流配置**
   ```
   RATE_LIMIT_MAX_REQUESTS_PER_HOUR = 100
   RATE_LIMIT_WINDOW_SECONDS = 3600
   ```
   - [ ] （可选）根据实际使用调整限流策略

---

## 🚀 配置步骤

### 1. 准备必需环境变量

```bash
# 1. 生成JWT密钥（两个不同的密钥）
# 在线生成器：https://www.uuidgenerator.net/api/guid

# 2. 获取豆包API Key
# 访问：https://www.volcengine.com/
# 控制台 → 豆包大模型 → API密钥管理 → 创建密钥

# 3. 准备数据库连接字符串
# Supabase控制台 → Settings → Database → Connection string
```

### 2. 在Vercel中配置环境变量

1. 登录 Vercel 控制台
2. 进入项目：tomato-ai-writer
3. 点击 **Settings** → **Environment Variables**
4. 逐个添加环境变量：
   - 点击 **Add New**
   - 输入变量名称（如 DATABASE_URL）
   - 输入变量值
   - 选择环境（Production、Preview、Development）
   - 点击 **Save**

**重要提示**：
- 所有带 `NEXT_PUBLIC_` 前缀的变量需要在所有环境中配置
- 敏感信息（API密钥、数据库密码等）不要在日志中输出
- 配置后需要重新部署才能生效

### 3. 触发重新部署

配置完成后：
1. 进入 **Deployments** 标签页
2. 找到最新的部署
3. 点击右上角的 **...** 菜单
4. 选择 **Redeploy**
5. 等待部署完成

### 4. 验证部署

访问以下URL验证功能：
- 首页：https://tomato-ai-writer.vercel.app/
- 健康检查：https://tomato-ai-writer.vercel.app/api/health
- 用户注册：https://tomato-ai-writer.vercel.app/api/auth/register

---

## ⚠️ 常见问题

### Q1: 配置环境变量后页面还是报错？
**A**: 环境变量修改后需要重新部署，在Vercel中触发Redeploy。

### Q2: 豆包API Key在哪里获取？
**A**: 访问火山引擎控制台（https://www.volcengine.com/），开通豆包大模型服务后，在API密钥管理中创建密钥。

### Q3: 数据库连接字符串格式是什么？
**A**: 格式为 `postgresql://username:password@host:port/database_name`
例如：`postgresql://postgres:abc123@db.xxx.supabase.co:5432/postgres`

### Q4: 邮件服务配置后还是不发送？
**A**: 检查以下项：
1. EMAIL_MOCK_MODE 是否设为 false
2. 授权码是否正确（不是登录密码）
3. SMTP端口和SSL设置是否正确
4. 邮箱是否开启了SMTP服务

### Q5: 如何验证环境变量是否生效？
**A**: 可以添加一个测试API端点输出环境变量（注意不要在生产环境输出敏感信息），或者查看Vercel部署日志。

---

## 📝 配置完成检查清单

部署前请确认：

- [ ] 所有必需环境变量已配置
- [ ] DATABASE_URL 格式正确，可以连接到数据库
- [ ] JWT_SECRET 和 JWT_REFRESH_SECRET 已生成（至少32位）
- [ ] DOUBAO_API_KEY 已填写且有效
- [ ] NEXT_PUBLIC_BASE_URL 已设置为生产环境域名
- [ ] （如需邮件）EMAIL_MOCK_MODE = false，授权码已填写
- [ ] （如需微信登录）回调地址与微信开放平台配置一致
- [ ] 已触发重新部署并部署成功
- [ ] 访问首页确认页面正常显示
- [ ] 测试核心功能（注册、登录、创建小说等）

---

## 🔗 相关链接

- Vercel项目：https://vercel.com/tomato-writer-2024/tomato-ai-writer
- GitHub仓库：https://github.com/tomato-writer-2024/tomato-ai-writer
- Supabase控制台：https://supabase.com/dashboard
- 火山引擎控制台：https://console.volcengine.com/

---

**生成时间**: 2025-01-XX
**版本**: 1.0.0
