# 🚀 部署渠道方案

## 💡 扣子空间部署分析

### ❌ 当前限制

**扣子空间（Coze）**主要特点：
- ✅ AI对话型应用（Bot）
- ❌ **不适用于**完整Next.js Web应用
- ❌ 不支持数据库持久化
- ❌ 不支持文件存储
- ❌ 不支持复杂的前端交互

**本项目技术栈**：
- Next.js 16 (全栈Web应用)
- PostgreSQL/SQLite数据库
- 用户认证系统（JWT）
- 文件上传下载
- 复杂的前端交互

**结论**: ❌ **不推荐**在扣子空间部署

---

## ✅ 推荐部署渠道

### 方案对比

| 方案 | 成本 | 适合场景 | 上线难度 | 稳定性 | 推荐指数 |
|-----|------|---------|---------|--------|---------|
| **本地部署** | ¥0 | 个人测试/小范围试用 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Vercel** | ¥0-20 | MVP/小规模用户 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Railway** | ¥5-50 | 小规模正式运行 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Render** | ¥0-7 | 小规模正式运行 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Fly.io** | ¥0-5 | 全球部署 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🎯 立即可用方案（按推荐顺序）

### 方案1: Vercel + Supabase（⭐⭐⭐⭐⭐ 强烈推荐）

**总成本**: ¥0/月
**上线时间**: 10-15分钟
**适合**: MVP验证、小规模用户（<1000日活）

#### 优势
- ✅ 完全免费（100GB带宽/月）
- ✅ 自动HTTPS
- ✅ 全球CDN加速
- ✅ 自动部署（Git推送）
- ✅ Supabase免费500MB数据库+1GB存储
- ✅ 专业域名（yourname.vercel.app）

#### 准备工作

1. **注册账号**
   - Vercel: https://vercel.com/signup
   - Supabase: https://supabase.com/signup

2. **配置Supabase**
   ```bash
   # 1. 创建项目
   - 登录Supabase
   - 点击"New Project"
   - 设置项目名称: tomato-ai-writer
   - 数据库密码: 设置强密码（保存好！）
   - 区域: 选择最近的（如 Singapore 或 Tokyo）
   - 等待初始化完成（约2-3分钟）

   # 2. 获取数据库连接字符串
   - 进入 Project Settings > Database
   - 复制 Connection String > URI
   - 格式: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
   ```

3. **创建环境变量文件**
   ```bash
   # 创建 .env.production.local
   cat > .env.production.local <<EOF
   # 数据库
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

   # JWT密钥（生成随机密钥）
   JWT_SECRET=$(openssl rand -base64 32)
   JWT_REFRESH_SECRET=$(openssl rand -base64 32)

   # 超级管理员
   SUPER_ADMIN_EMAIL=admin@yourdomain.com
   SUPER_ADMIN_PASSWORD=YourSecurePassword123!
   SUPER_ADMIN_USERNAME=超级管理员

   # 应用配置
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://tomato-ai-writer.vercel.app
   EOF
   ```

#### 部署步骤

```bash
# 1. 登录Vercel
npm i -g vercel
vercel login

# 2. 初始化项目
vercel

# 按提示选择：
# - Set up and deploy: Yes
# - Link to existing project: No
# - Project name: tomato-ai-writer
# - Directory: ./
# - Override settings: Yes
# - Build Command: pnpm run build
# - Output Directory: .next

# 3. 配置环境变量
# 在Vercel控制台 > Settings > Environment Variables
# 添加 .env.production.local 中的所有变量

# 4. 重新部署
vercel --prod

# 5. 初始化数据库
# 在Vercel控制台 > Deployment > Terminal
# 或本地运行：
vercel env pull .env.local
pnpm run init-all
```

#### 验证部署

```bash
# 1. 访问网站
https://tomato-ai-writer.vercel.app

# 2. 注册测试账号
# 3. 测试AI写作功能
# 4. 测试支付流程
```

#### 自定义域名（可选）

```bash
# 1. 在域名购买商添加DNS记录
CNAME   yourdomain.com   cname.vercel-dns.com
CNAME   www              cname.vercel-dns.com

# 2. 在Vercel添加域名
# Settings > Domains > Add Domain

# 3. 等待DNS生效（约5-10分钟）
```

---

### 方案2: Railway（⭐⭐⭐⭐ 推荐）

**总成本**: ¥5/月（$0.7）
**上线时间**: 10分钟
**适合**: 小规模正式运行（<5000日活）

#### 优势
- ✅ 全栈托管（数据库+应用）
- ✅ 自动HTTPS
- ✅ 内置PostgreSQL数据库
- ✅ 按需付费（$0.00056/秒）
- ✅ 简单易用

#### 准备工作

1. **注册账号**
   - Railway: https://railway.app

2. **GitHub连接**
   - 推荐连接GitHub账号
   - 将项目推送到GitHub仓库

#### 部署步骤

