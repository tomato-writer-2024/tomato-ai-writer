# 生产部署快速指南

## 📦 一、快速部署（本地/测试环境）

### 1. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local，至少配置以下内容：
# - DATABASE_URL: 数据库连接
# - SUPER_ADMIN_EMAIL: 超级管理员邮箱
# - SUPER_ADMIN_PASSWORD: 超级管理员密码
# - JWT_SECRET: JWT 密钥（至少32字符）
# - JWT_REFRESH_SECRET: JWT 刷新令牌密钥
```

### 2. 初始化数据库

```bash
# 安装 tsx (TypeScript 执行器)
pnpm add -D tsx

# 运行数据库初始化脚本
npx tsx src/scripts/init-database.ts
```

### 3. 创建超级管理员

```bash
# 运行超级管理员初始化脚本
npx tsx src/scripts/init-super-admin.ts
```

脚本执行后会输出：
- 邮箱: (SUPER_ADMIN_EMAIL 配置的值)
- 密码: (SUPER_ADMIN_PASSWORD 配置的值)
- 登录地址: http://localhost:5000/login

### 4. 启动服务

```bash
# 开发环境
bash .cozeproj/scripts/dev_run.sh

# 或生产环境
pnpm run build
pnpm run start
```

### 5. 访问应用

- 前端地址: http://localhost:5000
- 登录页面: http://localhost:5000/login
- 工作台: http://localhost:5000/workspace
- 后台审计: http://localhost:5000/admin/audit

## 🚀 二、生产环境部署

### 1. 服务器准备

**推荐配置**:
- CPU: 4核+
- 内存: 8GB+
- 硬盘: 50GB+ SSD
- 操作系统: Ubuntu 20.04+ / CentOS 8+
- Node.js: 18+ (推荐 LTS)

**安装 Node.js**:
```bash
# 使用 nvm 安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

**安装 pnpm**:
```bash
npm install -g pnpm
```

### 2. 部署代码

```bash
# 克隆代码仓库
git clone <repository-url> tomato-writer
cd tomato-writer

# 安装依赖
pnpm install --frozen-lockfile

# 配置环境变量
cp .env.example .env.production
nano .env.production  # 编辑配置
```

### 3. 初始化数据库和超级管理员

```bash
# 确保数据库已创建并配置好 DATABASE_URL

# 初始化数据库
npx tsx src/scripts/init-database.ts

# 创建超级管理员
npx tsx src/scripts/init-super-admin.ts
```

### 4. 构建和启动

```bash
# 构建生产版本
pnpm run build

# 使用 PM2 管理进程
npm install -g pm2
pm2 start npm --name "tomato-writer" -- start

# 设置开机自启
pm2 startup
pm2 save
```

### 5. 配置 Nginx

