# Vercel部署检查清单

## 环境变量配置

### 必需的环境变量
在Vercel项目设置中，需要配置以下环境变量：

1. **数据库配置**
   - `DATABASE_URL` - PostgreSQL连接字符串（必需）
     - 示例：`postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`

2. **JWT密钥配置**
   - `JWT_SECRET` - JWT访问Token密钥（必需，至少32位）
   - `JWT_REFRESH_SECRET` - JWT刷新Token密钥（必需，至少32位）

3. **应用基础配置**
   - `NEXT_PUBLIC_APP_NAME` - 应用名称
   - `NEXT_PUBLIC_BASE_URL` - 生产环境域名（必需）
     - 示例：`https://tomato-ai-writer.vercel.app`

4. **豆包大模型配置**
   - `DOUBAO_API_KEY` - 豆包API密钥（可选，但建议配置以启用AI功能）
   - `DOUBAO_MODEL` - 豆包模型名称（可选）

### 可选的环境变量

5. **邮件服务配置**
   - `EMAIL_HOST` - SMTP服务器地址
   - `EMAIL_PORT` - SMTP端口
   - `EMAIL_SECURE` - 是否使用SSL
   - `EMAIL_USER` - 邮箱账号
   - `EMAIL_PASS` - 邮箱密码或授权码
   - `EMAIL_FROM` - 发件人地址
   - `EMAIL_MOCK_MODE` - Mock模式开关（true/false）

6. **微信登录配置**
   - `WECHAT_APPID` - 微信开放平台AppID
   - `WECHAT_SECRET` - 微信开放平台AppSecret
   - `WECHAT_MOCK_MODE` - Mock模式开关（true/false）
   - `WECHAT_REDIRECT_URI` - 微信授权回调地址

7. **对象存储配置**
   - `S3_ENDPOINT` - S3端点
   - `S3_ACCESS_KEY` - S3访问密钥
   - `S3_SECRET_KEY` - S3密钥
   - `S3_BUCKET` - 存储桶名称
   - `S3_REGION` - 存储区域

## 部署前检查

1. ✅ 确认所有必需的环境变量已配置
2. ✅ 确认DATABASE_URL可以成功连接到Supabase数据库
3. ✅ 确认JWT_SECRET已设置且足够安全
4. ✅ 确认NEXT_PUBLIC_BASE_URL设置为生产环境域名
5. ✅ 检查vercel.json配置是否正确
6. ✅ 检查next.config.ts配置是否正确

## 部署后验证

1. ✅ 检查首页是否可以正常访问
2. ✅ 测试用户注册功能
3. ✅ 测试用户登录功能
4. ✅ 测试小说创建功能
5. ✅ 测试章节创建功能
6. ✅ 检查API响应是否正常
7. ✅ 查看Vercel日志，确认没有错误

## 常见问题

### 1. 数据库连接失败
- 检查DATABASE_URL格式是否正确
- 检查Supabase数据库是否正常运行
- 检查密码是否正确

### 2. 页面显示"访问遇到小插曲"
- 检查NEXT_PUBLIC_BASE_URL是否正确配置
- 检查是否有运行时错误（查看Vercel日志）
- 确认所有API路由都正常工作

### 3. 用户登录失败
- 检查JWT_SECRET是否配置
- 检查数据库中是否有用户数据
- 查看Vercel日志中的详细错误信息

### 4. API请求失败
- 检查环境变量是否正确配置
- 检查数据库连接是否正常
- 查看Vercel日志中的错误信息
