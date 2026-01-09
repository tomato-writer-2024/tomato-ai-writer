# 🚀 10分钟快速部署指南

## 推荐方案：Vercel + Supabase（0成本，最简单）

---

## ⚡ 步骤1: 注册账号（3分钟）

### 1.1 注册Vercel
1. 访问：https://vercel.com/signup
2. 使用GitHub账号登录（推荐）
3. 完成邮箱验证

### 1.2 注册Supabase
1. 访问：https://supabase.com/signup
2. 使用GitHub账号登录
3. 完成邮箱验证

---

## ⚡ 步骤2: 配置Supabase（5分钟）

### 2.1 创建数据库项目
1. 登录Supabase控制台
2. 点击 **"New Project"**
3. 填写信息：
   - **Name**: `tomato-ai-writer`
   - **Database Password**: 设置强密码（**一定要保存！**）
   - **Region**: 选择 `Singapore` 或 `Tokyo`（更接近中国）
4. 点击 **"Create new project"**
5. 等待初始化完成（约2-3分钟）

### 2.2 获取数据库连接字符串
1. 在Supabase项目页面，点击左侧 **"Settings"** > **"Database"**
2. 找到 **"Connection String"** 部分
3. 选择 **"URI"** 标签
4. 点击 **"Copy"** 按钮
5. 格式如下：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

---

## ⚡ 步骤3: 推送代码到GitHub（2分钟）

### 3.1 创建GitHub仓库
1. 访问：https://github.com/new
2. 仓库名：`tomato-ai-writer`
3. 选择：**Public**（公开）或 **Private**（私有）
4. 点击 **"Create repository"**

### 3.2 推送代码
```bash
# 在项目目录执行
cd /workspace/projects/

# 初始化Git（如果还没有）
git init
git add .
git commit -m "Initial commit: 番茄AI写作助手"

# 添加远程仓库（替换YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/tomato-ai-writer.git

# 推送代码
git branch -M main
git push -u origin main
```

---

## ⚡ 步骤4: 部署到Vercel（3分钟）

### 4.1 导入项目
1. 访问：https://vercel.com/dashboard
2. 点击 **"Add New..."** > **"Project"**
3. 点击 **"Continue with GitHub"**
4. 授权Vercel访问GitHub
5. 在仓库列表中找到 `tomato-ai-writer`
6. 点击 **"Import"**

### 4.2 配置项目
填写以下信息：
- **Project Name**: `tomato-ai-writer`（自动生成，可修改）
- **Framework Preset**: `Next.js`（自动检测）
- **Root Directory**: `./`（默认）
- **Build Command**: `pnpm run build`（自动检测）
- **Output Directory**: `.next`（自动检测）

点击 **"Deploy"**

### 4.3 等待部署
- Vercel会自动构建和部署
- 等待约2-3分钟
- 看到 **"Congratulations!"** 页面说明部署成功

### 4.4 记录部署URL
- 部署成功后，会看到类似URL：
  ```
  https://tomato-ai-writer.vercel.app
  ```
- **复制保存这个URL！**

---

## ⚡ 步骤5: 配置环境变量（2分钟）

### 5.1 打开Vercel项目设置
1. 在Vercel控制台，点击项目名 `tomato-ai-writer`
2. 点击顶部 **"Settings"** 标签
3. 点击左侧 **"Environment Variables"**

### 5.2 添加环境变量
逐个添加以下变量（点击 **"Add New"）：

| Name | Value | Environment |
|------|-------|------------|
| `DATABASE_URL` | Supabase连接字符串（步骤2.2获取） | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `NEXT_PUBLIC_APP_URL` | Vercel部署URL（如 `https://tomato-ai-writer.vercel.app`） | Production, Preview, Development |
| `JWT_SECRET` | 随机生成的密钥（见下方） | Production, Preview, Development |
| `JWT_REFRESH_SECRET` | 随机生成的密钥（见下方） | Production, Preview, Development |
| `SUPER_ADMIN_EMAIL` | `admin@yourdomain.com`（替换为你的邮箱） | Production |
| `SUPER_ADMIN_PASSWORD` | 设置强密码（如 `YourSecurePassword123!`） | Production |
| `SUPER_ADMIN_USERNAME` | `超级管理员` | Production |

### 5.3 生成JWT密钥

在本地终端运行：
```bash
# 生成JWT密钥
openssl rand -base64 32
# 复制输出，填入 JWT_SECRET

# 生成刷新令牌密钥
openssl rand -base64 32
# 复制输出，填入 JWT_REFRESH_SECRET
```

### 5.4 保存并重新部署
- 点击 **"Save"** 保存环境变量
- Vercel会提示重新部署
- 点击 **"Redeploy"** 按钮
- 等待重新部署完成（约1-2分钟）

