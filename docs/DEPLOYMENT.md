# 番茄小说AI写作工具 - 部署指南

本文档将指导您完成番茄小说AI写作工具的完整部署流程，包括环境配置、服务开通、域名绑定等所有步骤。

**0成本实现**：所有服务和工具均为免费使用，无需任何费用！

---

## 📋 目录

1. [前置准备](#前置准备)
2. [获取必要信息](#获取必要信息)
3. [配置环境变量](#配置环境变量)
4. [部署到Vercel](#部署到vercel)
5. [配置微信登录](#配置微信登录)
6. [测试功能](#测试功能)
7. [常见问题](#常见问题)

---

## 前置准备

### 必备账号

1. **GitHub账号**（免费）
   - 用于代码管理和Vercel部署
   - 注册地址：https://github.com

2. **Vercel账号**（免费）
   - 用于部署Next.js应用
   - 注册地址：https://vercel.com
   - 可以使用GitHub账号直接登录

3. **邮箱账号**（免费）
   - 163邮箱：https://mail.163.com
   - QQ邮箱：https://mail.qq.com
   - Gmail：https://mail.google.com
   - 三选一即可

4. **微信账号**（已有即可）
   - 用于微信开放平台注册
   - 访问：https://open.weixin.qq.com

---

## 获取必要信息

### 1. 邮件服务配置

#### 方案A：163邮箱（推荐，国内访问快）

1. 登录163邮箱：https://mail.163.com
2. 点击右上角"设置" → "POP3/SMTP/IMAP"
3. 开启"IMAP/SMTP服务"
4. 点击"获取授权码"
5. 通过手机验证后，复制授权码
6. 保存以下信息：
   - 邮箱地址：`your_email@163.com`
   - 授权码：`your_163_authorization_code`

#### 方案B：QQ邮箱

1. 登录QQ邮箱：https://mail.qq.com
2. 点击右上角"设置" → "账户"
3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
4. 开启"IMAP/SMTP服务"
5. 点击"生成授权码"
6. 通过手机短信验证后，复制授权码
7. 保存以下信息：
   - 邮箱地址：`your_email@qq.com`
   - 授权码：`your_qq_authorization_code`

#### 方案C：Gmail

1. 登录Google账户：https://myaccount.google.com
2. 进入"安全性"设置
3. 开启"两步验证"（必须！）
4. 在"两步验证"页面找到"应用专用密码"
5. 选择"邮件"和"其他（自定义名称）"
6. 生成应用专用密码（16位）
7. 保存以下信息：
   - 邮箱地址：`your_email@gmail.com`
   - 应用专用密码：`your_app_specific_password`

### 2. 微信开放平台配置

1. 访问微信开放平台：https://open.weixin.qq.com
2. 使用微信扫码注册账号（免费）
3. 登录后进入"管理中心"
4. 点击"创建网站应用"
5. 填写应用信息：
   - **网站名称**：番茄小说AI写作助手
   - **网站简介**：基于AI技术的智能小说写作辅助工具
   - **网站域名**：暂时填写 `yourdomain.com`（部署后更新）
   - **网站图标**：上传应用图标（尺寸：108x108）
6. 提交审核（1-3个工作日）
7. 审核通过后，获取以下信息：
   - **AppID**：`wx1234567890abcdef`
   - **AppSecret**：`your-wechat-app-secret`（保密！）
8. 在应用详情页面配置授权回调域名：
   - 填写您的域名（如：`yourdomain.com`）
   - 不需要填写协议或路径

**注意**：AppSecret只能在首次获取时看到，请务必妥善保存！

---

## 配置环境变量

### 方法1：使用项目模板（推荐）

1. 复制项目根目录的 `.env.local.example` 文件
2. 重命名为 `.env.local`
3. 编辑 `.env.local` 文件，填写您的配置

### 方法2：在Vercel中配置

部署到Vercel后，在项目设置中添加环境变量（详见下一节）。

### 必须配置的环境变量

```bash
# 应用基础配置
NEXT_PUBLIC_APP_NAME=番茄小说AI写作助手
NEXT_PUBLIC_BASE_URL=https://yourdomain.com  # 替换为您的域名
NODE_ENV=production

# JWT密钥（生产环境必须修改为强密码）
JWT_SECRET=your-super-secret-jwt-key-change-me-in-production-at-least-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-me-in-production-at-least-32-chars

# 邮件服务配置（三选一）
# ========== 163邮箱 ==========
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@163.com
EMAIL_PASS=your_163_authorization_code
EMAIL_FROM=番茄小说AI <your_email@163.com>

# ========== QQ邮箱 ==========
# EMAIL_HOST=smtp.qq.com
# EMAIL_PORT=465
# EMAIL_SECURE=true
# EMAIL_USER=your_email@qq.com
# EMAIL_PASS=your_qq_authorization_code
# EMAIL_FROM=番茄小说AI <your_email@qq.com>

# ========== Gmail ==========
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_specific_password
# EMAIL_FROM=番茄小说AI <your_email@gmail.com>

# 关闭Mock模式（生产环境必须设为false）
EMAIL_MOCK_MODE=false

# 微信登录配置
WECHAT_APPID=wx1234567890abcdef  # 替换为您的AppID
WECHAT_SECRET=your-wechat-app-secret-here  # 替换为您的AppSecret
WECHAT_MOCK_MODE=false  # 关闭Mock模式
WECHAT_REDIRECT_URI=https://yourdomain.com/api/auth/wechat/callback  # 替换为您的域名
```

---

## 部署到Vercel

### 步骤1：准备代码仓库

1. 将项目代码推送到GitHub仓库
2. 确保仓库包含以下文件：
   - `.coze` 配置文件
   - `vercel.json` 配置文件
   - `.env.local.example` 配置模板

### 步骤2：连接Vercel

1. 登录Vercel：https://vercel.com
2. 点击"Add New Project"
3. 选择"Continue with GitHub"
4. 授权Vercel访问您的GitHub账号
5. 选择要部署的仓库

### 步骤3：配置项目

1. **Project Name**：填写项目名称（如：`tomato-ai-writer`）
2. **Framework Preset**：选择"Next.js"
3. **Root Directory**：保持默认（`./`）
4. **Build and Output Settings**：保持默认

### 步骤4：配置环境变量

1. 在项目设置页面，点击"Environment Variables"
2. 添加以下环境变量（根据上文配置）：

   | Key | Value | Environment |
   |-----|-------|-------------|
   | `NEXT_PUBLIC_APP_NAME` | `番茄小说AI写作助手` | All |
   | `NEXT_PUBLIC_BASE_URL` | `https://yourdomain.com` | Production |
   | `NODE_ENV` | `production` | Production |
   | `JWT_SECRET` | `your-secret-key` | All |
   | `JWT_REFRESH_SECRET` | `your-refresh-secret-key` | All |
   | `EMAIL_HOST` | `smtp.163.com` | All |
   | `EMAIL_PORT` | `465` | All |
   | `EMAIL_SECURE` | `true` | All |
   | `EMAIL_USER` | `your_email@163.com` | All |
   | `EMAIL_PASS` | `your_163_authorization_code` | All |
   | `EMAIL_FROM` | `番茄小说AI <your_email@163.com>` | All |
   | `EMAIL_MOCK_MODE` | `false` | All |
   | `WECHAT_APPID` | `wx1234567890abcdef` | All |
   | `WECHAT_SECRET` | `your-wechat-app-secret` | All |
   | `WECHAT_MOCK_MODE` | `false` | All |
   | `WECHAT_REDIRECT_URI` | `https://yourdomain.com/api/auth/wechat/callback` | All |

3. 点击"Save"

### 步骤5：部署项目

1. 点击"Deploy"按钮
2. 等待部署完成（约2-5分钟）
3. 部署成功后，Vercel会提供一个默认域名：
   - 格式：`https://your-project-name.vercel.app`

### 步骤6：配置自定义域名（可选）

1. 在项目设置页面，点击"Domains"
2. 点击"Add Domain"
3. 输入您的域名（如：`yourdomain.com`）
4. 按照Vercel的提示配置DNS记录
5. 等待DNS生效（最多24小时）

---

## 配置微信登录

### 更新微信开放平台回调域名

1. 登录微信开放平台：https://open.weixin.qq.com
2. 进入"管理中心" → 选择您的网站应用
3. 点击"修改"授权回调域名
4. 更新为您的域名（如：`yourdomain.com`）
5. 保存修改

### 更新环境变量

在Vercel项目设置中，更新以下环境变量：

```bash
# 更新为您的实际域名
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# 更新回调地址
WECHAT_REDIRECT_URI=https://yourdomain.com/api/auth/wechat/callback
```

### 重新部署项目

1. 在Vercel项目页面，点击"Redeploy"
2. 等待部署完成

---

## 测试功能

### 1. 测试邮件发送

1. 访问您的网站：`https://yourdomain.com`
2. 注册一个新账号
3. 检查邮箱是否收到验证邮件
4. 如果未收到，检查环境变量配置是否正确

### 2. 测试微信登录

1. 点击"微信登录"按钮
2. 扫描二维码授权
3. 检查是否成功登录
4. 如果失败，检查微信开放平台回调域名是否正确

### 3. 测试AI写作功能

1. 登录后进入工作台
2. 选择AI写作功能
3. 输入提示词测试生成
4. 检查流式输出是否正常

### 4. 检查日志

1. 在Vercel项目页面，点击"Functions"
2. 查看函数日志
3. 检查是否有错误信息

---

## 常见问题

### 1. 邮件发送失败

**问题**：注册后没有收到验证邮件

**解决方案**：
- 检查邮箱是否开启了SMTP服务
- 确认使用的是授权码而非登录密码
- 检查环境变量 `EMAIL_MOCK_MODE` 是否为 `false`
- 查看Vercel日志，检查错误信息

### 2. 微信登录失败

**问题**：点击微信登录后跳转失败或提示错误

**解决方案**：
- 确认微信开放平台AppID和AppSecret配置正确
- 检查回调域名是否与微信开放平台配置一致
- 确认环境变量 `WECHAT_MOCK_MODE` 为 `false`
- 检查回调地址格式是否正确（需要完整的HTTPS地址）

### 3. 部署后页面404

**问题**：访问域名后显示404错误

**解决方案**：
- 检查Vercel部署是否成功
- 确认Next.js构建没有错误
- 检查 `vercel.json` 配置是否正确
- 查看Vercel日志，检查错误信息

### 4. AI功能无法使用

**问题**：AI写作功能返回错误

**解决方案**：
- 检查数据库连接是否正常
- 确认用户权限是否足够
- 查看Vercel函数日志，检查错误信息
- 检查限流配置是否正确

### 5. 环境变量未生效

**问题**：修改环境变量后没有生效

**解决方案**：
- 在Vercel项目设置中重新部署项目
- 确认环境变量添加到了正确的环境（Production）
- 检查环境变量名称是否拼写正确
- 查看Vercel日志，确认环境变量已加载

### 6. 自定义域名无法访问

**问题**：配置自定义域名后无法访问

**解决方案**：
- 检查DNS记录是否正确配置
- 使用 `dig` 或 `nslookup` 命令检查DNS解析
- 等待DNS生效（最多24小时）
- 在Vercel项目设置中检查域名状态

---

## 成本说明

### 完全免费方案

| 服务 | 成本 | 说明 |
|------|------|------|
| GitHub | 免费 | 代码托管 |
| Vercel | 免费 | 部署服务（每月100GB流量） |
| 163/QQ邮箱 | 免费 | 邮件发送 |
| Gmail | 免费 | 邮件发送 |
| 微信开放平台 | 免费 | 微信登录 |
| 豆包大模型 | 免费（集成服务） | AI生成 |
| PostgreSQL | 免费（集成服务） | 数据库 |
| S3存储 | 免费（集成服务） | 对象存储 |

### 可能产生费用的场景

- 超过Vercel免费额度（100GB流量/月）
- 使用付费邮箱服务（如阿里云邮件推送、SendGrid）
- 购买自定义域名（约50-100元/年）

---

## 总结

通过以上步骤，您可以免费部署一个完整的番茄小说AI写作工具，包括：

✅ 用户注册登录（邮箱+微信）
✅ AI写作功能（章节撰写、精修润色、智能续写）
✅ 邮件发送（验证邮件、通知邮件）
✅ 数据存储（用户数据、生成记录）
✅ 文件上传（图片、文档）

**总成本：0元**（如不需要购买自定义域名）

如有任何问题，请参考本部署指南或查看项目文档。

---

## 相关文档

- [API文档](./API_DOCUMENTATION.md)
- [使用指南](./USAGE_GUIDE.md)
- [集成服务说明](./INTEGRATION_GUIDE.md)
