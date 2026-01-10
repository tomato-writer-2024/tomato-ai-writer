# 密码重置功能修复说明

## 问题描述

用户报告了两个问题：
1. **内网测试可以点击进去重置密码，但输入新密码后提示"无此用户"**
2. **真实邮箱在外网去重置密码的时候却不能访问网页了**

## 根本原因

### 问题1：内网测试"无此用户"提示
- **原因**：Token验证或用户查询逻辑可能存在问题
- **解决方案**：在 `reset-password` API 中添加详细日志，定位具体是哪一步失败

### 问题2：外网邮件链接无法访问
- **根本原因**：`forgot-password` API 使用 `request.url` 获取域名，但这个值是服务器内部地址（如 `http://localhost:5000`），而不是用户访问的外网域名（`https://p75463bk4t.coze.site`）
- **导致结果**：邮件中生成的重置链接是 `http://localhost:5000/reset-password?token=...`，外网用户无法访问
- **解决方案**：
  1. 前端在调用 API 时，使用 `window.location.origin` 获取实际访问的域名
  2. 将这个 `baseUrl` 传递给后端 API
  3. 后端优先使用传递的 `baseUrl`，其次使用环境变量，最后才使用 `request.url`

## 代码修改

### 1. 后端 API (`src/app/api/auth/forgot-password/route.ts`)

**修改前：**
```typescript
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // 构建重置链接 - 问题所在！
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  }
}
```

**修改后：**
```typescript
export async function POST(request: NextRequest) {
  try {
    // 接收前端传递的 baseUrl
    const { email, baseUrl } = await request.json();

    console.log('[忘记密码] 收到请求:', { email, baseUrl });

    // 优先使用前端传递的实际域名，其次使用环境变量，最后使用请求URL
    const finalBaseUrl = baseUrl ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      `${new URL(request.url).protocol}//${new URL(request.url).host}`;

    console.log('[忘记密码] 使用的Base URL:', finalBaseUrl);

    const resetUrl = `${finalBaseUrl}/reset-password?token=${resetToken}`;
  }
}
```

### 2. 后端 API (`src/app/api/auth/reset-password/route.ts`)

**添加详细日志：**
```typescript
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    console.log('[重置密码] 收到请求:', {
      token: token?.substring(0, 20) + '...',
      passwordLength: password?.length
    });

    // 验证并解码token
    console.log('[重置密码] 验证token...');
    const decoded = verifyResetToken(token);

    if (!decoded) {
      console.log('[重置密码] Token验证失败');
      return NextResponse.json(
        { success: false, error: '重置链接无效或已过期' },
        { status: 401 }
      );
    }

    console.log('[重置密码] Token验证成功，用户ID:', decoded.userId, '邮箱:', decoded.email);

    // 获取用户信息
    const user = await userManager.getUserById(decoded.userId);

    if (!user) {
      console.log('[重置密码] 用户不存在，ID:', decoded.userId);
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    console.log('[重置密码] 找到用户:', {
      id: user.id,
      email: user.email,
      username: user.username
    });

    // 验证邮箱是否匹配
    console.log('[重置密码] 验证邮箱:', {
      user_email: user.email,
      decoded_email: decoded.email
    });

    if (user.email !== decoded.email) {
      console.log('[重置密码] 邮箱不匹配');
      return NextResponse.json(
        { success: false, error: '邮箱不匹配' },
        { status: 400 }
      );
    }

    // 更新密码
    console.log('[重置密码] 开始更新用户密码，用户ID:', user.id);
    const db = await getDb();
    const result = await db.update(users)
      .set({
        passwordHash,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, user.id))
      .returning();

    console.log('[重置密码] 密码更新成功，影响行数:', result.length);
  }
}
```

### 3. 前端页面 (`src/app/forgot-password/page.tsx`)

**修改前：**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  }
};
```

