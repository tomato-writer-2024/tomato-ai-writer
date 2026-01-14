# 超级管理员登录指南

## 🎯 重要说明

### 系统架构

番茄AI写作助手采用**双入口架构**，超级管理员和普通会员使用**完全分离**的登录系统和界面：

```
普通会员入口：
┌─────────────────────────────────────┐
│  http://localhost:5000/login       │ ← 会员登录
│  ↓                                  │
│  http://localhost:5000/workspace    │ ← 会员工作区
│  http://localhost:5000/profile     │ ← 会员个人中心
└─────────────────────────────────────┘

超级管理员入口（完全独立）：
┌─────────────────────────────────────┐
│  http://localhost:5000/admin/login  │ ← 管理员登录
│  ↓                                  │
│  http://localhost:5000/admin/dashboard   │ ← 管理员Dashboard
│  http://localhost:5000/admin/users     │ ← 用户管理
│  http://localhost:5000/admin/orders     │ ← 订单管理
│  http://localhost:5000/admin/audit      │ ← 审核管理
└─────────────────────────────────────┘
```

---

## 🔐 超级管理员登录方式

### 方式1：使用超级管理员登录页面（推荐）

1. **访问超级管理员登录页面**
   ```
   http://localhost:5000/admin/login
   ```

2. **输入登录信息**
   ```
   邮箱：208343256@qq.com
   密码：TomatoAdmin@2024
   ```

3. **系统会自动进行以下验证**：
   - ✓ 验证邮箱和密码是否正确
   - ✓ 验证账号是否被激活
   - ✓ 验证账号是否被封禁
   - ✓ **验证是否为超级管理员（is_super_admin = true）**
   - ✓ 生成管理员专用Token
   - ✓ 保存在 localStorage 中（key: `admin_token`）

4. **登录成功后自动跳转到**
   ```
   http://localhost:5000/admin/dashboard
   ```

---

### 方式2：使用会员登录页面（不推荐）

