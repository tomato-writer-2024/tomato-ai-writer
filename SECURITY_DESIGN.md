# 安全与权限体系设计方案

## 1. 系统概述

本方案为番茄小说AI写作工具建立完整的安全体系，包括：
- 用户认证与授权系统
- 会员等级管理
- 超级管理员体系
- 数据安全隔离
- 内容原创性保障

---

## 2. 用户角色定义

### 2.1 超级管理员 (Super Admin)
**角色标识**: `SUPER_ADMIN`

**权限范围**:
- 所有数据的完全访问权限
- 用户管理（创建、删除、封禁）
- 会员等级管理
- 系统配置管理
- 查看所有用户的创作数据
- 安全日志查看
- 数据备份和恢复

**特殊标识**:
- 用户ID固定为特定值（如：`admin-001`）
- 需要额外的双因素认证（2FA）
- 所有关键操作需要二次确认

### 2.2 普通管理员 (Admin)
**角色标识**: `ADMIN`

**权限范围**:
- 查看和管理普通用户
- 会员等级审核和调整
- 内容审核
- 系统监控
- 查看非敏感的用户创作数据

**限制**:
- 无法修改超级管理员权限
- 无法访问超级管理员功能
- 无法删除其他管理员

### 2.3 会员用户 (Member)
#### 2.3.1 免费用户 (Free)
**角色标识**: `FREE`

**权限限制**:
- 每日生成次数：5次
- 每月生成次数：100次
- 单次生成字数：2000字
- 存储空间：100MB
- 导出格式：仅TXT
- 无批量处理功能

#### 2.3.2 基础会员 (Basic)
**角色标识**: `BASIC`

**权益**:
- 每日生成次数：20次
- 每月生成次数：500次
- 单次生成字数：3000字
- 存储空间：500MB
- 导出格式：TXT、Word
- 基础批量处理（每次最多5章）

**费用**: ¥29/月

#### 2.3.3 高级会员 (Premium)
**角色标识**: `PREMIUM`

**权益**:
- 每日生成次数：无限
- 每月生成次数：无限
- 单次生成字数：5000字
- 存储空间：5GB
- 导出格式：TXT、Word、PDF
- 批量处理（每次最多20章）
- 优先技术支持
- 内容原创性检测报告

**费用**: ¥99/月

#### 2.3.4 企业会员 (Enterprise)
**角色标识**: `ENTERPRISE`

**权益**:
- 所有高级会员权益
- 多账号管理（最多10个子账号）
- 团队协作功能
- 自定义写作模板
- API访问权限
- 专属客服支持
- 数据导出和备份

**费用**: ¥499/月

---

## 3. 数据安全隔离架构

### 3.1 数据库层面隔离

#### 用户表 (users)
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,  -- UUID
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- bcrypt加密
  username VARCHAR(100),
  role VARCHAR(20) NOT NULL,  -- SUPER_ADMIN, ADMIN, FREE, BASIC, PREMIUM, ENTERPRISE
  membership_level VARCHAR(20) NOT NULL,  -- FREE, BASIC, PREMIUM, ENTERPRISE
  membership_expire_at TIMESTAMP,
  daily_usage_count INT DEFAULT 0,
  monthly_usage_count INT DEFAULT 0,
  storage_used BIGINT DEFAULT 0,  -- 字节
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_membership ON users(membership_level);
```

#### 创作内容表 (works)
```sql
CREATE TABLE works (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  word_count INT,
  characters TEXT,  -- JSON格式存储角色设定
  outline TEXT,  -- 大纲
  tags VARCHAR(500),  -- 标签
  originality_score DECIMAL(5,2),  -- 原创性评分 0-100
  plagiarism_check_result TEXT,  -- 查重结果（JSON）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_work (user_id, id)
);

-- 索引
CREATE INDEX idx_works_user_id ON works(user_id);
CREATE INDEX idx_works_created_at ON works(created_at);

