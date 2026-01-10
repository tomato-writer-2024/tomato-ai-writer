# 邮件服务与微信登录配置指南

本文档说明如何配置和使用邮件服务与微信开放平台OAuth2.0登录功能。

## 📧 邮件服务配置

### 支持的邮件服务提供商

系统使用Nodemailer，支持以下SMTP邮件服务：

- 163邮箱（smtp.163.com）
- QQ邮箱（smtp.qq.com）
- Gmail（smtp.gmail.com）
- 其他支持SMTP协议的邮件服务

### 配置步骤

1. 复制环境变量模板：
   ```bash
   cp .env.example .env.local
   ```

2. 编辑 `.env.local` 文件，配置邮件服务：
   ```env
   # 邮件服务配置
   EMAIL_HOST=smtp.163.com
   EMAIL_PORT=465
   EMAIL_SECURE=true
   EMAIL_USER=your_email@163.com
   EMAIL_PASS=your_password_or_authorization_code
   EMAIL_FROM=noreply@tomato-ai.com
   ```

3. **重要提示**：
   - 对于QQ邮箱，需要使用授权码而非登录密码
   - 对于163邮箱，需要开启SMTP服务并使用授权码
   - 对于Gmail，需要使用应用专用密码（App Password）

### 如何获取授权码

#### 163邮箱
1. 登录163邮箱网页版
2. 点击"设置" → "POP3/SMTP/IMAP"
3. 开启SMTP服务
4. 点击"授权码管理"，生成授权码

#### QQ邮箱
1. 登录QQ邮箱网页版
2. 点击"设置" → "账户"
3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
4. 开启"POP3/SMTP服务"
5. 生成授权码

#### Gmail
1. 登录Google账户
2. 启用两步验证
3. 生成应用专用密码（App Password）
4. 使用该应用专用密码作为EMAIL_PASS

### 使用邮件服务

#### 发送模板邮件

```typescript
import { emailService, EmailTemplate } from '@/lib/emailService';

// 发送注册验证码
await emailService.sendTemplateEmail(
  EmailTemplate.REGISTRATION_CODE,
  {
    code: '123456',
    username: '用户名',
    expiresIn: 5, // 5分钟有效期
  },
  'user@example.com'
);

// 发送密码重置邮件
await emailService.sendTemplateEmail(
  EmailTemplate.FORGOT_PASSWORD,
  {
    resetLink: 'https://example.com/reset-password?token=xxx',
    username: '用户名',
    expiresIn: 30, // 30分钟有效期
  },
  'user@example.com'
);
```

#### 发送自定义邮件

```typescript
await emailService.sendEmail({
  to: 'user@example.com',
  subject: '自定义邮件标题',
  html: '<h1>自定义邮件内容</h1>',
  text: '纯文本版本',
});
```

#### 使用API发送邮件

```bash
# 发送模板邮件
curl -X POST http://localhost:5000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "REGISTRATION_CODE",
    "params": {
      "code": "123456",
      "expiresIn": 5
    },
    "to": "user@example.com"
  }'

# 发送自定义邮件
curl -X POST http://localhost:5000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "测试邮件",
    "html": "<h1>测试内容</h1>"
  }'
```

### 可用邮件模板

| 模板 | 说明 | 必需参数 |
|------|------|----------|
| REGISTRATION_CODE | 注册验证码 | code, expiresIn |
| FORGOT_PASSWORD | 密码重置 | resetLink, expiresIn |
| MEMBERSHIP_UPGRADE | 会员升级通知 | membershipLevel |
| SYSTEM_NOTIFICATION | 系统通知 | title, content |

## 🔐 微信开放平台OAuth2.0登录

### 配置步骤