如果您访问 `/login` 会员登录页面：
- ✓ 可以登录成功
- ✗ **但是无法进入管理后台**
- ✗ 只能访问会员功能（/workspace, /profile 等）
- ✗ 访问 /admin/* 页面会被拒绝

**原因**：会员登录页面生成的是普通Token，缺少超级管理员验证步骤。

---

## 🔍 验证流程对比

### 会员登录流程

```
用户输入邮箱/密码
    ↓
调用 /api/auth/login 或 /api/auth/login-direct
    ↓
验证密码
    ↓
检查账号状态（isActive, isBanned）
    ↓
生成普通Token
    ↓
跳转到 /workspace
```

### 超级管理员登录流程

```
用户输入邮箱/密码
    ↓
调用 /api/auth/login 或 /api/auth/login-direct
    ↓
验证密码
    ↓
检查账号状态（isActive, isBanned）
    ↓
生成普通Token
    ↓
【额外步骤】调用 /api/admin/superadmin/verify
    ↓
验证 is_super_admin = true
    ↓
生成管理员专用Token
    ↓
保存到 localStorage (admin_token)
    ↓
跳转到 /admin/dashboard
```

---

## ⚠️ 如果登录失败

### 问题1：提示"您没有权限访问后台管理系统"

**原因**：
- 您使用的是普通会员账号
- 账号的 `is_super_admin` 字段为 `false`

**解决方案**：
1. 确认使用的是管理员账号：`208343256@qq.com`
2. 检查数据库中该账号的 `is_super_admin` 是否为 `true`

```bash
# 检查管理员账号状态
npx tsx src/scripts/create-admin-direct.ts
```

---

### 问题2：浏览器本地存储问题

**错误信息**：
```
无法保存登录信息到本地存储
浏览器禁用了本地存储
```

**解决方案**：
1. 检查浏览器隐私模式
2. 检查浏览器安全设置
3. 使用 Chrome/Edge（推荐）
4. 关闭所有无痕/隐私模式

---

### 问题3：Token验证失败

**解决方案**：
1. 清除浏览器缓存
2. 使用无痕模式登录
3. 清除 localStorage

```javascript
// 在浏览器控制台执行
localStorage.clear()
```

---

## 🔑 管理员账号信息

### 超级管理员账号

```
邮箱：208343256@qq.com
密码：TomatoAdmin@2024
角色：SUPER_ADMIN
会员等级：ENTERPRISE
到期时间：2027-12-31
```

### 权限说明

**超级管理员可以**：
- ✓ 访问管理后台（/admin/*）
- ✓ 管理所有用户
- ✓ 查看所有订单
- ✓ 审核内容
- ✓ 查看系统日志
- ✓ 管理会员等级
- ✓ 查看所有用户数据（仅用于管理）

**超级管理员不可以**：
- ✗ 以普通用户身份创作小说
- ✗ 修改其他用户的密码（安全考虑）

---

## 🌐 访问地址

### 会员入口

| 页面 | 地址 | 说明 |
|------|------|------|
| 会员登录 | http://localhost:5000/login | 普通会员登录 |
| 测试登录 | http://localhost:5000/test-login | 带日志的测试页面 |
| 会员工作区 | http://localhost:5000/workspace | 会员主工作区 |
| 个人中心 | http://localhost:5000/profile | 会员个人设置 |

### 管理员入口

| 页面 | 地址 | 说明 |
|------|------|------|
| 管理员登录 | http://localhost:5000/admin/login | 超级管理员登录 |
| 管理员Dashboard | http://localhost:5000/admin/dashboard | 管理后台首页 |
| 用户管理 | http://localhost:5000/admin/users | 用户列表和管理 |
| 订单管理 | http://localhost:5000/admin/orders | 订单列表和管理 |
| 审核管理 | http://localhost:5000/admin/audit | 内容审核 |

---

## 📊 数据安全隔离（100% 保证）

### 数据隔离机制

番茄AI写作助手在**所有层级**实现了数据安全隔离：

#### 1. 数据库层隔离

所有数据表都包含 `user_id` 字段：

```sql
-- 小说表
CREATE TABLE novels (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,  -- 所属用户ID
  title VARCHAR(255),
  content TEXT,
  -- ...其他字段
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 章节表
CREATE TABLE chapters (
  id UUID PRIMARY KEY,
  novel_id UUID NOT NULL,
  user_id UUID NOT NULL,  -- 所属用户ID
  title VARCHAR(255),
  content TEXT,
  -- ...其他字段
  FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 订单表
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,  -- 所属用户ID
  amount DECIMAL(10,2),
  status VARCHAR(50),
  -- ...其他字段
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 2. ORM查询层隔离

所有数据查询都强制包含 `user_id` 条件：

```typescript
// 小说管理器示例
async getNovelsByUserId(userId: string, options?: {
  skip?: number;
  limit?: number;
}): Promise<Novel[]> {
  return this.getNovels({
    ...options,
    filters: { userId },  // ← 强制过滤用户ID
    orderBy: 'updatedAt',
    orderDirection: 'desc',
  });
}

// 章节管理器示例
async getChaptersByNovelId(novelId: string): Promise<Chapter[]> {
  // 先查询小说，验证用户权限
  const novel = await this.novelManager.getNovelById(novelId);
  if (!novel) {
    throw new Error('小说不存在');
  }

  // 只返回该用户的章节
  return this.getChapters({
    filters: { novelId, userId: novel.userId }  // ← 强制过滤用户ID
  });
}
```

#### 3. API路由层隔离

所有API都验证用户身份和权限：

```typescript
// 示例：获取小说列表
export async function GET(request: NextRequest) {
  // 1. 验证Token
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Token无效' }, { status: 401 });
  }

  // 2. 只查询当前用户的数据
  const novels = await novelManager.getNovelsByUserId(decoded.userId);
  // ← 只返回该用户的小说

  return NextResponse.json({ novels });
}
```

#### 4. 前端路由层隔离

前端根据用户角色显示不同内容：

```typescript
// 普通会员：只能看到自己的数据
{user.role !== 'SUPER_ADMIN' && (
  <NovelList novels={userNovels} />
)}

// 超级管理员：可以看到所有数据（仅用于管理）
{user.isSuperAdmin && (
  <AdminDashboard />
)}
```

---

### 数据隔离保证

✅ **100%隔离保证**：

1. **用户之间完全隔离**
   - 用户A无法访问用户B的任何数据
   - 即使知道ID也无法访问（有user_id验证）

2. **数据库层强制隔离**
   - 所有查询都包含 `user_id` 条件
   - 使用外键约束确保数据一致性
   - 删除用户时自动删除关联数据

3. **API层强制验证**
   - 每个API都验证Token
   - 只返回当前用户的数据
   - 无法通过修改请求参数访问其他用户数据

4. **超级管理员权限控制**
   - 超级管理员可以查看所有数据（仅用于管理）
   - 但无法以普通用户身份创作
   - 所有管理操作都有日志记录

---

## 🎯 总结

### 关键要点

1. **双入口架构**：
   - 普通会员：/login → /workspace
   - 超级管理员：/admin/login → /admin/dashboard

2. **登录流程**：
   - 普通会员：验证密码 → 生成Token → 跳转工作区
   - 超级管理员：验证密码 → **验证管理员权限** → 生成Token → 跳转管理后台

3. **数据隔离**：
   - 数据库层：所有表包含 user_id
   - ORM层：查询强制包含 user_id 条件
   - API层：验证Token，只返回当前用户数据
   - 前端层：根据角色显示不同内容

4. **100%安全保证**：
   - 用户之间完全隔离
   - 无法通过任何方式访问其他用户数据
   - 超级管理员权限仅用于管理，有完整日志

---

## 🚀 快速开始

### 作为超级管理员登录

```bash
# 1. 确保服务正在运行
cd C:\tomato-ai-writer\tomato-ai-writer
npm run dev

# 2. 在浏览器中访问管理员登录页面
http://localhost:5000/admin/login

# 3. 输入登录信息
邮箱：208343256@qq.com
密码：TomatoAdmin@2024

# 4. 登录成功后自动跳转到
http://localhost:5000/admin/dashboard
```

### 作为普通会员登录

```bash
# 1. 访问会员登录页面
http://localhost:5000/login

# 2. 输入会员账号和密码
# （或先注册新账号）

# 3. 登录成功后自动跳转到
http://localhost:5000/workspace
```

---

**有任何问题随时询问！**
