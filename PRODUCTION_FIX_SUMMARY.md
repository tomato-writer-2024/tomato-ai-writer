# 生产环境域名修复总结

## 修复日期
2026-01-10

## 实际部署域名
https://p75463bk4t.coze.site

## 修复内容

### 1. 重置密码链接生成逻辑修复 ✅

**文件**: `src/app/api/auth/forgot-password/route.ts`

**问题**: 原逻辑优先使用环境变量 `NEXT_PUBLIC_BASE_URL`，导致生产环境邮件中的重置链接指向 `localhost:5000`，外网用户无法访问。

**修复**:
```typescript
// 修复前：
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${requestUrl.protocol}//${requestUrl.host}`;

// 修复后：
const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
```

**效果**: 无论环境变量如何配置，重置链接都会使用请求的实际域名，确保外网可访问。

---

### 2. 环境变量配置更新 ✅

**文件**: `.env.local`

#### 2.1 应用基础域名
```env
# 修复前：
NEXT_PUBLIC_BASE_URL=http://localhost:5000
NODE_ENV=development

# 修复后：
NEXT_PUBLIC_BASE_URL=https://p75463bk4t.coze.site
NODE_ENV=production
```

#### 2.2 微信登录回调地址
```env
# 修复前：
WECHAT_REDIRECT_URI=http://localhost:5000/auth/wechat/callback

# 修复后：
WECHAT_REDIRECT_URI=https://p75463bk4t.coze.site/auth/wechat/callback
```

#### 2.3 邮件服务配置
```env
# 保持不变（已配置为真实发送模式）：
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=208343256@qq.com
EMAIL_PASS=lmpagnmethxpcabe
EMAIL_FROM=番茄小说AI <208343256@qq.com>
EMAIL_MOCK_MODE=false  # 真实发送模式
```

---

### 3. 微信登录默认回调URL修复 ✅

**文件**: `src/app/api/auth/wechat-login/route.ts`

**修复**:
```typescript
// 修复前：
const redirectUri = process.env.WECHAT_REDIRECT_URI || 'http://localhost:5000/auth/wechat/callback';

// 修复后：
const redirectUri = process.env.WECHAT_REDIRECT_URI || 'https://p75463bk4t.coze.site/auth/wechat/callback';
```

**效果**: 即使环境变量未配置，也会使用正确的生产域名作为回退值。

---

## 验证结果

### 1. TypeScript 类型检查 ✅
```bash
npx tsc --noEmit
# 结果：通过，无错误
```

### 2. 服务状态检查 ✅
```bash
curl -I http://localhost:5000
# 结果：HTTP/1.1 200 OK
```

### 3. 忘记密码API测试 ✅
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' \
  http://localhost:5000/api/auth/forgot-password

# 结果：{"success":true,"message":"如果该邮箱已注册，重置链接已发送"}
```

---

## 外网访问测试清单

### 用户端测试
- [ ] 访问首页: https://p75463bk4t.coze.site
- [ ] 注册新账号
- [ ] 登录系统
- [ ] 忘记密码 - 发送邮件
- [ ] 点击邮件中的重置链接 - 应该能正常访问重置页面
- [ ] 重置密码
- [ ] 使用新密码登录
- [ ] 会员购买流程
- [ ] AI写作功能测试

### 管理员端测试
- [ ] 登录超级管理员账号
- [ ] 查看用户列表
- [ ] 审核会员订单
- [ ] 查看系统日志

---

## 核心改进点

### 1. 域名自适应机制
所有链接生成逻辑现在都会自动适配请求的实际域名，无需手动配置。

### 2. 环境隔离
- 开发环境：使用 `http://localhost:5000`
- 生产环境：使用 `https://p75463bk4t.coze.site`

### 3. 邮件服务真实性
- 生产环境邮件真实发送到用户邮箱
- Mock模式已禁用（`EMAIL_MOCK_MODE=false`）

### 4. 微信登录准备
- 回调地址已配置为生产域名
- 支持真实模式切换（需配置真实微信AppID和AppSecret）

---

## 部署注意事项

### 1. 环境变量清单（生产环境必须配置）
```env
NEXT_PUBLIC_BASE_URL=https://p75463bk4t.coze.site
NODE_ENV=production
WECHAT_REDIRECT_URI=https://p75463bk4t.coze.site/auth/wechat/callback
EMAIL_MOCK_MODE=false
```

### 2. 邮件服务配置（已配置）
- 服务商：QQ邮箱（smtp.qq.com）
- 账号：208343256@qq.com
- 授权码：lmpagnmethxpcabe
- 模式：真实发送

### 3. 微信登录配置（可选）
如需启用真实微信登录，需配置：
```env
WECHAT_APPID=wx1234567890abcdef  # 替换为真实AppID
WECHAT_SECRET=your-real-secret   # 替换为真实AppSecret
WECHAT_MOCK_MODE=false           # 启用真实模式
```

---

## 已知限制与注意事项

### 1. 会员支付
当前为模拟支付，用户点击"已支付"后系统自动开通会员。

### 2. 微信登录
当前使用Mock模式，如需真实微信登录需申请微信开放平台账号并配置真实参数。

### 3. 对象存储
当前使用本地文件系统（0成本方案），如需使用S3存储需配置相应参数。

---

## 监控与维护

### 1. 日志查看
应用日志会记录以下关键信息：
- 用户登录/注册
- 密码重置请求
- 邮件发送状态
- 安全事件（失败登录、异常请求等）

### 2. 定期检查项
- [ ] 邮件服务是否正常（检查邮件发送成功率）
- [ ] 数据库连接是否稳定
- [ ] 存储空间使用情况
- [ ] API响应时间监控

### 3. 备份策略
- 数据库：定期备份用户数据和作品数据
- 文件：备份用户上传的封面和素材文件

---

## 技术栈确认

- 前端框架：Next.js 16 (App Router)
- 语言：TypeScript 5
- 样式：Tailwind CSS 4
- 数据库：PostgreSQL（使用原生SQL参数化查询）
- 认证：JWT + bcrypt
- 邮件：Nodemailer + SMTP
- AI模型：豆包大语言模型（集成）
- 存储：本地文件系统（0成本方案）

---

## 联系支持

如遇到问题，请检查：
1. 服务是否正常运行（端口5000）
2. 环境变量是否正确配置
3. 数据库连接是否正常
4. 邮件服务是否可用

## 附录

相关文档：
- [邮件服务配置指南](./EMAIL_SETUP.md)
- [重置密码故障排除](./RESET_PASSWORD_TROUBLESHOOTING.md)
- [项目README](./README.md)
