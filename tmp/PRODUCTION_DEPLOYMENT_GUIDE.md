# 番茄AI写作助手 - 生产环境部署指南

## 快速部署（5分钟）

### 前置条件
- GitHub账号（代码已推送）
- Vercel账号（免费）
- Supabase账号（免费）
- 豆包大模型API Key

---

## 第一步：配置Supabase数据库

### 1.1 创建Supabase项目
1. 访问 https://supabase.com/
2. 点击 "Start your project"
3. 使用GitHub账号登录
4. 创建新项目：
   - Project Name: `tomato-ai-writer`
   - Database Password: 设置强密码（保存好）
   - Region: 选择最近的区域（如：Southeast Asia）
   - Pricing: Free Plan

### 1.2 获取数据库连接信息
1. 进入项目Settings → Database
2. 复制以下信息：
   - **Connection String** (URI格式)
   - 示例：`postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres`

### 1.3 创建数据库表
执行以下SQL（在Supabase SQL Editor中）：

```sql
-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  member_level VARCHAR(20) DEFAULT 'free',
  member_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 小说表
CREATE TABLE IF NOT EXISTS novels (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  genre VARCHAR(50),
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  total_chapters INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  cover_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 章节表
CREATE TABLE IF NOT EXISTS chapters (
  id SERIAL PRIMARY KEY,
  novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title VARCHAR(200),
  content TEXT,
  word_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 内容统计表
CREATE TABLE IF NOT EXISTS content_stats (
  id SERIAL PRIMARY KEY,
  novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
  total_chapters INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  avg_chapter_words INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 素材表
CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  category VARCHAR(50),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  order_no VARCHAR(50) UNIQUE NOT NULL,
  plan VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP
);

-- 审核日志表
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  content_type VARCHAR(50),
  content_id INTEGER,
  action VARCHAR(50),
  result VARCHAR(20),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_novels_user_id ON novels(user_id);
CREATE INDEX IF NOT EXISTS idx_chapters_novel_id ON chapters(novel_id);
CREATE INDEX IF NOT EXISTS idx_materials_user_id ON materials(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
```

---

## 第二步：获取豆包API Key

### 2.1 注册豆包开发者账号
1. 访问 https://www.volcengine.com/products/ark
2. 注册/登录火山引擎账号
3. 开通"方舟大模型"服务

### 2.2 创建API Key
1. 进入"API Key管理"
2. 点击"创建API Key"
3. 复制并保存API Key（格式：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`）

---

## 第三步：部署到Vercel

### 3.1 连接GitHub仓库
1. 访问 https://vercel.com/
2. 点击 "Add New Project"
3. 选择 "Import Git Repository"
4. 选择你的GitHub仓库：`tomato-writer-2024/tomato-ai-writer`
5. 点击 "Import"

### 3.2 配置项目设置

#### Framework Preset
```
Framework Preset: Next.js
```

#### Environment Variables
添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | Supabase连接字符串 | 必填 |
| `JWT_SECRET` | 生成一个随机字符串 | 必填 |
| `JWT_REFRESH_SECRET` | 生成一个随机字符串 | 必填 |
| `DOUBAO_API_KEY` | 豆包API Key | 必填 |
| `NEXT_PUBLIC_BASE_URL` | `https://你的域名.vercel.app` | 必填 |

#### 生成JWT密钥的方法
```bash
# 生成JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 生成JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3.3 配置构建命令

#### Build & Development Settings
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**重要**：
- ❌ 不要使用 `pnpm install`（Vercel兼容性问题）
- ✅ 必须使用 `npm install`

### 3.4 开始部署
1. 点击 "Deploy"
2. 等待构建完成（约2-3分钟）
3. 构建成功后，会得到一个URL，如：`https://tomato-ai-writer.vercel.app`

---

## 第四步：验证部署

### 4.1 检查首页
访问你的Vercel URL：
```
https://tomato-ai-writer.vercel.app
```

**预期结果**：
- 页面正常显示
- 番茄AI写作助手品牌展示
- 导航栏功能正常

### 4.2 测试注册功能
1. 点击 "免费注册"
2. 填写注册信息：
   - 用户名：`testuser`
   - 邮箱：`test@example.com`
   - 密码：`Test123456`
3. 点击 "注册"

**预期结果**：
- 注册成功
- 自动登录
- 跳转到工作空间

### 4.3 测试AI生成功能
1. 进入 "角色生成器"
2. 填写表单：
   - 角色名称：`凌风`
   - 角色类型：主角
   - 题材：玄幻
3. 点击 "生成角色"

**预期结果**：
- AI生成完整角色信息
- 包含：姓名、性格、背景、动机、能力、关系等
- 响应时间 < 3秒

### 4.4 检查其他功能
访问以下页面，确保都能正常显示：
- `/workspace` - 工作空间
- `/characters` - 角色生成器
- `/outline-generator` - 大纲生成器
- `/plot-twist` - 情节反转
- `/materials` - 素材管理
- `/settings` - 设置
- `/pricing` - 会员套餐

---

## 第五步：配置自定义域名（可选）

### 5.1 添加域名
1. 在Vercel项目页面，点击 "Settings" → "Domains"
2. 添加你的域名，如：`tomato-ai-writer.com`

### 5.2 配置DNS记录
在域名DNS管理中添加以下记录：

