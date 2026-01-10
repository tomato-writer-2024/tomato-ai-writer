# 邮件服务配置指南

本项目的邮件服务支持多种免费邮箱提供商，包括163、QQ、Gmail等。

## 问题原因

忘记密码功能收不到邮件的原因：

1. **邮件服务处于Mock模式**：`EMAIL_MOCK_MODE=true` 导致不发送真实邮件
2. **邮箱账号未配置**：`EMAIL_USER` 和 `EMAIL_PASS` 为空
3. **API代码未调用邮件服务**（已修复）

## 解决方案

### 步骤1：获取邮箱授权码

#### 方案1：使用163邮箱（推荐，免费且国内访问快）

1. 登录163邮箱网页版：https://mail.163.com
2. 点击右上角"设置" → "POP3/SMTP/IMAP"
3. 开启"IMAP/SMTP服务"
4. 点击"获取授权码"
5. 通过手机验证后，复制授权码（**重要：不是登录密码！**）

#### 方案2：使用QQ邮箱

1. 登录QQ邮箱网页版：https://mail.qq.com
2. 点击右上角"设置" → "账户"
3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
4. 开启"IMAP/SMTP服务"
5. 点击"生成授权码"
6. 通过手机短信验证后，复制授权码（**不是QQ密码！**）

#### 方案3：使用Gmail（海外访问友好）

1. 登录Google账户：https://myaccount.google.com
2. 进入"安全性"设置
3. 开启"两步验证"（必须！）
4. 在"两步验证"页面找到"应用专用密码"
5. 选择"邮件"和"其他（自定义名称）"
6. 生成应用专用密码（16位密码）
7. 复制应用专用密码（**不是Google登录密码！**）

### 步骤2：配置环境变量

编辑 `.env.local` 文件，填写以下信息：

```bash
# ========================================
# 邮件服务配置
# ========================================

# 邮件服务提供商（smtp服务器地址）
EMAIL_HOST=smtp.163.com  # 163: smtp.163.com | QQ: smtp.qq.com | Gmail: smtp.gmail.com

# SMTP端口
EMAIL_PORT=465  # 163/QQ: 465 | Gmail: 587

# 是否使用SSL（465端口用true，587端口用false）
EMAIL_SECURE=true  # 163/QQ: true | Gmail: false

# 邮箱账号（你的完整邮箱地址）
EMAIL_USER=your_email@163.com  # 替换为你的邮箱

# 邮箱授权码（不是登录密码！）
EMAIL_PASS=your_auth_code  # 替换为你的授权码

# 发件人显示名称
EMAIL_FROM=番茄小说AI <noreply@example.com>

# ========================================
# Mock模式配置
# ========================================

# 是否启用Mock模式（开发环境建议true，生产环境必须false）
EMAIL_MOCK_MODE=false  # 改为 false 以发送真实邮件
```

### 步骤3：重启服务

修改环境变量后，需要重启Next.js服务：

```bash
# 停止当前服务（如果正在运行）
# 然后重新启动
bash .cozeproj/scripts/dev_run.sh 2>&1 > /dev/null &
```

### 步骤4：测试邮件发送

1. 访问忘记密码页面：http://localhost:5000/forgot-password
2. 输入你的邮箱地址
3. 点击"发送重置链接"
4. 检查邮箱收件箱（注意检查垃圾邮件文件夹）

## 推荐配置方案

### 开发环境

```bash
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@163.com
EMAIL_PASS=your_auth_code
EMAIL_FROM=番茄小说AI <your_email@163.com>
EMAIL_MOCK_MODE=true  # 开发环境使用Mock模式，不发送真实邮件
```

**Mock模式下**：
- 不会发送真实邮件
- 重置链接会打印在服务器控制台日志中
- API响应会包含 `debug.resetUrl` 字段

### 生产环境

```bash
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@163.com
EMAIL_PASS=your_auth_code
EMAIL_FROM=番茄小说AI <your_email@163.com>
EMAIL_MOCK_MODE=false  # 必须设为 false，发送真实邮件
```

**生产模式下**：
- 会发送真实邮件到用户邮箱
- 不返回 `debug.resetUrl` 字段
- 需要确保SMTP配置正确

## 常见问题

### 1. 提示"邮件发送失败"

**原因**：
- 邮箱授权码错误
- SMTP服务未开启
- 防火墙拦截了465端口

**解决**：
- 重新获取授权码
- 检查邮箱设置中的SMTP服务是否已开启
- 检查服务器防火墙设置

### 2. Gmail发送失败

**原因**：
- 未开启两步验证
- 未生成应用专用密码
- 使用了登录密码而非应用专用密码

**解决**：
- 必须先开启两步验证
- 必须生成应用专用密码
- 使用16位应用专用密码而非登录密码

### 3. 收不到邮件

**原因**：
- 邮件被标记为垃圾邮件
- 邮箱地址填写错误
- 仍然处于Mock模式

**解决**：
- 检查垃圾邮件文件夹
- 确认邮箱地址正确
- 确认 `EMAIL_MOCK_MODE=false`

### 4. Mock模式下如何获取重置链接？

在开发环境中，如果 `EMAIL_MOCK_MODE=true`，重置链接会：

1. 打印在服务器控制台日志中
2. 返回在API响应的 `debug.resetUrl` 字段中

你可以从服务器日志或浏览器开发者工具的网络响应中获取链接，直接访问即可重置密码。

## 支持的邮箱服务商

| 服务商 | Host | Port | Secure | 是否免费 | 国内访问 |
|--------|------|------|--------|---------|---------|
| 163邮箱 | smtp.163.com | 465 | true | ✅ | ⚡ 快 |
| 126邮箱 | smtp.126.com | 465 | true | ✅ | ⚡ 快 |
| QQ邮箱 | smtp.qq.com | 465 | true | ✅ | ⚡ 快 |
| Gmail | smtp.gmail.com | 587 | false | ✅ | 🐢 慢 |
| Outlook | smtp-mail.outlook.com | 587 | false | ✅ | 🐌 一般 |

**推荐优先级**：163 > QQ > Gmail > Outlook

## 安全建议

1. **不要将授权码提交到Git仓库**
2. **定期更换授权码**
3. **使用专用发件邮箱，不要使用个人主邮箱**
4. **生产环境必须关闭Mock模式**
5. **限制邮箱的每日发送数量**

## 验证配置

配置完成后，可以通过以下方式验证：

```bash
# 查看环境变量
cat .env.local | grep EMAIL

# 检查服务日志
# 应该看到：[邮件服务] 邮件服务初始化成功
```

## 邮件模板

当前支持的邮件模板：

1. **注册验证码** (`REGISTRATION_CODE`)
2. **密码重置** (`FORGOT_PASSWORD`) - 当前使用
3. **会员升级通知** (`MEMBERSHIP_UPGRADE`)
4. **系统通知** (`SYSTEM_NOTIFICATION`)

所有模板都支持HTML格式，提供美观的邮件样式。
