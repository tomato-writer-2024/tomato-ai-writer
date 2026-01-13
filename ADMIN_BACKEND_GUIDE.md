# 管理员后台使用指南

> 本指南详细说明管理员后台的位置、访问方式和功能模块。

---

## 目录

1. [管理员后台概览](#管理员后台概览)
2. [创建超级管理员](#创建超级管理员)
3. [管理员后台位置](#管理员后台位置)
4. [管理员登录](#管理员登录)
5. [功能模块说明](#功能模块说明)
6. [常见问题](#常见问题)

---

## 管理员后台概览

### 管理员后台路径

管理员后台的所有页面都位于 `/admin/*` 路径下：

| 页面 | 路径 | 说明 |
|------|------|------|
| **管理员登录** | `/admin/login` | 管理员登录页面 |
| **仪表盘** | `/admin/dashboard` | 系统概览和数据统计 |
| **用户管理** | `/admin/users` | 用户列表和用户信息管理 |
| **订单管理** | `/admin/orders` | 会员订单和支付审核 |
| **测试报告** | `/admin/testing` | 自动化测试结果查看 |
| **测试详情** | `/admin/testing/[testId]` | 查看特定测试的详细报告 |
| **审计日志** | `/admin/audit` | 系统操作日志和安全事件 |
| **功能测试** | `/admin/new-features-test` | 新功能测试页面 |

### 管理员角色

系统支持以下管理员角色：

| 角色 | 权限级别 | 说明 |
|------|---------|------|
| **DEVELOPER** | ⭐⭐⭐⭐⭐ | 超级管理员，拥有所有权限 |
| **ADMIN** | ⭐⭐⭐⭐ | 普通管理员，可管理用户和订单 |
| **MODERATOR** | ⭐⭐⭐ | 审核员，可审核内容 |
| **FREE** | ⭐ | 普通用户，无管理权限 |

**超级管理员标识**：
- 角色：`DEVELOPER`
- 字段：`is_super_admin = true`
- 会员等级：`PREMIUM` 或 `ENTERPRISE`

---

## 创建超级管理员

### 方法 1：使用 API（推荐）

#### 在本地环境

1. 确保开发服务器正在运行：
   ```bash
   npm run dev
   ```

2. 在浏览器中访问以下 URL：
   ```
   http://localhost:5000/api/init-admin?email=admin@example.com&password=Admin@123456&username=超级管理员
   ```

3. 替换参数：
   - `email`: 管理员邮箱
   - `password`: 管理员密码（至少 8 位）
   - `username`: 管理员用户名（可选）

4. 成功后返回：
   ```json
   {
     "success": true,
     "message": "超级管理员创建成功",
     "data": {
       "id": "uuid",
       "email": "admin@example.com",
       "username": "超级管理员",
       "role": "DEVELOPER",
       "membershipLevel": "PREMIUM"
     }
   }
   ```

#### 在生产环境（Vercel）

访问生产环境的 API：
```
https://tomato-ai-writer.vercel.app/api/init-admin?email=your-admin-email@example.com&password=YourPassword123
```

---

### 方法 2：使用命令行脚本

```bash
# 1. 安装 tsx（如果未安装）
npm install -D tsx

# 2. 运行初始化脚本
npm run init-admin
```

或在环境变量中配置管理员信息：

```env
# .env.local
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=Admin@123456
SUPER_ADMIN_USERNAME=超级管理员
```

---

### 方法 3：使用超级管理员创建 API

访问专用 API 端点：

```
GET /api/admin/create-super-admin
```

参数：
- `email`: 管理员邮箱
- `password`: 管理员密码
- `username`: 管理员用户名（可选）

---

## 管理员后台位置

### 本地环境

```
http://localhost:5000/admin/login
```

### 生产环境（Vercel）

```
https://tomato-ai-writer.vercel.app/admin/login
```

### 自定义域名

如果配置了自定义域名：

```
https://your-domain.com/admin/login
```

---

## 管理员登录

### 登录流程

1. **访问登录页面**
   - 本地：http://localhost:5000/admin/login
   - 生产：https://tomato-ai-writer.vercel.app/admin/login

2. **输入管理员凭据**
   - 邮箱：创建管理员时使用的邮箱
   - 密码：创建管理员时设置的密码

3. **点击登录按钮**

4. **跳转到仪表盘**
   - 成功登录后自动跳转到 `/admin/dashboard`

### 登录验证

管理员登录后，系统会：
1. 验证管理员角色（必须是 DEVELOPER 或 ADMIN）
2. 检查 `is_super_admin` 标识
3. 生成管理员 Token
4. 存储到 `localStorage`：
   - `admin_token`: JWT Token
   - `admin_info`: 管理员信息对象

### 权限检查

如果登录用户不是管理员，会自动跳转到：
- 普通用户登录页：`/login`
- 或显示权限不足的错误提示

---

## 功能模块说明

### 1. 管理员仪表盘 (`/admin/dashboard`)

**位置**：
- 本地：http://localhost:5000/admin/dashboard
- 生产：https://tomato-ai-writer.vercel.app/admin/dashboard

**功能**：
- 系统概览（用户总数、作品总数、订单数量）
- 数据统计（新增用户、活跃用户、会员转化率）
- 性能指标（API 响应时间、错误率、系统负载）
- 快速操作入口（创建用户、查看日志、运行测试）

**关键数据**：
- 总用户数
- 今日新增用户
- VIP 用户数
- PREMIUM 用户数
- 总订单数
- 待审核订单
- 系统运行时间
- 数据库连接状态

---

### 2. 用户管理 (`/admin/users`)

**位置**：
- 本地：http://localhost:5000/admin/users
- 生产：https://tomato-ai-writer.vercel.app/admin/users

**功能**：
- 用户列表（分页显示）
- 搜索用户（按邮箱、用户名）
- 查看用户详情
- 编辑用户信息
- 升级/降级会员等级
- 禁用/启用用户账户
- 重置用户密码

**操作按钮**：
- 🔍 搜索
- ➕ 添加用户
- ✏️ 编辑
- ⬆️ 升级会员
- ⬇️ 降级会员
- 🚫 禁用账户
- ✅ 启用账户
- 🔑 重置密码

---

### 3. 订单管理 (`/admin/orders`)

**位置**：
- 本地：http://localhost:5000/admin/orders
- 生产：https://tomato-ai-writer.vercel.app/admin/orders

**功能**：
- 订单列表（分页显示）
- 查看订单详情
- 审核支付凭证
- 批准/拒绝订单
- 查看支付截图
- 导出订单数据

**订单状态**：
- `PENDING`: 待审核
- `PAID`: 已支付
- `CANCELLED`: 已取消
- `REFUNDED`: 已退款

**操作按钮**：
- 👁️ 查看详情
- ✅ 批准订单
- ❌ 拒绝订单
- 📥 导出数据

---

### 4. 测试报告 (`/admin/testing`)

**位置**：
- 本地：http://localhost:5000/admin/testing
- 生产：https://tomato-ai-writer.vercel.app/admin/testing

**功能**：
- 测试列表（历史测试记录）
- 运行自动化测试
- 查看测试结果
- 查看测试覆盖率
- 下载测试报告

**测试类型**：
- 功能测试（API 测试）
- 性能测试（响应时间）
- 负载测试（并发请求）
- 安全测试（SQL 注入、XSS）

**操作按钮**：
- ▶️ 运行测试
- 📊 查看报告
- 📥 下载报告
- 🗑️ 删除记录

---

### 5. 测试详情 (`/admin/testing/[testId]`)

**位置**：
- 本地：http://localhost:5000/admin/testing/{testId}
- 生产：https://tomato-ai-writer.vercel.app/admin/testing/{testId}

**功能**：
- 查看测试详细信息
- 查看测试用例
- 查看测试结果（通过/失败）
- 查看错误堆栈
- 查看性能指标

---

### 6. 审计日志 (`/admin/audit`)

**位置**：
- 本地：http://localhost:5000/admin/audit
- 生产：https://tomato-ai-writer.vercel.app/admin/audit

**功能**：
- 系统操作日志
- 安全事件记录
- 用户行为追踪
- 异常登录检测

**日志类型**：
- `LOGIN`: 用户登录
- `LOGOUT`: 用户登出
- `REGISTER`: 用户注册
- `USER_UPDATE`: 用户信息更新
- `ORDER_CREATE`: 订单创建
- `ORDER_APPROVE`: 订单批准
- `PAYMENT`: 支付操作
- `PASSWORD_RESET`: 密码重置
- `SECURITY`: 安全事件

**筛选选项**：
- 按时间范围
- 按用户
- 按操作类型
- 按状态

---

### 7. 功能测试 (`/admin/new-features-test`)

**位置**：
- 本地：http://localhost:5000/admin/new-features-test
- 生产：https://tomato-ai-writer.vercel.app/admin/new-features-test

**功能**：
- 测试新开发的功能
- 查看功能文档
- 提交测试反馈
- 查看实验数据

**适用场景**：
- 新功能上线前的测试
- A/B 测试结果查看
- 功能实验数据收集

---

## 常见问题

### Q1: 访问 `/admin/login` 显示 404 错误

**原因**：页面不存在或路由配置错误

**解决方案**：

1. 检查文件是否存在：
   ```bash
   # 检查管理员登录页面
   dir src\app\admin\login\page.tsx
   ```

2. 检查路由配置：
   - 确认 `src/app/admin/login/page.tsx` 文件存在
   - 确认 `src/app/admin/login/page.tsx` 内容正确

3. 清除 Next.js 缓存：
   ```bash
   # 删除 .next 目录
   rmdir /s /q .next

   # 重新构建
   npm run build
   ```

---

### Q2: 管理员登录后自动跳转到普通用户页面

**原因**：用户角色不是管理员

**解决方案**：

1. 检查用户角色：
   ```sql
   -- 连接数据库
   psql $DATABASE_URL

   -- 查询用户信息
   SELECT id, email, role, is_super_admin FROM users WHERE email = 'admin@example.com';
   ```

2. 如果不是管理员，更新角色：
   ```sql
   UPDATE users
   SET role = 'DEVELOPER',
       is_super_admin = true
   WHERE email = 'admin@example.com';
   ```

3. 重新登录

---

### Q3: 提示 "管理员 Token 无效"

**原因**：Token 过期或未正确存储

**解决方案**：

1. 清除浏览器存储：
   - 打开浏览器开发者工具（F12）
   - Application → Local Storage
   - 删除 `admin_token` 和 `admin_info`

2. 重新登录

3. 检查 JWT_SECRET 配置：
   ```bash
   # 查看环境变量
   Get-Content .env.local | Select-String "JWT_SECRET"
   ```

---

### Q4: 无法创建超级管理员

**原因**：
1. 数据库未连接
2. 表不存在
3. 管理员已存在

**解决方案**：

1. 检查数据库连接：
   ```bash
   # 测试连接
   psql $DATABASE_URL
   ```

2. 初始化数据库表：
   ```bash
   npx drizzle-kit push
   ```

3. 检查是否已存在管理员：
   ```sql
   SELECT * FROM users WHERE role = 'DEVELOPER';
   ```

4. 如果已存在，直接使用现有管理员登录

---

### Q5: 管理员后台功能无法访问

**原因**：权限不足或 API 错误

**解决方案**：

1. 检查浏览器控制台（F12 → Console）：
   - 查看 JavaScript 错误
   - 查看网络请求（F12 → Network）

2. 检查管理员权限：
   ```sql
   SELECT id, email, role, is_super_admin FROM users WHERE email = 'your-email';
   ```

3. 确认 Token 有效：
   ```javascript
   // 在浏览器控制台中
   console.log(localStorage.getItem('admin_token'));
   ```

4. 重新登录

---

## 快速操作指南

### 创建管理员 → 登录 → 查看仪表盘

```bash
# 1. 启动开发服务器
npm run dev

# 2. 创建超级管理员（浏览器中访问）
http://localhost:5000/api/init-admin?email=admin@example.com&password=Admin@123456

# 3. 登录管理员后台
http://localhost:5000/admin/login
# 输入邮箱：admin@example.com
# 输入密码：Admin@123456

# 4. 查看仪表盘
# 登录后自动跳转到
http://localhost:5000/admin/dashboard
```

---

## 安全建议

1. **修改默认密码**
   - 创建管理员后立即修改密码
   - 使用强密码（至少 12 位，包含大小写字母、数字、特殊字符）

2. **限制管理员数量**
   - 只创建必要的管理员账户
   - 定期审计管理员权限

3. **启用日志记录**
   - 定期查看审计日志
   - 监控异常登录行为

4. **禁用初始化 API**
   - 生产环境删除或禁用 `/api/init-admin`
   - 防止未授权创建管理员

5. **定期备份数据库**
   - 定期备份用户数据
   - 备份前测试备份恢复流程

---

## 相关文档

- [本地部署指南（Windows）](./LOCAL_DEPLOYMENT_GUIDE_WINDOWS.md)
- [Vercel 部署指南](./vercel-deployment-guide.md)
- [环境变量清单](./vercel-env-checklist.md)
- [配置指南](./CONFIGURATION_GUIDE.md)

---

**最后更新**: 2025-01-13
**版本**: 1.0.0