创建 Nginx 配置文件 `/etc/nginx/sites-available/tomato-writer`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置:
```bash
sudo ln -s /etc/nginx/sites-available/tomato-writer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. 配置 SSL (Let's Encrypt)

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

## 🔑 三、超级管理员账户信息

### 默认账户（未修改 .env 的情况下）

- **邮箱**: `admin@tomatowriter.com`
- **密码**: `TomatoAdmin@2024`
- **用户名**: `超级管理员`

### 自定义账户

如果您在 `.env.production` 中配置了自定义的超级管理员，请使用您配置的邮箱和密码。

### 安全提示

⚠️ **重要**：
1. **立即修改默认密码**
2. 不要在生产环境使用默认密码
3. 妥善保管管理员账户信息
4. 定期更换密码
5. 建议启用双因素认证（待实现）

## 📊 四、关键接口和页面

### 前端页面

| 页面 | 路径 | 说明 |
|-----|------|------|
| 首页 | `/` | 产品介绍和定价 |
| 登录 | `/login` | 用户登录 |
| 注册 | `/register` | 用户注册 |
| 工作台 | `/workspace` | 主要工作区域 |
| 作品列表 | `/works` | 管理作品 |
| 作品详情 | `/novel/[id]` | 查看和编辑作品 |
| 章节编辑 | `/novel/[id]/chapter/[chapterId]` | 编辑章节内容 |
| 创建章节 | `/novel/[id]/chapter/new` | 创建新章节 |
| 数据统计 | `/stats` | 查看写作数据 |
| 个人中心 | `/profile` | 管理个人设置 |
| 定价页 | `/pricing` | 查看会员套餐 |
| 支付页 | `/payment/[orderId]` | 支付页面 |
| 后台审计 | `/admin/audit` | 功能审计和测试 |

### API 接口

| 功能 | 路径 | 方法 | 说明 |
|-----|------|------|------|
| 用户注册 | `/api/auth/register` | POST | 注册新用户 |
| 用户登录 | `/api/auth/login` | POST | 用户登录 |
| 创建作品 | `/api/novels` | POST | 创建新作品 |
| 获取作品列表 | `/api/novels` | GET | 获取用户作品列表 |
| 创建章节 | `/api/novels/[id]/chapters` | POST | 创建新章节 |
| 更新章节 | `/api/novels/[id]/chapters/[chapterId]` | PUT | 更新章节内容 |
| AI 生成章节 | `/api/generate/chapter` | POST | AI 生成章节内容 |
| AI 润色内容 | `/api/polish` | POST | AI 润色优化 |
| AI 续写内容 | `/api/continue` | POST | AI 智能续写 |
| 文件上传 | `/api/files/upload` | POST | 上传文件 |
| 文件下载 | `/api/files/download/[key]` | GET | 下载文件 |
| 创建订单 | `/api/orders` | POST | 创建会员订单 |
| 支付回调 | `/api/payment/notify` | POST | 支付成功回调 |
| 综合测试 | `/api/test/comprehensive` | POST | 执行综合测试 |

## 🧪 五、功能测试验证

### 1. 基础功能测试

```bash
# 测试首页
curl -I http://localhost:5000

# 测试 API
curl http://localhost:5000/api/health

# 测试综合测试 API
curl -X POST http://localhost:5000/api/test/comprehensive \
  -H "Content-Type: application/json" \
  -d '{"testCount":5}'
```

### 2. 功能检查清单

- [ ] 用户可以注册新账户
- [ ] 用户可以登录系统
- [ ] 超级管理员可以登录
- [ ] 可以创建新作品
- [ ] 可以创建新章节
- [ ] AI 可以生成章节内容
- [ ] AI 可以润色内容
- [ ] AI 可以续写内容
- [ ] 可以上传文件
- [ ] 可以导出文件 (Word/TXT)
- [ ] 可以查看数据统计
- [ ] 可以查看后台审计页面

## 📝 六、故障排查

### 服务无法启动

1. 检查端口占用:
   ```bash
   ss -tuln | grep 5000
   ```

2. 检查环境变量:
   ```bash
   cat .env.production
   ```

3. 查看日志:
   ```bash
   pm2 logs tomato-writer
   ```

### 数据库连接失败

1. 检查数据库状态:
   ```bash
   sudo systemctl status postgresql
   ```

2. 测试连接:
   ```bash
   psql -h localhost -U your_user -d tomato_writer
   ```

3. 检查防火墙:
   ```bash
   sudo ufw status
   ```

### AI 功能不可用

1. 检查 API 配置
2. 检查网络连接
3. 查看错误日志

## 📞 七、支持与帮助

- 完整部署清单: `PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- 项目文档: `README.md`
- 功能审计报告: `FEATURE_AUDIT_REPORT.md`

## 🔐 八、安全建议

1. 定期更新依赖包:
   ```bash
   pnpm audit
   pnpm update
   ```

2. 配置防火墙:
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

3. 定期备份数据库

4. 配置监控告警

5. 使用强密码

---

**部署完成后，请务必**:
1. ✅ 修改超级管理员密码
2. ✅ 测试所有核心功能
3. ✅ 配置监控和告警
4. ✅ 配置自动备份
5. ✅ 制定应急响应预案

祝部署顺利！🎉