| 类型 | 名称 | 值 |
|------|------|-----|
| CNAME | www | cname.vercel-dns.com |
| A | @ | 76.76.21.21 |

### 5.3 等待DNS生效
- 通常需要10分钟到24小时
- Vercel会自动配置SSL证书

---

## 第六步：配置邮件服务（可选）

### 6.1 配置SMTP服务
在Vercel环境变量中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `SMTP_HOST` | SMTP服务器地址 | 如：`smtp.163.com` |
| `SMTP_PORT` | SMTP端口 | 如：`465` |
| `SMTP_USER` | SMTP用户名 | 邮箱地址 |
| `SMTP_PASSWORD` | SMTP密码 | 授权码 |
| `SMTP_FROM` | 发件人邮箱 | 如：`noreply@tomato-ai-writer.com` |

### 6.2 163邮箱配置示例
1. 登录163邮箱
2. 设置 → POP3/SMTP/IMAP
3. 开启SMTP服务
4. 获取授权码（不是登录密码）
5. 配置Vercel环境变量：
   - `SMTP_HOST`: `smtp.163.com`
   - `SMTP_PORT`: `465`
   - `SMTP_USER`: `yourname@163.com`
   - `SMTP_PASSWORD`: `授权码`
   - `SMTP_FROM`: `yourname@163.com`

---

## 第七步：配置微信登录（可选）

### 7.1 创建微信开放平台应用
1. 访问 https://open.weixin.qq.com/
2. 创建网站应用
3. 获取AppID和AppSecret

### 7.2 配置环境变量
在Vercel环境变量中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `WECHAT_APP_ID` | 微信AppID | 必填 |
| `WECHAT_APP_SECRET` | 微信AppSecret | 必填 |
| `WECHAT_REDIRECT_URI` | 回调URL | `https://你的域名/api/auth/wechat/callback` |

### 7.3 配置回调地址
在微信开放平台配置授权回调域名：
- 域名：`你的域名`
- 回调URI：`/api/auth/wechat/callback`

---

## 常见问题排查

### 问题1：部署失败
**症状**：Vercel构建失败，显示`ERR_PNPM_META_FETCH_FAIL`

**解决方案**：
1. 检查是否使用了pnpm
2. 确保Build Command是：`npm run build`
3. 确保Install Command是：`npm install`

### 问题2：页面无法访问
**症状**：访问页面显示"访问遇到小插曲"

**解决方案**：
1. 检查环境变量是否正确配置
2. 查看Vercel Logs：点击项目 → "Logs"
3. 检查数据库连接是否正常

### 问题3：API返回500错误
**症状**：调用API时返回500错误

**解决方案**：
1. 检查`DATABASE_URL`是否正确
2. 检查数据库表是否创建
3. 查看Vercel Function Logs

### 问题4：AI生成失败
**症状**：AI生成功能无响应

**解决方案**：
1. 检查`DOUBAO_API_KEY`是否正确
2. 检查API Key是否有效
3. 检查豆包账户余额是否充足

### 问题5：数据库连接失败
**症状**：提示"数据库连接失败"

**解决方案**：
1. 检查`DATABASE_URL`格式是否正确
2. 检查Supabase项目是否暂停
3. 检查密码是否正确

---

## 监控和维护

### 查看实时日志
1. 进入Vercel项目页面
2. 点击 "Logs"
3. 选择实时日志流

### 查看部署历史
1. 进入Vercel项目页面
2. 点击 "Deployments"
3. 查看所有部署记录

### 回滚到之前的版本
1. 进入Vercel项目页面
2. 点击 "Deployments"
3. 找到之前的部署记录
4. 点击 "···" → "Promote to Production"

### 数据库备份
Supabase会自动备份，但建议：
1. 定期导出数据库
2. 设置备份策略（免费版：每天备份，保留7天）

---

## 成本估算

### 当前配置成本（全部免费）

| 服务 | 套餐 | 月成本 |
|------|------|--------|
| Vercel | Hobby | $0 |
| Supabase | Free | $0 |
| 豆包API | 按量付费 | ~¥100（预估） |
| 域名（可选） | - | ~¥10/月 |
| **总计** | - | **~¥100/月** |

**豆包API成本估算**（假设1000个用户/月）：
- 每次生成：约1000 tokens
- 每用户每天生成5次
- 月token消耗：1000 × 5 × 30 × 1000 = 1.5亿tokens
- 成本：约¥100-200/月

---

## 下一步优化建议

### 短期（1-2周）
1. ✅ 完成基础部署
2. ✅ 配置邮件服务
3. ✅ 配置微信登录
4. ⏳ 添加单元测试
5. ⏳ 优化移动端体验

### 中期（1-2月）
1. ⏳ 添加用户反馈收集
2. ⏳ 优化AI生成速度
3. ⏳ 增加更多题材模板
4. ⏳ 添加数据分析报表

### 长期（3-6月）
1. ⏳ 多语言支持
2. ⏳ 移动App开发
3. ⏳ 社区功能
4. ⏳ 自定义模型训练

---

## 联系支持

如有问题，请查看：
- Vercel文档：https://vercel.com/docs
- Supabase文档：https://supabase.com/docs
- 豆包API文档：https://www.volcengine.com/docs

---

**祝部署顺利！🎉**