---

## ⚡ 步骤6: 初始化数据库（2分钟）

### 6.1 打开Vercel部署终端
1. 在Vercel项目页面，点击 **"Deployments"** 标签
2. 找到最新的部署，点击 **"..."** 菜单
3. 点击 **"Open Terminal"**

### 6.2 运行初始化命令
```bash
# 初始化数据库表
pnpm run init-db

# 创建超级管理员
pnpm run init-admin

# 或一次性执行
pnpm run init-all
```

**重要**: 等待命令执行完成，确保没有错误！

---

## ⚡ 步骤7: 验证部署（1分钟）

### 7.1 访问网站
打开浏览器，访问：
```
https://tomato-ai-writer.vercel.app
```

### 7.2 测试功能
- [ ] ✅ 页面正常加载
- [ ] ✅ 可以注册新账号
- [ ] ✅ 可以登录
- [ ] ✅ AI写作功能正常
- [ ] ✅ 定价页面显示正常
- [ ] ✅ 微信收款码显示正常
- [ ] ✅ 可以创建订单
- [ ] ✅ 管理员可以登录（使用步骤5.2配置的账号）

### 7.3 测试支付流程
1. 访问定价页面
2. 选择一个套餐（如基础版 ¥29/月）
3. 点击"立即订阅"
4. 查看支付页面
5. 确认微信收款码显示正常
6. （小额）扫码测试支付
7. 点击"已支付，确认支付"
8. 确认会员立即生效

---

## ⚡ 步骤8: 配置自定义域名（可选，5分钟）

### 8.1 购买域名（如果还没有）
- **阿里云**: https://wanwang.aliyun.com（推荐，便宜）
- **腾讯云**: https://dnspod.cloud.tencent.com
- **Cloudflare**: https://www.cloudflare.com/products/registrar（推荐，便宜）

### 8.2 在Vercel添加域名
1. 在Vercel项目 > **Settings** > **Domains**
2. 输入你的域名（如 `tomato-ai.com`）
3. 点击 **"Add"**

### 8.3 配置DNS记录
Vercel会显示需要添加的DNS记录，例如：

| Type | Name | Value |
|------|------|-------|
| CNAME | `@` | `cname.vercel-dns.com` |
| CNAME | `www` | `cname.vercel-dns.com` |

在你的域名服务商添加这些记录。

### 8.4 等待DNS生效
- 通常5-10分钟生效
- 最长可能需要24小时
- Vercel会自动检测并配置HTTPS

---

## 🎉 完成！

### 成功标志

✅ **网站已上线**
- 访问地址：`https://tomato-ai-writer.vercel.app` 或你的自定义域名
- HTTPS自动配置完成
- 全球CDN加速

✅ **数据库已配置**
- Supabase PostgreSQL数据库
- 自动备份
- 数据隔离

✅ **支付系统已就绪**
- 微信收款码显示
- 订单创建流程
- 会员自动升级

✅ **管理员后台可访问**
- 超级管理员账号已创建
- 订单管理功能正常

---

## 📊 下一步：推广

查看 `0_COST_PROMOTION_CHANNELS.md` 了解0成本推广方案！

---

## ❓ 常见问题

### Q1: 部署失败怎么办？
**A**:
1. 检查环境变量是否正确配置
2. 查看Vercel部署日志
3. 确保数据库连接字符串正确
4. 重新推送代码触发部署

### Q2: 数据库连接失败？
**A**:
1. 检查Supabase项目是否正常运行
2. 检查数据库连接字符串是否正确
3. 检查Vercel环境变量配置
4. 尝试重新部署

### Q3: 环境变量不生效？
**A**:
- 环境变量修改后必须重新部署
- 点击Vercel的"Redeploy"按钮

### Q4: 如何查看数据库数据？
**A**:
1. 登录Supabase控制台
2. 进入项目
3. 点击左侧 **"Table Editor"**
4. 可以查看和管理所有表数据

### Q5: 如何备份数据？
**A**:
- Supabase自动每天备份数据库
- 可以在项目 > Settings > Database 查看备份

---

## 🔗 有用链接

- **Vercel控制台**: https://vercel.com/dashboard
- **Supabase控制台**: https://supabase.com/dashboard
- **项目部署日志**: Vercel项目 > Deployments > 选择部署 > Logs
- **数据库管理**: Supabase项目 > Table Editor

---

## 📞 需要帮助？

如果在部署过程中遇到问题，请检查：
1. Vercel部署日志
2. 浏览器控制台（F12）
3. 环境变量配置
4. 数据库连接状态

祝部署顺利！🚀
