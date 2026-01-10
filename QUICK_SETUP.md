# 快速配置指南 - 5分钟启用真实邮件和微信

## 📋 快速检查清单

在开始之前，确保你已完成以下步骤：

- [ ] 已部署应用到外网
- [ ] 已配置数据库连接
- [ ] 已配置豆包大模型API
- [ ] 已复制 `.env.example` 为 `.env.local`

---

## 📧 配置真实邮件（推荐163邮箱，2分钟）

### 步骤1：获取163邮箱授权码（1分钟）

1. 登录 [163邮箱](https://mail.163.com)
2. 点击顶部"设置" → "POP3/SMTP/IMAP"
3. 开启"POP3/SMTP服务"
4. 发送短信验证（免费）
5. 复制显示的**授权码**（不是登录密码）

### 步骤2：修改环境变量（30秒）

编辑 `.env.local` 文件：

```env
# 邮件配置（替换为你的真实信息）
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@163.com          # 替换为你的163邮箱
EMAIL_PASS=your-authorization-code     # 替换为刚才获取的授权码
EMAIL_FROM=your-email@163.com          # 替换为你的163邮箱

# 禁用Mock模式（启用真实邮件发送）
EMAIL_MOCK_MODE=false
```

### 步骤3：重启应用（30秒）

```bash
# 如果使用PM2
pm2 restart tomato-ai

# 或重启你的服务
```

### 步骤4：测试邮件发送（可选）

1. 访问忘记密码页面：`https://yourdomain.com/auth/forgot-password`
2. 输入你的邮箱
3. 检查邮箱是否收到重置密码邮件

**成功了！** ✅ 邮件服务已配置完成

---

## 🔧 配置真实微信登录（需要微信开放平台审核，1-7天）

### 步骤1：注册微信开放平台（5分钟）

1. 访问 [微信开放平台](https://open.weixin.qq.com)
2. 点击"立即注册"
3. 选择"开发者账号"
4. 填写开发者信息（需要个人或企业资质）
5. 提交审核（通常1-3个工作日）

### 步骤2：创建网站应用（5分钟）

审核通过后：

1. 登录微信开放平台
2. 进入"管理中心" → "网站应用"
3. 点击"创建网站应用"
4. 填写应用信息：
   - 应用名称：番茄AI写作助手
   - 应用简介：AI辅助创作、智能续写、精修润色
   - 应用官网：`https://yourdomain.com`
   - 上传官网截图
5. 提交审核（通常1-7个工作日）

### 步骤3：获取AppID和AppSecret（1分钟）

应用审核通过后：

1. 在管理中心找到你的应用
2. 点击"查看"进入应用详情
3. 复制 **AppID** 和 **AppSecret**

### 步骤4：配置授权回调域（1分钟）

1. 在应用详情页面，找到"授权回调域"
2. 填写：`yourdomain.com`（不要包含http://、https://或路径）
3. 点击保存

### 步骤5：修改环境变量（1分钟）

编辑 `.env.local` 文件：

```env
# 微信登录配置（替换为你的真实信息）
WECHAT_APPID=wx1234567890abcdef              # 替换为你的AppID
WECHAT_SECRET=your-wechat-app-secret         # 替换为你的AppSecret
WECHAT_MOCK_MODE=false                       # 禁用Mock模式
WECHAT_REDIRECT_URI=https://yourdomain.com/auth/wechat/callback  # 回调地址
```

### 步骤6：重启应用（30秒）

```bash
pm2 restart tomato-ai
```

### 步骤7：测试微信登录（2分钟）

1. 访问登录页面：`https://yourdomain.com/login`
2. 点击"微信登录"
3. 扫码授权
4. 检查是否成功登录

**成功了！** ✅ 微信登录已配置完成

---

## 🚀 快速部署命令

### 如果你有服务器访问权限

```bash
# SSH登录到服务器
ssh user@your-server

# 进入项目目录
cd /path/to/tomato-ai

# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
vim .env.local

# 安装依赖（如果需要）
pnpm install

# 构建项目
pnpm build

# 重启服务
pm2 restart tomato-ai
```

### 如果使用Docker部署

```bash
# 编辑docker-compose.yml，添加环境变量
vim docker-compose.yml

# 重新构建和启动
docker-compose down
docker-compose up -d --build
```

---

## ❓ 常见问题快速解决

### 邮件相关问题

**Q：邮件发送失败，提示"invalid login"**
```bash
# 检查授权码是否正确（不是登录密码）
# 163和QQ邮箱必须使用授权码
```

**Q：邮件发送失败，提示"timeout"**
```bash
# 检查网络连接
ping smtp.163.com

# 检查防火墙设置
sudo ufw allow 465/tcp
```

**Q：收不到邮件**
```bash
# 检查垃圾邮件文件夹
# 检查发件人地址是否被黑名单
```

### 微信登录相关问题

**Q：微信授权失败，提示"redirect_uri参数错误"**
```bash
# 检查回调域名是否与微信开放平台配置一致
# 不要包含http://、https://或路径
# 正确：yourdomain.com
# 错误：https://yourdomain.com
```

**Q：应用审核一直不通过**
```bash
# 检查应用信息是否完整
# 检查官网截图是否清晰
# 检查是否有违规内容
# 联系微信开放平台客服
```

**Q：获取不到用户信息**
```bash
# 检查AppSecret是否正确
# 检查access_token是否过期
# 检查API调用频率限制
```

### 环境变量相关问题

**Q：修改环境变量后没有生效**
```bash
# 需要重启应用
pm2 restart tomato-ai

# 或清除缓存
rm -rf .next
pnpm build
pm2 restart tomato-ai
```

**Q：忘记保存环境变量**
```bash
# 确保使用正确的编辑器
vim .env.local  # 保存：ESC -> :wq -> Enter

# 检查文件是否存在
ls -la .env.local
```

---

## 📞 获取帮助

如果遇到问题，可以：

1. **查看详细文档**：
   - [完整配置指南](./CONFIGURATION_GUIDE.md)
   - [环境变量模板](./.env.example)

2. **检查日志**：
```bash
# 查看应用日志
pm2 logs tomato-ai

# 查看邮件服务日志
grep "邮件服务" logs/app.log

# 查看微信登录日志
grep "微信登录" logs/app.log
```

3. **联系技术支持**：
   - 邮箱：admin@tomato-ai.com
   - GitHub Issues：[项目Issues页面](https://github.com/your-repo/issues)

---

## ✅ 配置完成检查清单

配置完成后，请确认以下功能正常：

- [ ] 用户可以注册账号并收到验证邮件
- [ ] 用户可以忘记密码并收到重置邮件
- [ ] 用户可以使用微信登录
- [ ] 超级管理员可以正常登录后台
- [ ] 用户可以创建订单并完成支付
- [ ] 用户可以使用AI生成功能

**全部检查通过！** 🎉 你已经完成了所有配置，可以开始使用了！

---

## 📚 更多资源

- **超级管理员文档**：[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)
- **部署和快速开始**：[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **完整配置指南**：[CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md)
- **环境变量模板**：[.env.example](./.env.example)

---

祝配置顺利！如有问题，随时联系我们。💪
