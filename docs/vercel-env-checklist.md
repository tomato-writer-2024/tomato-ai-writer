# Vercel环境变量配置检查清单

## 必需的环境变量（必须配置）

### 1. 数据库配置
- [ ] `DATABASE_URL` - PostgreSQL数据库连接字符串
  - 格式：`postgresql://username:password@host:5432/database_name`
  - 示例（Supabase）：`postgresql://postgres:[PASSWORD]@[PROJECT-ID].supabase.co:5432/postgres`
  - 获取方式：从Supabase项目设置中获取

### 2. JWT密钥
- [ ] `JWT_SECRET` - JWT访问Token密钥
  - 要求：至少32位的强随机字符串
  - 生成方式：`openssl rand -base64 32` 或 https://www.grc.com/passwords.htm
  - 示例：`a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`

### 3. 应用基础配置
- [ ] `NODE_ENV` - 环境变量
  - 值：`production`
- [ ] `NEXT_PUBLIC_APP_NAME` - 应用名称
  - 值：`番茄小说AI写作助手`
- [ ] `NEXT_PUBLIC_BASE_URL` - 应用域名
  - 值：`https://tomato-ai-writer.vercel.app`（或你的自定义域名）

## 可选的环境变量（根据需要配置）

### 邮件服务（如需密码重置功能）
- [ ] `EMAIL_HOST` - SMTP服务器地址
  - 示例：`smtp.163.com`（163）、`smtp.qq.com`（QQ）、`smtp.gmail.com`（Gmail）
- [ ] `EMAIL_PORT` - SMTP端口
  - SSL：`465`
  - TLS：`587`
- [ ] `EMAIL_SECURE` - 是否使用SSL
  - 值：`true` 或 `false`
- [ ] `EMAIL_USER` - 邮箱账号
  - 示例：`your-email@163.com`
- [ ] `EMAIL_PASS` - 邮箱密码或授权码
  - 注意：163和QQ邮箱使用授权码，不是登录密码
- [ ] `EMAIL_FROM` - 发件人地址
  - 示例：`your-email@163.com`

### 微信登录（如需微信OAuth登录）
- [ ] `WECHAT_APPID` - 微信开放平台AppID
  - 获取方式：前往微信开放平台注册应用
- [ ] `WECHAT_SECRET` - 微信开放平台AppSecret
  - 获取方式：在微信开放平台应用详情中查看
- [ ] `WECHAT_MOCK_MODE` - 是否使用Mock模式
  - 值：`true`（开发测试）或 `false`（生产环境）
- [ ] `WECHAT_REDIRECT_URI` - 微信授权回调地址
  - 示例：`https://tomato-ai-writer.vercel.app/auth/wechat/callback`

### 豆包大模型（如需AI写作功能）
- [ ] `DOUBAO_API_KEY` - 豆包大模型API密钥
  - 获取方式：前往火山引擎控制台申请
- [ ] `DOUBAO_MODEL` - 豆包模型选择
  - 可选值：
    - `doubao-pro-4k` - Pro版，4K上下文
    - `doubao-pro-32k` - Pro版，32K上下文
    - `doubao-pro-128k` - Pro版，128K上下文
    - `doubao-lite-4k` - Lite版，4K上下文（快速）

### 对象存储（如需文件上传功能）
- [ ] `S3_ENDPOINT` - S3兼容存储端点
  - 示例：`https://s3.amazonaws.com`
- [ ] `S3_ACCESS_KEY` - S3访问密钥ID
- [ ] `S3_SECRET_KEY` - S3访问密钥密码
- [ ] `S3_BUCKET` - S3存储桶名称
- [ ] `S3_REGION` - S3存储区域
  - 示例：`us-east-1`、`ap-northeast-1`（东京）、`ap-southeast-1`（新加坡）

## 配置步骤

### 第1步：在Vercel项目中添加环境变量

1. 进入Vercel项目设置：`https://vercel.com/[your-username]/tomato-ai-writer/settings/environment-variables`
2. 点击 "Add New"
3. 输入环境变量名称和值
4. 选择环境：Production, Preview, Development（建议全部勾选）
5. 点击 "Save"

### 第2步：验证环境变量

部署后，访问诊断页面：
```
https://tomato-ai-writer.vercel.app/api/diagnose
```

检查返回的JSON中是否包含以下信息：

```json
{
  "environment": {
    "databaseUrl": "已配置（部分隐藏）",
    "jwtSecret": "已配置（隐藏）"
  },
  "checks": {
    "jwt": {
      "status": "已配置",
      "valid": "有效"
    }
  }
}
```

### 第3步：重新部署

添加或修改环境变量后，必须重新部署：

1. 进入Vercel项目的 "Deployments" 页面
2. 点击最新部署右侧的 "..." 按钮
3. 选择 "Redeploy"

## 常见问题

### 问题1：环境变量不生效

**原因：**
- 环境变量添加后未重新部署
- 环境变量添加到错误的环境（如只添加到Preview）

**解决方案：**
1. 确保环境变量已添加到Production环境
2. 添加后必须重新部署
3. 重新部署后，访问诊断页面确认

### 问题2：数据库连接失败

**原因：**
- `DATABASE_URL` 格式错误
- 数据库不允许Vercel IP访问
- 数据库凭据错误

**解决方案：**
1. 验证 `DATABASE_URL` 格式：
   ```
   postgresql://username:password@host:port/database
   ```
2. 在数据库设置中允许所有IP访问（或添加Vercel的IP段）
3. 检查用户名和密码是否正确

### 问题3：JWT验证失败

**原因：**
- `JWT_SECRET` 太短或未设置
- `JWT_SECRET` 前后空格

**解决方案：**
1. 确保 `JWT_SECRET` 至少32位
2. 去除前后空格
3. 使用强随机字符串生成器

## 生成强随机密钥

### 方法1：使用OpenSSL（Linux/Mac）

```bash
openssl rand -base64 32
```

### 方法2：使用Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 方法3：使用在线工具

访问以下网站生成强随机密码：
- https://www.grc.com/passwords.htm
- https://randomkeygen.com/

## 安全建议

1. **不要在代码中硬编码密钥**
   - 所有密钥必须通过环境变量配置
   - 不要将.env文件提交到Git

2. **定期轮换密钥**
   - 建议每3-6个月更换一次JWT_SECRET
   - 更换后需要重新部署

3. **使用强密码**
   - 所有密钥至少32位
   - 包含大小写字母、数字和特殊字符

4. **限制环境变量访问**
   - 只授予必要的团队成员权限
   - 定期审查环境变量访问日志

## 测试检查清单

部署完成后，请按顺序检查以下项目：

- [ ] 首页正常加载：https://tomato-ai-writer.vercel.app
- [ ] 诊断API正常：https://tomato-ai-writer.vercel.app/api/diagnose
- [ ] 登录API正常（返回token）
- [ ] 用户统计API正常（返回统计数据）
- [ ] 工作台页面正常加载
- [ ] 超级管理员可以登录

如果所有项目都通过，说明Vercel部署配置正确！

## 相关文档

- [Vercel环境变量文档](https://vercel.com/docs/projects/environment-variables)
- [Next.js环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase连接字符串指南](https://supabase.com/docs/guides/platform/connecting-to-postgres)
- [项目部署指南](./vercel-deployment-guide.md)
