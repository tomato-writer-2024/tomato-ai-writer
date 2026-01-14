# Netlify 生产环境数据库连接诊断指南

## 问题描述

生产环境健康检查显示：
- ✅ 环境变量配置正常
- ❌ 数据库连接失败
- ⚠️ 连接时间仅3ms（快速失败）

## 可能原因分析

### 1. 环境变量配置问题

#### 问题1.1: Netlify环境变量未正确设置
- **症状**：DATABASE_URL显示为true但实际值不正确
- **诊断步骤**：
  ```bash
  # 通过Netlify CLI检查环境变量
  netlify env:list --context=production
  ```

- **解决方案**：
  1. 登录Netlify Dashboard
  2. 进入Site settings → Environment variables
  3. 确认DATABASE_URL已正确设置
  4. 格式：`postgresql://postgres:PASSWORD@db.wxbhkjxfcwcjaguoapxy.supabase.co:5432/postgres?sslmode=require`

#### 问题1.2: 环境变量作用域错误
- **症状**：开发环境可用，生产环境不可用
- **解决方案**：
  - 确保环境变量设置为 **All contexts** 或 **Production context**
  - 不要只设置为 **Development context**

### 2. 数据库连接配置问题

#### 问题2.1: SSL配置不正确
- **症状**：连接时出现SSL相关错误
- **当前代码配置**：
  ```typescript
  ssl: {
    rejectUnauthorized: false,  // Supabase需要这个配置
  }
  ```

- **解决方案1**：确保连接字符串包含SSL参数
  ```
  DATABASE_URL=postgresql://postgres:PASSWORD@db.wxbhkjxfcwcjaguoapxy.supabase.co:5432/postgres?sslmode=require
  ```

- **解决方案2**：如果上述方法无效，尝试显式SSL配置
  ```typescript
  ssl: {
    rejectUnauthorized: false,
    cert: fs.readFileSync(path.join(__dirname, 'supabase-ca.crt')),
  }
  ```

#### 问题2.2: 连接字符串格式问题
- **症状**：解析DATABASE_URL时出错
- **正确格式**：
  ```
  postgresql://user:password@host:port/database?sslmode=require
  ```

- **常见错误**：
  - 缺少密码
  - 特殊字符未转义（如@、:等）
  - 端口号错误

### 3. 网络连接问题

#### 问题3.1: Netlify IP白名单限制
- **症状**：连接超时或被拒绝
- **诊断步骤**：
  - 检查Supabase Dashboard → Database → Connection pooling
  - 确认没有设置IP白名单限制

- **解决方案**：
  1. Supabase Settings → Database → Connection pooling
  2. 移除IP白名单限制
  3. 或添加Netlify的IP范围（推荐使用0.0.0.0/0允许所有IP）

#### 问题3.2: Supabase连接池模式冲突
- **症状**：使用Connection Pooling模式时出现连接问题
- **说明**：Netlify Functions 10秒超时限制下，Connection Pooling可能增加延迟

- **解决方案**：
  1. 使用Direct Connection模式（端口5432）
  2. 连接字符串示例：
     ```
     postgresql://postgres:PASSWORD@db.wxbhkjxfcwcjaguoapxy.supabase.co:5432/postgres?sslmode=require
     ```

#### 问题3.3: 网络防火墙限制
- **症状**：无法连接到Supabase（ECONNREFUSED、ENETUNREACH）
- **解决方案**：
  - 检查Supabase Dashboard → Database → Settings
  - 确认数据库实例正常运行
  - 联系Supabase支持检查网络连通性

### 4. 认证问题

#### 问题4.1: 密码错误或过期
- **症状**：认证失败错误
- **解决方案**：
  1. 登录Supabase Dashboard
  2. Settings → Database → Reset database password
  3. 更新Netlify环境变量中的DATABASE_URL

#### 问题4.2: 用户权限不足
- **症状**：权限拒绝错误
- **解决方案**：
  ```sql
  -- 在Supabase SQL Editor中执行
  GRANT ALL PRIVILEGES ON DATABASE postgres TO postgres;
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
  ```

