# 生产部署检查清单

## 📋 部署前准备

### 1. 环境变量配置

- [ ] 复制 `.env.example` 为 `.env.production`
- [ ] 配置 `DATABASE_URL` (PostgreSQL 数据库连接)
- [ ] 配置 `SUPER_ADMIN_EMAIL` (超级管理员邮箱)
- [ ] 配置 `SUPER_ADMIN_PASSWORD` (超级管理员密码 - 必须强密码)
- [ ] 配置 `SUPER_ADMIN_USERNAME` (超级管理员用户名)
- [ ] 修改 `JWT_SECRET` (至少32字符)
- [ ] 修改 `JWT_REFRESH_SECRET` (至少32字符)
- [ ] 配置 `NEXT_PUBLIC_APP_URL` (生产域名)
- [ ] 配置 `S3_*` (对象存储配置)
- [ ] 配置支付相关参数 (`ALIPAY_*`, `WECHAT_*`)
- [ ] 配置邮件服务参数 (`SMTP_*`)
- [ ] 配置 `ALLOWED_ORIGINS` (CORS 白名单)
- [ ] 配置 `SENTRY_DSN` (错误监控，推荐)

### 2. 数据库准备

- [ ] 创建生产数据库实例 (推荐: PostgreSQL 14+)
- [ ] 配置数据库用户权限
- [ ] 配置数据库备份策略
- [ ] 配置数据库连接池
- [ ] 运行数据库初始化脚本:
  ```bash
  npx tsx src/scripts/init-database.ts
  ```
- [ ] 运行超级管理员初始化脚本:
  ```bash
  npx tsx src/scripts/init-super-admin.ts
  ```
- [ ] 验证表结构完整性
- [ ] 测试数据库连接

### 3. 对象存储配置

- [ ] 创建 S3 兼容存储桶
- [ ] 配置访问策略 (CORS, ACL)
- [ ] 配置 CDN 加速 (可选)
- [ ] 测试文件上传/下载
- [ ] 配置生命周期策略 (自动清理过期文件)

### 4. 支付系统集成

- [ ] 申请支付宝商家账号
- [ ] 申请微信支付商户号
- [ ] 配置支付回调地址
- [ ] 测试支付流程 (沙箱环境)
- [ ] 配置退款流程
- [ ] 配置订单查询接口

### 5. 域名与SSL