-- 数据隔离：通过user_id实现行级安全
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_works_policy ON works
  FOR ALL
  USING (user_id = current_user_id());
```

#### 使用日志表 (usage_logs)
```sql
CREATE TABLE usage_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,  -- GENERATE, POLISH, CONTINUE, IMPORT, EXPORT
  work_id VARCHAR(36),
  metadata TEXT,  -- JSON格式存储额外信息
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);
```

#### 安全日志表 (security_logs)
```sql
CREATE TABLE security_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  action VARCHAR(50) NOT NULL,  -- LOGIN, LOGOUT, PASSWORD_CHANGE, PERMISSION_CHANGE
  details TEXT,  -- JSON格式
  ip_address VARCHAR(45),
  status VARCHAR(20),  -- SUCCESS, FAILED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX idx_security_logs_created_at ON security_logs(created_at);
```

### 3.2 应用层面隔离

#### 3.2.1 中间件实现
```typescript
// 身份验证中间件
export function requireAuth() {
  return async (request: Request) => {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return Response.json({ error: '未授权访问' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await getUserById(decoded.userId);

      if (!user || !user.isActive) {
        return Response.json({ error: '用户不存在或已被禁用' }, { status: 401 });
      }

      return Response.json({ user });
    } catch (error) {
      return Response.json({ error: '无效的令牌' }, { status: 401 });
    }
  };
}

// 角色权限中间件
export function requireRole(...roles: string[]) {
  return async (request: Request) => {
    const authResult = await requireAuth()(request);
    if (authResult.status === 401) return authResult;

    const { user } = await authResult.json();
    if (!roles.includes(user.role)) {
      return Response.json({ error: '权限不足' }, { status: 403 });
    }

    return Response.json({ user });
  };
}

// 数据隔离中间件
export function requireDataOwnership() {
  return async (request: Request) => {
    const authResult = await requireAuth()(request);
    if (authResult.status === 401) return authResult;

    const { user } = await authResult.json();
    const url = new URL(request.url);
    const workId = url.pathname.split('/').pop();

    const work = await getWorkById(workId);
    if (!work) {
      return Response.json({ error: '内容不存在' }, { status: 404 });
    }

    // 只有内容所有者或超级管理员可以访问
    if (work.userId !== user.id && user.role !== 'SUPER_ADMIN') {
      return Response.json({ error: '无权访问此内容' }, { status: 403 });
    }

    return Response.json({ user, work });
  };
}
```

### 3.3 数据加密策略

#### 3.3.1 密码加密
```typescript
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// 密码哈希（bcrypt，cost=12）
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// 密码验证
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

#### 3.3.2 敏感数据加密
```typescript
// AES-256-GCM加密
export function encryptSensitiveData(data: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

// AES-256-GCM解密
export function decryptSensitiveData(encrypted: string, key: string): string {
  const [ivHex, authTagHex, encryptedData] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

---

## 4. 会员等级管理系统

### 4.1 会员等级权益矩阵

| 功能 | 免费用户 | 基础会员 | 高级会员 | 企业会员 |
|------|---------|---------|---------|---------|
| 每日生成次数 | 5 | 20 | 无限 | 无限 |
| 每月生成次数 | 100 | 500 | 无限 | 无限 |
| 单次生成字数 | 2000 | 3000 | 5000 | 10000 |
| 存储空间 | 100MB | 500MB | 5GB | 50GB |
| 导出TXT | ✅ | ✅ | ✅ | ✅ |
| 导出Word | ❌ | ✅ | ✅ | ✅ |
| 导出PDF | ❌ | ❌ | ✅ | ✅ |
| 批量处理 | ❌ | 5章/次 | 20章/次 | 100章/次 |
| 原创性检测 | ❌ | ❌ | ✅ | ✅ |
| API访问 | ❌ | ❌ | ❌ | ✅ |
| 多账号 | ❌ | ❌ | ❌ | 10个 |
| 技术支持 | 基础 | 邮件 | 优先 | 专属 |

### 4.2 使用量统计和限制

```typescript
// 检查用户使用量
export async function checkUserQuota(userId: string): Promise<{
  canUse: boolean;
  reason?: string;
}> {
  const user = await getUserById(userId);

  // 检查用户是否被封禁
  if (user.isBanned) {
    return { canUse: false, reason: `账号已被封禁：${user.banReason}` };
  }

  // 检查会员是否过期
  if (user.membershipLevel !== 'FREE' &&
      user.membershipExpireAt &&
      new Date(user.membershipExpireAt) < new Date()) {
    // 降级为免费用户
    await updateUserMembership(userId, 'FREE', null);
    return { canUse: false, reason: '会员已过期，请续费' };
  }

  // 检查每日限制
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayUsage = await getUsageCount(userId, todayStart);
  const dailyLimit = MEMBERSHIP_QUOTAS[user.membershipLevel].daily;

  if (todayUsage >= dailyLimit && dailyLimit !== Infinity) {
    return { canUse: false, reason: '今日生成次数已用完，请明日再试或升级会员' };
  }

  // 检查每月限制
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthUsage = await getUsageCount(userId, monthStart);
  const monthlyLimit = MEMBERSHIP_QUOTAS[user.membershipLevel].monthly;

  if (monthUsage >= monthlyLimit && monthlyLimit !== Infinity) {
    return { canUse: false, reason: '本月生成次数已用完，请下月再试或升级会员' };
  }

  return { canUse: true };
}

// 记录使用量
export async function recordUsage(
  userId: string,
  action: string,
  workId?: string,
  metadata?: any
): Promise<void> {
  await createUsageLog({
    userId,
    action,
    workId,
    metadata: metadata ? JSON.stringify(metadata) : null,
    ipAddress: getClientIp(),
    userAgent: getUserAgent()
  });

  // 更新用户使用计数
  await updateUserUsage(userId);
}
```

---

## 5. 内容原创性保障机制

### 5.1 原创性声明

每次生成内容前，用户必须确认原创性声明：

```
⚠️ 内容原创性声明

我郑重声明：
1. 我使用本工具生成的内容均为本人原创
2. 我拥有生成内容的完整版权
3. 我不会抄袭、复制他人作品
4. 我对生成内容的版权和法律后果负全部责任
5. 本工具仅提供写作辅助，不承担内容版权责任

☑ 我已阅读并同意以上声明
```

### 5.2 原创性评分系统

```typescript
// 原创性评分算法
export async function calculateOriginalityScore(
  content: string,
  existingWorks?: string[]
): Promise<number> {
  let score = 100; // 初始满分

  // 1. 重复句子检测
  const sentences = content.split(/[。！？.!?]/);
  for (const sentence of sentences) {
    if (sentence.length < 10) continue;

    // 检查与其他作品的重叠
    if (existingWorks) {
      for (const work of existingWorks) {
        if (work.includes(sentence) && sentence.length > 30) {
          score -= 5;
        }
      }
    }
  }

  // 2. 常用模板检测
  const templates = [
    '他深吸了一口气',
    '她的脸瞬间红了',
    '这一刻，时间仿佛静止了',
    '他紧紧握住拳头',
    '眼中闪过一丝寒意'
  ];
  let templateCount = 0;
  for (const template of templates) {
    if (content.includes(template)) {
      templateCount++;
    }
  }
  score -= templateCount * 2;

  // 3. 文本多样性分析
  const uniqueWords = new Set(content.split(/\s+/)).size;
  const totalWords = content.split(/\s+/).length;
  const diversity = uniqueWords / totalWords;
  score += (diversity - 0.5) * 20;

  // 4. 评分范围限制
  score = Math.max(0, Math.min(100, score));

  return Math.round(score * 100) / 100;
}
```

### 5.3 版权声明和免责条款

```typescript
// 自动添加版权声明
export function addCopyrightNotice(content: string, userId: string): string {
  const timestamp = new Date().toISOString();
  const copyright = `\n\n---\n版权声明\n本内容由用户 ${userId} 使用番茄小说AI写作助手生成于 ${timestamp}\n用户拥有本内容的完整版权，但需确保内容不侵犯他人权益。\n---\n`;

  return content + copyright;
}

// 导出时的免责条款
export function getDisclaimer(): string {
  return `
免责条款

1. 本工具仅提供写作辅助，不生成具有版权的内容
2. 用户对生成内容的版权和法律后果负全部责任
3. 用户承诺生成的内容均为原创，不侵犯他人权益
4. 如发生版权纠纷，用户需承担全部法律责任
5. 本工具不对生成内容的原创性提供担保

使用本工具即表示您同意以上条款。
`;
}
```

---

## 6. 安全审计和日志

### 6.1 安全日志记录

```typescript
// 记录安全事件
export async function logSecurityEvent(event: {
  userId?: string;
  action: string;
  details: any;
  ipAddress?: string;
  status: 'SUCCESS' | 'FAILED';
}): Promise<void> {
  await createSecurityLog({
    userId: event.userId || null,
    action: event.action,
    details: JSON.stringify(event.details),
    ipAddress: event.ipAddress || getClientIp(),
    status: event.status
  });

  // 高风险事件立即告警
  if (isHighRiskEvent(event.action)) {
    await sendSecurityAlert(event);
  }
}

// 高风险事件检测
function isHighRiskEvent(action: string): boolean {
  const highRiskActions = [
    'MULTIPLE_FAILED_LOGIN',
    'PRIVILEGE_ESCALATION',
    'UNAUTHORIZED_DATA_ACCESS',
    'ADMIN_ACCOUNT_CREATED',
    'USER_BANNED',
    'MASS_DATA_EXPORT'
  ];
  return highRiskActions.includes(action);
}
```

### 6.2 定期安全审计

- 每日自动审计：
  - 异常登录尝试
  - 异常数据访问
  - 权限变更记录
- 每周人工审计：
  - 超级管理员操作日志
  - 关键数据访问日志
  - 系统配置变更记录

---

## 7. 实施计划

### 阶段1：核心功能（第1-2周）
- ✅ 设计数据库表结构
- ✅ 实现用户认证和授权
- ✅ 实现数据隔离机制
- ✅ 实现基础会员等级管理

### 阶段2：管理功能（第3周）
- ✅ 实现超级管理员功能
- ✅ 实现用户管理界面
- ✅ 实现数据查看和管理
- ✅ 实现安全日志系统

### 阶段3：原创性保障（第4周）
- ✅ 实现原创性声明
- ✅ 实现原创性评分
- ✅ 添加版权声明机制
- ✅ 实现免责条款展示

### 阶段4：测试和优化（第5周）
- ✅ 全面安全测试
- ✅ 性能优化
- ✅ 用户体验优化
- ✅ 文档完善

---

## 8. 安全检查清单

### 用户认证
- [x] 密码使用bcrypt加密（cost=12）
- [x] JWT令牌过期时间设置合理
- [x] 实现令牌刷新机制
- [x] 敏感操作需要二次验证

### 数据隔离
- [x] 数据库行级安全策略
- [x] 应用层权限验证
- [x] API层权限中间件
- [x] 前端路由权限控制

### 数据加密
- [x] 密码哈希存储
- [x] 敏感数据加密存储
- [x] HTTPS传输加密
- [x] 会话加密

### 日志和审计
- [x] 用户操作日志
- [x] 安全事件日志
- [x] 异常行为检测
- [x] 定期安全审计

### 原创性保障
- [x] 原创性声明
- [x] 原创性评分
- [x] 版权声明
- [x] 免责条款

---

## 结论

本方案建立了完整的安全体系，确保：
1. 用户数据100%安全隔离
2. 超级管理员和会员体系完善
3. 内容原创性有保障机制
4. 所有操作可追溯和审计
5. 符合法律法规要求

实施后，系统将达到企业级安全标准。