**修改后：**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  try {
    // 获取当前页面的实际域名（确保生产环境外网访问正确）
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : '';

    console.log('[忘记密码前端] 请求参数:', { email, baseUrl });

    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, baseUrl }),
    });
  }
};
```

## 环境变量配置

确保 `.env.local` 中配置了正确的生产环境域名：

```env
# 应用域名（用于生成链接和回调地址）
NEXT_PUBLIC_BASE_URL=https://p75463bk4t.coze.site

# 环境变量（development/production）
NODE_ENV=production
```

## 测试步骤

### 内网测试（localhost）

1. 访问 `http://localhost:5000/forgot-password`
2. 输入测试邮箱（如 `208343256@qq.com`）
3. 点击"发送重置链接"
4. 查看控制台日志，确认 baseUrl 为 `http://localhost:5000`
5. 检查邮箱（或控制台输出的 mock 链接）
6. 点击链接，应该能正常访问
7. 输入新密码，应该能成功重置

### 外网测试（生产域名）

1. 访问 `https://p75463bk4t.coze.site/forgot-password`
2. 输入真实邮箱（如 `208343256@qq.com`）
3. 点击"发送重置链接"
4. 查看控制台日志，确认 baseUrl 为 `https://p75463bk4t.coze.site`
5. 检查邮箱，收到重置邮件
6. 点击邮件中的链接，应该能正常访问（**之前这里会失败**）
7. 输入新密码，应该能成功重置

### API 测试（curl）

```bash
# 测试内网
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "208343256@qq.com",
    "baseUrl": "http://localhost:5000"
  }' \
  http://localhost:5000/api/auth/forgot-password

# 测试外网
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "208343256@qq.com",
    "baseUrl": "https://p75463bk4t.coze.site"
  }' \
  http://localhost:5000/api/auth/forgot-password
```

## 预期结果

### 内网测试
- ✅ 邮件中的链接：`http://localhost:5000/reset-password?token=...`
- ✅ 点击链接能正常访问
- ✅ 输入新密码能成功重置

### 外网测试
- ✅ 邮件中的链接：`https://p75463bk4t.coze.site/reset-password?token=...`
- ✅ 点击链接能正常访问（**修复成功！**）
- ✅ 输入新密码能成功重置

## 故障排查

### 问题1：邮件中链接仍然是 localhost
- **检查**：前端是否正确传递 `baseUrl`？
- **检查**：后端日志中的 `baseUrl` 是否为预期值？
- **解决**：确保前端代码已更新并重新部署

### 问题2：点击链接后提示"无此用户"
- **检查**：后端日志中的 `Token验证成功，用户ID` 是多少？
- **检查**：数据库中是否存在该用户？
- **检查**：邮箱是否匹配？
- **解决**：根据日志定位具体问题

### 问题3：Token验证失败
- **检查**：Token是否已过期（默认30分钟）？
- **检查**：Token格式是否正确？
- **解决**：重新生成 Token 并重试

## 技术要点

### request.url vs window.location.origin

| 场景 | request.url (后端) | window.location.origin (前端) |
|------|-------------------|----------------------------|
| 内网访问 | `http://localhost:5000/api/auth/forgot-password` | `http://localhost:5000` |
| 外网访问 | `http://localhost:5000/api/auth/forgot-password` | `https://p75463bk4t.coze.site` |

**关键区别**：`request.url` 始终是服务器内部地址，而 `window.location.origin` 是用户实际访问的地址。

### 为什么不能只用 request.url？

在反向代理/负载均衡环境中：
- 用户访问：`https://p75463bk4t.coze.site`
- 请求到达后端服务器时：`request.url` 可能是 `http://localhost:5000/...`
- 这会导致生成的链接使用内部域名，外网用户无法访问

### 为什么优先使用前端传递的 baseUrl？

1. **前端知道用户实际访问的域名**：`window.location.origin`
2. **后端无法获取真实的访问域名**：`request.url` 是服务器内部地址
3. **环境变量作为兜底**：当前端未传递时，使用环境变量
4. **request.url 作为最后兜底**：开发环境可能需要

## 总结

通过让前端传递实际访问的域名给后端，解决了外网访问时重置链接错误的问题。这是一个典型的前后端协作案例，展示了在复杂的网络环境中如何正确处理域名和 URL。