```bash
# 1. 访问Railway控制台
https://railway.app

# 2. 创建新项目
# 点击 "New Project" > "Deploy from GitHub repo"
# 选择你的仓库

# 3. 配置Root Directory
# 留空（根目录）

# 4. 构建命令
Build Command: pnpm install && pnpm run build
Start Command: pnpm run start

# 5. 添加PostgreSQL服务
# 在项目中点击 "New Service" > "Database" > "Add PostgreSQL"
# Railway会自动提供数据库连接字符串

# 6. 配置环境变量
# 在项目 Settings > Variables 中添加：
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=YourSecurePassword123!
SUPER_ADMIN_USERNAME=超级管理员

# 7. 部署
# Railway会自动部署
# 等待构建完成（约3-5分钟）

# 8. 初始化数据库
# 在Railway控制台打开项目终端
# 运行: pnpm run init-all
```

#### 验证部署

```bash
# 1. 访问网站
https://your-app.railway.app

# 2. 测试功能
# 注册、登录、AI写作、支付等
```

---

### 方案3: 本地部署（⭐⭐⭐⭐ 适合内测）

**总成本**: ¥0
**上线时间**: 5分钟
**适合**: 个人使用、小范围内测

#### 优势
- ✅ 完全免费
- ✅ 数据完全本地
- ✅ 无网络依赖
- ✅ 可随时修改

#### 部署步骤

```bash
# 1. 确保项目在本地运行
cd /workspace/projects/
pnpm install

# 2. 配置环境变量
cat > .env.local <<EOF
DATABASE_URL=sqlite:./local.db
USE_LOCAL_STORAGE=true
LOCAL_STORAGE_PATH=./uploads
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:5000
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
SUPER_ADMIN_EMAIL=admin@localhost
SUPER_ADMIN_PASSWORD=Admin@123456
SUPER_ADMIN_USERNAME=超级管理员
EOF

# 3. 初始化数据库和管理员
pnpm run init-all

# 4. 启动服务
pnpm run dev

# 5. 访问应用
http://localhost:5000
```

#### 内网穿透（可选）

如果需要外网访问：

```bash
# 使用 ngrok（推荐）
npm install -g ngrok
ngrok http 5000

# 访问: https://xxxx-xx-xx-xx-xx.ngrok.io
```

---

## 📊 部署方案对比表

### 功能对比

| 功能 | 本地 | Vercel | Railway | Render | Fly.io |
|-----|------|--------|---------|--------|--------|
| 自动HTTPS | ❌ | ✅ | ✅ | ✅ | ✅ |
| 数据库 | SQLite | Supabase | 内置 | 需配置 | 需配置 |
| 文件存储 | 本地 | Supabase | 内置 | 需配置 | 需配置 |
| 自动部署 | ❌ | ✅ | ✅ | ✅ | ✅ |
| CDN加速 | ❌ | ✅ | ❌ | ❌ | ✅ |
| 全球节点 | ❌ | ✅ | ❌ | ❌ | ✅ |
| 日志查看 | 本地 | ✅ | ✅ | ✅ | ✅ |
| 监控告警 | ❌ | ✅ | ✅ | ✅ | ✅ |
| 自定义域名 | ⚠️ | ✅ | ✅ | ✅ | ✅ |

### 成本对比（月均）

| 用户规模 | 本地 | Vercel | Railway | Render | Fly.io |
|---------|------|--------|---------|--------|--------|
| < 100用户 | ¥0 | ¥0 | ¥5 | ¥0 | ¥0 |
| < 1000用户 | ¥0 | ¥0 | ¥5 | ¥7 | ¥5 |
| < 5000用户 | ¥0 | ¥20 | ¥20 | ¥25 | ¥15 |
| < 10000用户 | ¥0 | ¥50 | ¥50 | ¥50 | ¥30 |

---

## 🎯 快速部署决策树

```
开始
  ↓
需要外网访问？
  ├─ 否 → 本地部署（5分钟）
  └─ 是 → 继续下判断
        ↓
      小规模测试（<100用户）？
        ├─ 是 → Vercel（免费，10分钟）
        └─ 否 → 继续下判断
              ↓
            预算敏感？
              ├─ 是 → Railway（$5/月，10分钟）
              └─ 否 → 继续下判断
                    ↓
                  需要全球加速？
                    ├─ 是 → Vercel（最佳CDN）
                    └─ 否 → Railway（最佳性价比）
```

---

## 🚀 我的推荐

### 立即部署（0成本）

**推荐：Vercel + Supabase**

- ✅ 完全免费（100GB带宽）
- ✅ 部署简单（10分钟）
- ✅ 自动HTTPS + CDN
- ✅ Supabase免费500MB数据库
- ✅ 专业域名（.vercel.app）

### 适合正式运营

**推荐：Railway**

- ✅ 全栈托管
- ✅ 内置PostgreSQL
- ✅ 按需付费（$5/月起步）
- ✅ 简单易用

---

## 📝 部署后检查清单

部署完成后，请确认：

- [ ] 网站可正常访问（HTTPS）
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] AI写作功能正常
- [ ] 支付流程完整（订单创建→支付→升级）
- [ ] 微信收款码显示正常
- [ ] 管理员后台可访问
- [ ] 文件上传下载正常
- [ ] 数据库连接正常
- [ ] 环境变量配置正确

---

## 🔗 快速链接

- **Vercel文档**: https://vercel.com/docs
- **Supabase文档**: https://supabase.com/docs
- **Railway文档**: https://docs.railway.app
- **Next.js部署**: https://nextjs.org/docs/deployment