- [ ] 购买生产域名
- [ ] 配置 DNS 解析
- [ ] 申请 SSL 证书 (推荐 Let's Encrypt)
- [ ] 配置 HTTPS 重定向
- [ ] 配置 HSTS 头

### 6. 服务器准备

- [ ] 购买云服务器 (推荐: 4核8G 起步)
- [ ] 安装 Node.js 18+
- [ ] 安装 pnpm 包管理器
- [ ] 配置防火墙规则 (只开放 80, 443, 22 端口)
- [ ] 配置 Nginx 反向代理
- [ ] 配置日志轮转

## 🔒 安全检查

### 1. 应用安全

- [ ] 修改所有默认密码
- [ ] 启用 HTTPS
- [ ] 配置 CSP (Content Security Policy)
- [ ] 配置 XSS 保护
- [ ] 配置 CSRF 保护
- [ ] 配置 Rate Limiting
- [ ] 禁用 CORS 暴露 (生产)
- [ ] 移除调试日志

### 2. 数据安全

- [ ] 数据库连接使用 SSL
- [ ] 敏感字段加密存储
- [ ] 配置数据库备份 (自动 + 手动)
- [ ] 测试数据库恢复流程
- [ ] 配置数据归档策略

### 3. 访问控制

- [ ] 配置 IP 白名单 (如需要)
- [ ] 启用 2FA (双因素认证)
- [ ] 配置审计日志
- [ ] 配置异常登录检测
- [ ] 配置用户封禁机制

## 🚀 部署流程

### 1. 代码部署

```bash
# 1. 克隆代码
git clone <repository>
cd <project>

# 2. 安装依赖
pnpm install --frozen-lockfile

# 3. 构建项目
pnpm run build

# 4. 启动服务
pnpm run start
```

### 2. 验证部署

- [ ] 检查服务状态 (`curl http://localhost:5000/health`)
- [ ] 检查 API 响应
- [ ] 测试用户注册/登录
- [ ] 测试超级管理员登录
- [ ] 测试 AI 写作功能
- [ ] 测试文件上传/下载
- [ ] 测试支付流程 (沙箱)
- [ ] 测试导出功能

### 3. 配置进程管理

使用 PM2 管理进程:

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start npm --name "tomato-writer" -- start

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs tomato-writer

# 重启服务
pm2 restart tomato-writer
```

### 4. 配置 Nginx

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

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 上传文件大小限制
    client_max_body_size 10M;

    # 反向代理
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

## 📊 监控与运维

### 1. 监控配置

- [ ] 配置应用性能监控 (APM)
- [ ] 配置错误追踪 (Sentry)
- [ ] 配置日志聚合 (ELK 或 Loki)
- [ ] 配置告警通知 (邮件/短信/钉钉)
- [ ] 配置 Uptime 监控

### 2. 日志管理

- [ ] 配置应用日志级别 (生产: warn, error)
- [ ] 配置日志轮转
- [ ] 配置日志保留策略 (30天)
- [ ] 配置安全日志审计
- [ ] 配置访问日志分析

### 3. 备份策略

- [ ] 数据库每日自动备份
- [ ] 数据库异地备份
- [ ] 配置代码版本回滚
- [ ] 测试备份恢复流程

### 4. 扩展性

- [ ] 配置负载均衡 (如需要)
- [ ] 配置数据库读写分离 (如需要)
- [ ] 配置 Redis 缓存 (如需要)
- [ ] 配置 CDN 加速

## 🧪 测试清单

### 功能测试

- [ ] 用户注册流程
- [ ] 用户登录流程
- [ ] 密码重置流程
- [ ] 超级管理员登录
- [ ] AI 章节生成
- [ ] AI 精修润色
- [ ] AI 智能续写
- [ ] 文件上传 (Word/PDF/TXT)
- [ ] 文件导出 (Word/PDF/TXT)
- [ ] 会员购买流程
- [ ] 支付成功回调
- [ ] 支付失败处理
- [ ] 数据统计展示
- [ ] 质量评分计算
- [ ] 完读率预测

### 性能测试

- [ ] 页面加载时间 < 2s
- [ ] API 响应时间 < 500ms
- [ ] AI 首字响应时间 < 1s
- [ ] 并发用户测试 (100+)
- [ ] 压力测试

### 安全测试

- [ ] SQL 注入测试
- [ ] XSS 攻击测试
- [ ] CSRF 攻击测试
- [ ] 暴力破解测试
- [ ] 敏感信息泄露测试
- [ ] 权限绕过测试

## 📝 上线后检查

### 1. 运营准备

- [ ] 准备用户帮助文档
- [ ] 准备视频教程
- [ ] 准备 FAQ
- [ ] 配置客服联系方式
- [ ] 准备运营活动方案

### 2. 合规检查

- [ ] 隐私政策
- [ ] 服务条款
- [ ] 用户协议
- [ ] 数据处理协议
- [ ] ICP 备案 (国内)
- [ ] 公安备案 (国内)

### 3. 持续优化

- [ ] 收集用户反馈
- [ ] 监控应用性能
- [ ] 优化 AI 模型参数
- [ ] 优化数据库查询
- [ ] 优化用户体验

## 🆘 应急预案

### 1. 服务宕机

- [ ] 配置自动重启
- [ ] 配置健康检查
- [ ] 准备备用服务器
- [ ] 制定恢复流程

### 2. 数据丢失

- [ ] 验证备份有效性
- [ ] 制定恢复步骤
- [ ] 配置数据恢复通知
- [ ] 评估数据丢失影响

### 3. 安全事件

- [ ] 建立应急响应团队
- [ ] 制定安全事件处理流程
- [ ] 准备公关应对方案
- [ ] 配置安全事件通知

## ✅ 部署检查摘要

### 必须完成 (Critical)

- [ ] 环境变量配置完整
- [ ] 数据库初始化完成
- [ ] 超级管理员创建完成
- [ ] HTTPS 配置完成
- [ ] 支付系统测试通过
- [ ] 监控告警配置完成

### 推荐完成 (Recommended)

- [ ] CDN 配置
- [ ] Redis 缓存配置
- [ ] 负载均衡配置
- [ ] 自动备份配置
- [ ] 错误监控配置

### 可选完成 (Optional)

- [ ] 2FA 双因素认证
- [ ] 数据库读写分离
- [ ] 多地域部署
- [ ] 自定义域名邮箱

---

**部署日期**: ___________
**部署人员**: ___________
**审核人员**: ___________
**签名**: ___________