1. **申请微信开放平台账号**
   - 访问 [微信开放平台](https://open.weixin.qq.com/)
   - 注册开发者账号
   - 完成开发者资质认证

2. **创建网站应用**
   - 登录微信开放平台
   - 创建"网站应用"
   - 填写应用信息（应用名称、简介等）
   - 提交审核

3. **获取AppID和AppSecret**
   - 审核通过后，在应用详情页获取：
     - AppID
     - AppSecret

4. **配置授权回调域名**
   - 在应用详情页配置"授权回调域"
   - 开发环境：localhost 或内网域名
   - 生产环境：你的域名

5. **配置环境变量**
   编辑 `.env.local` 文件：
   ```env
   # 微信开放平台配置
   WECHAT_APPID=your_wechat_appid
   WECHAT_SECRET=your_wechat_secret
   WECHAT_REDIRECT_URI=http://localhost:5000/auth/wechat/callback
   ```

### 微信登录流程

```
用户点击微信登录
        ↓
前端调用 GET /api/auth/wechat-login 获取授权URL
        ↓
前端跳转到微信授权页面
        ↓
用户授权
        ↓
微信回调到 WECHAT_REDIRECT_URI，带上code参数
        ↓
前端跳转到 /auth/wechat/callback?code=xxx
        ↓
前端调用 POST /api/auth/wechat-login，传递code
        ↓
后端使用code换取access_token和用户信息
        ↓
后端根据unionid查找或创建用户
        ↓
返回JWT token给前端
        ↓
前端保存token并跳转到首页
```

### 使用微信登录

#### 前端实现

```typescript
// 1. 获取微信授权URL
const response = await fetch('/api/auth/wechat-login');
const { data } = await response.json();

// 2. 跳转到微信授权页面
window.location.href = data.authUrl;
```

#### 后端实现

后端已经实现完整的微信OAuth2.0流程，位于：
- `src/app/api/auth/wechat-login/route.ts` - 微信登录API
- `src/app/auth/wechat/callback/page.tsx` - 微信授权回调页面

### 数据库字段

用户表新增字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| wechatOpenId | varchar(255) | 微信OpenID |
| wechatUnionId | varchar(255) | 微信UnionID |

### 注意事项

1. **UnionID vs OpenID**
   - OpenID：同一应用下用户的唯一标识
   - UnionID：同一开放平台下所有应用的统一标识
   - 建议使用UnionID进行用户关联

2. **用户信息获取**
   - 需要用户授权才能获取昵称、头像等信息
   - scope设置为 `snsapi_login`

3. **Access Token有效期**
   - Access Token：2小时
   - Refresh Token：30天
   - 后端会自动刷新token

4. **测试环境**
   - 开发环境可以使用测试账号
   - 需要将回调域名配置为localhost

## 📝 环境变量完整列表

```env
# 邮件服务配置
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@163.com
EMAIL_PASS=your_authorization_code
EMAIL_FROM=noreply@tomato-ai.com

# 微信开放平台配置
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
WECHAT_REDIRECT_URI=http://localhost:5000/auth/wechat/callback

# 应用基础配置
NEXT_PUBLIC_BASE_URL=http://localhost:5000

# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT密钥配置
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# 应用环境
NODE_ENV=development
PORT=5000
```

## 🚀 部署到生产环境

### 1. 配置生产环境变量

确保以下环境变量已正确配置：
- EMAIL_* - 邮件服务配置
- WECHAT_* - 微信开放平台配置
- NEXT_PUBLIC_BASE_URL - 生产环境域名
- DATABASE_URL - 生产数据库连接
- JWT_* - JWT密钥（生产环境必须使用强密钥）

### 2. 更新微信开放平台回调域名

在微信开放平台将 `WECHAT_REDIRECT_URI` 更新为生产环境URL：
```
https://yourdomain.com/auth/wechat/callback
```

### 3. 测试邮件发送

```bash
# 测试邮件服务
curl -X POST https://yourdomain.com/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "生产环境测试邮件",
    "text": "测试内容"
  }'
```

### 4. 测试微信登录

1. 在生产环境中点击微信登录
2. 检查是否能正确跳转到微信授权页面
3. 授权后检查是否能正常登录

## 🐛 常见问题

### 邮件发送失败

**问题**: 邮件发送失败，提示"邮件服务未初始化"

**解决**:
1. 检查环境变量是否正确配置
2. 检查邮箱是否开启了SMTP服务
3. 检查授权码是否正确
4. 查看服务器日志中的详细错误信息

**问题**: 邮件发送成功但未收到

**解决**:
1. 检查垃圾邮件箱
2. 检查邮件服务商的发送频率限制
3. 确认收件人地址是否正确

### 微信登录失败

**问题**: 提示"微信登录未配置"

**解决**:
1. 检查 `WECHAT_APPID` 和 `WECHAT_SECRET` 是否配置
2. 确认微信开放平台账号状态正常

**问题**: 提示"redirect_uri参数错误"

**解决**:
1. 检查 `WECHAT_REDIRECT_URI` 是否正确
2. 确认微信开放平台中配置的回调域名是否匹配
3. URL需要进行URL编码

**问题**: 提示"获取access_token失败"

**解决**:
1. 检查AppSecret是否正确
2. 检查code是否过期（code有效期10分钟）
3. 检查网络是否能访问微信API

## 📞 技术支持

如有问题，请查看：
- 项目文档：`docs/`
- 代码注释：相关文件中的详细注释
- 问题反馈：提交Issue到项目仓库