### 5. Netlify Function限制

#### 问题5.1: 10秒超时限制
- **症状**：连接超时
- **当前配置**：
  ```typescript
  connectionTimeoutMillis: 5000,  // 5秒超时
  ```

- **解决方案**：
  - 已经优化为5秒超时，足够在10秒限制内完成连接
  - 如果仍然超时，考虑升级Netlify套餐或使用Edge Functions

#### 问题5.2: 函数冷启动延迟
- **症状**：首次请求超时，后续请求正常
- **解决方案**：
  - 使用Netlify Functions热启动（保持函数活跃）
  - 或接受首次慢启动（用户通常能容忍1-2秒延迟）

## 诊断步骤

### 步骤1：验证环境变量
```bash
# 使用Netlify CLI
netlify env:list --context=production

# 检查输出中是否包含DATABASE_URL
# 验证格式是否正确
```

### 步骤2：查看详细错误日志
更新代码后，健康检查会返回详细的错误信息：
```json
{
  "checks": {
    "database": {
      "details": {
        "mode": "auto-mock",
        "lastError": "详细的错误信息"
      }
    }
  }
}
```

### 步骤3：测试数据库连接（本地）
```bash
# 在本地测试连接字符串
psql "postgresql://postgres:PASSWORD@db.wxbhkjxfcwcjaguoapxy.supabase.co:5432/postgres?sslmode=require"
```

### 步骤4：检查Supabase设置
1. 登录Supabase Dashboard
2. 检查Database → Connection pooling设置
3. 检查Database → Settings → Database URL
4. 检查Database → Settings → Access control

### 步骤5：查看Netlify Function日志
1. Netlify Dashboard → Functions
2. 查看api/health的日志
3. 查找数据库连接相关错误

## 快速修复方案

### 方案A：启用Mock模式（临时方案）

如果数据库连接问题短期内无法解决，可以临时启用Mock模式：

**步骤**：
1. 在Netlify Dashboard中添加环境变量：
   ```
   DATABASE_MOCK_MODE=true
   ```
2. 等待Netlify自动部署（2-3分钟）
3. 重新测试健康检查API

**优点**：
- 立即可用
- 不影响其他功能

**缺点**：
- 数据不会持久化（仅存储在内存中）
- 部署重启后数据丢失

### 方案B：验证并修正环境变量（推荐）

**步骤**：
1. 登录Supabase Dashboard，获取正确的连接字符串
2. 登录Netlify Dashboard，更新DATABASE_URL环境变量
3. 确保设置为All contexts
4. 等待自动部署
5. 测试健康检查API

**验证命令**：
```bash
curl https://tomatowriter.netlify.app/api/health
```

期望输出（成功）：
```json
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "ok",
      "mode": "real",
      "message": "数据库连接正常"
    }
  }
}
```

### 方案C：使用Connection Pooling模式（备选）

如果Direct Connection模式不工作，尝试Connection Pooling：

**步骤**：
1. 在Supabase Dashboard → Database → Connection pooling
2. 启用Connection pooling
3. 使用Pooling connection string：
   ```
   postgresql://postgres.PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```
4. 更新Netlify环境变量
5. 等待自动部署并测试

**注意**：
- Pooling模式可能增加延迟
- 不适合高频短连接场景
- 适合长连接或持续查询场景

## 联系支持

如果以上方案均无效：

1. **Supabase支持**：
   - https://supabase.com/support
   - 提供错误日志和连接信息

2. **Netlify支持**：
   - https://answers.netlify.com/
   - 查看Functions日志和部署日志

## 下一步行动

1. ✅ 已修复健康检查逻辑（自动降级模式下系统仍可用）
2. ✅ 已增强错误日志输出
3. 🔄 请用户在Netlify Dashboard中验证环境变量配置
4. 🔄 根据错误日志选择对应的修复方案
5. 🔄 验证修复后的系统可用性
