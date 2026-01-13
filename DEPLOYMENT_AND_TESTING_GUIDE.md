# 番茄小说AI写作工具 - 完整部署和测试指南

## 目录
1. [快速开始](#快速开始)
2. [Vercel部署步骤](#vercel部署步骤)
3. [环境变量配置](#环境变量配置)
4. [数据库初始化](#数据库初始化)
5. [测试指南](#测试指南)
6. [监控和维护](#监控和维护)
7. [常见问题](#常见问题)

---

## 快速开始

### 前置条件
- GitHub账号
- Vercel账号
- Supabase账号（或其他PostgreSQL数据库）
- 豆包API密钥

### 5分钟快速部署

1. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "feat: 添加完整的测试、缓存和监控系统"
   git push origin main
   ```

2. **在Vercel导入项目**
   - 访问 https://vercel.com/new
   - 选择GitHub仓库：`tomato-writer-2024/tomato-ai-writer`
   - 点击"Import"

3. **配置环境变量**
   在Vercel项目设置中添加以下环境变量：

   ```bash
   DATABASE_URL=postgresql://你的数据库连接字符串
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
   JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-at-least-32-characters
   DOUBAO_API_KEY=你的豆包API密钥
   NEXT_PUBLIC_BASE_URL=https://tomato-ai-writer.vercel.app
   NODE_ENV=production
   ```

4. **部署项目**
   - 点击"Deploy"按钮
   - 等待2-3分钟，部署完成

5. **初始化数据库**

   **方法1：在本地执行迁移（推荐）**
   ```bash
   # 配置环境变量
   vercel env pull .env.local

   # 执行数据库迁移
   npm run migrate
   ```

   **方法2：通过API检查（仅检查）**
   ```
   https://tomato-ai-writer.vercel.app/api/init-database
   ```
   此API仅检查表是否存在，不会创建表。

6. **创建管理员**
   访问以下URL创建超级管理员：
   ```
   https://tomato-ai-writer.vercel.app/api/init-admin
   ```

7. **验证部署**
   - 访问 https://tomato-ai-writer.vercel.app
   - 访问 https://tomato-ai-writer.vercel.app/diagnose 查看系统状态
   - 测试注册和登录功能

---

## Vercel部署步骤

### 1. 准备GitHub仓库

```bash
# 检查远程仓库
git remote -v

# 如果没有远程仓库，添加
git remote add origin https://github.com/tomato-writer-2024/tomato-ai-writer.git

# 推送代码
git push -u origin main
```

### 2. 连接Vercel和GitHub

1. 登录 https://vercel.com
2. 点击"New Project"
3. 点击"Continue with GitHub"
4. 授权Vercel访问你的GitHub仓库
5. 选择 `tomato-ai-writer` 项目
6. 点击"Import"

### 3. 配置项目

在Project Configuration页面：

```bash
# Framework Preset
Framework: Next.js

# Build Settings
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 4. 配置环境变量

在Environment Variables部分，添加以下变量：

| 变量名 | 值 | 是否必需 | 说明 |
|--------|-----|---------|------|
| DATABASE_URL | postgresql://... | 是 | PostgreSQL数据库连接字符串 |
| JWT_SECRET | 至少32位的随机字符串 | 是 | JWT访问Token密钥 |
| JWT_REFRESH_SECRET | 至少32位的随机字符串 | 是 | JWT刷新Token密钥 |
| DOUBAO_API_KEY | 你的豆包API密钥 | 是 | 豆包大语言模型API密钥 |
| NEXT_PUBLIC_BASE_URL | https://tomato-ai-writer.vercel.app | 是 | 应用基础URL |
| NODE_ENV | production | 是 | 运行环境 |
| EMAIL_HOST | smtp.163.com | 否 | SMTP服务器地址 |
| EMAIL_PORT | 465 | 否 | SMTP端口 |
| EMAIL_SECURE | true | 否 | 是否使用SSL |
| EMAIL_USER | your-email@163.com | 否 | 邮箱账号 |
| EMAIL_PASS | your-authorization-code | 否 | 邮箱授权码 |
| WECHAT_APPID | wx1234567890abcdef | 否 | 微信AppID |
| WECHAT_SECRET | your-wechat-secret | 否 | 微信AppSecret |
| WECHAT_MOCK_MODE | true | 否 | 是否使用Mock模式 |
| REDIS_URL | redis://... | 否 | Redis连接URL（用于缓存） |

### 5. 部署

点击"Deploy"按钮，等待2-3分钟。

部署完成后，Vercel会提供一个随机域名（如：tomato-ai-writer.vercel.app）。

---

## 环境变量配置

### DATABASE_URL

**格式：**
```
postgresql://username:password@host:port/database
```

**示例：**
```
postgresql://postgres.abc123:password123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**获取方式（使用Supabase）：**
1. 访问 https://supabase.com
2. 创建新项目
3. 进入Project Settings → Database
4. 复制Connection String（选择URI格式）

### JWT_SECRET 和 JWT_REFRESH_SECRET

**生成随机密钥：**
```bash
# 方法1：使用Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 方法2：使用OpenSSL
openssl rand -hex 32
```

**安全建议：**
- 至少32位随机字符串
- 不要使用可预测的字符串
- 不要硬编码在代码中
- 定期轮换密钥

### DOUBAO_API_KEY

**获取方式：**
1. 访问火山引擎控制台
2. 开通豆包大语言模型服务
3. 在API密钥管理中创建API密钥
4. 复制API密钥

### NEXT_PUBLIC_BASE_URL

**Vercel部署：**
```
https://tomato-ai-writer.vercel.app
```

**自定义域名：**
```
https://your-custom-domain.com
```

---

## 数据库初始化

### 方法1：通过API初始化（推荐）

**初始化数据库表结构：**
```bash
curl https://tomato-ai-writer.vercel.app/api/init-database
```

**创建超级管理员：**
```bash
curl "https://tomato-ai-writer.vercel.app/api/init-admin?email=admin@example.com&password=Admin123456"
```

### 方法2：使用脚本初始化

在Vercel CLI或终端中执行：

```bash
# 初始化数据库表
npm run migrate

# 创建超级管理员
npm run init-admin
```

### 验证数据库

访问诊断页面：
```
https://tomato-ai-writer.vercel.app/diagnose
```

检查数据库连接状态是否为"ok"。

---

## 测试指南

### 单元测试

**运行单元测试：**
```bash
# 运行所有测试
npm test

# 监听模式（开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

**测试文件位置：**
- `src/__tests__/auth.test.ts` - 认证功能测试
- `src/__tests__/userManager.test.ts` - 用户管理测试
- `src/__tests__/ai.test.ts` - AI服务测试
- `src/__tests__/utils.test.ts` - 工具函数测试

### 集成测试

**运行集成测试：**
```bash
# 确保本地服务已启动
npm run dev

# 在另一个终端运行集成测试
npm test -- --testPathPattern=integration
```

**测试文件位置：**
- `src/__tests__/integration/auth-flow.test.ts` - 认证流程测试
- `src/__tests__/integration/health-check.test.ts` - 健康检查测试
- `src/__tests__/integration/user-workflow.test.ts` - 用户工作流测试

### API测试

**使用curl测试：**

1. **健康检查**
   ```bash
   curl https://tomato-ai-writer.vercel.app/api/health
   ```

2. **注册用户**
   ```bash
   curl -X POST https://tomato-ai-writer.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "Test123456",
       "confirmPassword": "Test123456"
     }'
   ```

3. **登录**
   ```bash
   curl -X POST https://tomato-ai-writer.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test123456"
     }'
   ```

4. **获取用户信息**
   ```bash
   # 先登录获取token
   TOKEN="your-access-token"

   curl https://tomato-ai-writer.vercel.app/api/user/profile \
     -H "Authorization: Bearer $TOKEN"
   ```

### 端到端测试

**使用Playwright进行E2E测试：**

```bash
# 安装Playwright
npm install -D @playwright/test

# 运行E2E测试
npx playwright test
```

---

## 监控和维护

### Vercel Analytics

已集成Vercel Analytics，自动收集以下指标：

**Web Vitals：**
- LCP (Largest Contentful Paint) - 最大内容绘制时间
- FID (First Input Delay) - 首次输入延迟
- CLS (Cumulative Layout Shift) - 累积布局偏移
- FCP (First Contentful Paint) - 首次内容绘制
- TTFB (Time to First Byte) - 首字节时间

**访问数据：**
- 页面浏览量
- 独立访客数
- 地理分布
- 设备类型

**查看位置：**
https://vercel.com/tomato-writer-2024/tomato-ai-writer/analytics

### 自定义监控

**性能监控：**
```typescript
import { performanceMonitor } from '@/lib/monitoring';

// 记录函数执行时间
const { result, duration } = await performanceMonitor.measure(
  'api_call',
  () => fetch('/api/data')
);
```

**错误监控：**
```typescript
import { errorMonitor } from '@/lib/monitoring';

// 捕获错误
try {
  // 你的代码
} catch (error) {
  errorMonitor.captureError(error, { context: 'additional info' });
}
```

**用户行为追踪：**
```typescript
import { userBehaviorTracker } from '@/lib/monitoring';

// 追踪按钮点击
userBehaviorTracker.trackButtonClick('register_button');

// 追踪表单提交
userBehaviorTracker.trackFormSubmit('login_form', true);
```

### 日志查看

**Vercel实时日志：**
1. 访问 Vercel项目控制台
2. 点击"Logs"
3. 查看实时日志流

**重要日志标识：**
- `[ERROR]` - 错误日志
- `[WARN]` - 警告日志
- `[INFO]` - 信息日志
- `[Performance]` - 性能日志
- `[User Action]` - 用户行为

### 数据库备份

**自动备份（Supabase）：**
- 每天自动备份
- 保留30天
- 可随时恢复

**手动备份：**
```bash
# 导出数据库
pg_dump $DATABASE_URL > backup.sql

# 恢复数据库
psql $DATABASE_URL < backup.sql
```

---

## 常见问题

### Q1: 部署失败，提示"Build Failed"

**可能原因：**
- 依赖安装失败
- TypeScript类型错误
- 代码语法错误

**解决方案：**
1. 检查Vercel构建日志
2. 在本地运行 `npm run build` 确认无错误
3. 检查package.json依赖是否完整
4. 运行 `npm run type-check` 检查TypeScript类型

### Q2: 页面显示"访问遇到小插曲"

**可能原因：**
- 环境变量未配置
- 数据库连接失败
- API调用失败

**解决方案：**
1. 访问 `/diagnose` 页面查看详细错误
2. 检查Vercel环境变量是否正确配置
3. 检查DATABASE_URL是否有效
4. 运行 `/api/init-database` 初始化数据库

### Q3: 注册/登录失败

**可能原因：**
- JWT_SECRET未配置
- 数据库未初始化
- 密码字段错误

**解决方案：**
1. 检查JWT_SECRET是否已配置（至少32位）
2. 运行 `/api/init-database` 初始化数据库
3. 查看API返回的错误信息
4. 检查Vercel日志

### Q4: AI功能不工作

**可能原因：**
- DOUBAO_API_KEY未配置
- API密钥无效
- 网络问题

**解决方案：**
1. 检查DOUBAO_API_KEY是否已配置
2. 确认API密钥有效且有额度
3. 检查Vercel日志中的错误信息

### Q5: 如何查看系统状态？

**访问诊断页面：**
```
https://tomato-ai-writer.vercel.app/diagnose
```

**检查健康状态：**
```bash
curl https://tomato-ai-writer.vercel.app/api/health
```

### Q6: 如何更新代码？

**步骤：**
1. 修改代码
2. 提交到GitHub
3. Vercel自动部署
4. 等待2-3分钟

```bash
git add .
git commit -m "feat: 添加新功能"
git push origin main
```

### Q7: 如何回滚部署？

**步骤：**
1. 访问Vercel项目控制台
2. 点击"Deployments"
3. 找到要回滚的部署
4. 点击右上角三个点 → "Redeploy"

### Q8: 如何配置自定义域名？

**步骤：**
1. 访问Vercel项目设置 → Domains
2. 点击"Add Domain"
3. 输入你的域名（如：yourdomain.com）
4. 按照提示配置DNS记录
5. 等待SSL证书自动生成

### Q9: 如何设置告警？

**Vercel内置告警：**
1. 访问Vercel项目设置 → Alerts
2. 配置以下告警：
   - 部署失败
   - 错误率上升
   - 响应时间变慢

**第三方监控（可选）：**
- Sentry：错误监控
- PagerDuty：告警通知
- Slack：团队通知

### Q10: 如何优化性能？

**建议：**
1. 启用缓存策略
2. 优化数据库查询
3. 使用CDN加速静态资源
4. 压缩图片和代码
5. 实施服务端渲染（SSR）

---

## 安全加固

### 1. 定期更新依赖
```bash
# 检查过时的依赖
npm outdated

# 更新依赖
npm update
```

### 2. 启用CSP
已在 `next.config.mjs` 中配置了CSP策略。

### 3. 实施限流
已实现API限流保护：
- 登录API：每小时最多10次尝试
- 注册API：每小时最多5次尝试
- 普通API：每小时最多100次请求

### 4. SQL注入防护
已使用Drizzle ORM进行所有数据库查询，100%防止SQL注入。

### 5. XSS防护
已配置CSP头，防止XSS攻击。

### 6. CSRF防护
所有API请求应携带Authorization header或使用CSRF token。

---

## 性能优化

### 1. 静态资源缓存
在 `next.config.mjs` 中配置了图片优化和CDN。

### 2. API响应缓存
实施Redis缓存策略（需要配置REDIS_URL）。

### 3. 数据库查询优化
已添加必要的数据库索引。

### 4. 代码分割
Next.js自动进行代码分割，按需加载。

---

## 下一步

1. ✅ 配置Vercel环境变量
2. ✅ 初始化数据库
3. ✅ 创建超级管理员
4. ✅ 验证部署成功
5. ✅ 运行单元测试
6. ✅ 运行集成测试
7. ⏳ 配置自定义域名（可选）
8. ⏳ 集成错误监控（Sentry等）
9. ⏳ 设置告警通知
10. ⏳ 持续优化性能

---

## 联系支持

如遇到问题，请提供以下信息：
1. 访问的URL
2. 预期的行为
3. 实际的行为
4. 浏览器控制台错误信息
5. Vercel日志（如果可访问）

---

**文档版本：** v2.0
**最后更新：** 2024年
**项目地址：** https://github.com/tomato-writer-2024/tomato-ai-writer
**部署地址：** https://tomato-ai-writer.vercel.app
