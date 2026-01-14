# Windows 本地启动指南

## 快速启动（推荐）

### 1. 打开命令提示符或 PowerShell

```powershell
# 按 Win + R，输入 cmd 或 powershell，回车
# 或者右键"开始"菜单，选择"Windows PowerShell"或"命令提示符"
```

### 2. 进入项目目录

```powershell
# 方法1：使用 cd 命令
cd C:\tomato-ai-writer\tomato-ai-writer

# 方法2：先切换到 C 盘根目录，再进入项目
cd C:\
cd tomato-ai-writer\tomato-ai-writer
```

### 3. 安装依赖（首次运行）

```powershell
# 使用 npm（推荐）
npm install

# 或使用 pnpm（如果已安装）
pnpm install
```

### 4. 启动开发服务器

```powershell
# 使用 npm
npm run dev

# 或使用 pnpm
pnpm dev
```

### 5. 等待启动完成

启动成功后，您会看到类似以下输出：

```
Ready in 3.2s

◐ Compiling / ...
 ✓ Compiled / in 3.2s
 ○ Compiling /_not-found ...
 ✓ Compiled /_not-found in 231ms

  ▲ Next.js 16.0.0
  - Local:        http://localhost:5000
  - Environments: .env.local
```

### 6. 访问应用

打开浏览器，访问：
- 主登录页面：http://localhost:5000/login
- 测试登录页面：http://localhost:5000/test-login
- 主页：http://localhost:5000

## 登录信息

```
邮箱：208343256@qq.com
密码：TomatoAdmin@2024
```

## 常见问题排查

### 问题1：端口被占用

**错误信息：**
```
Port 5000 is already in use
```

**解决方案：**

```powershell
# 方法1：查看占用端口的进程
netstat -ano | findstr :5000

# 方法2：结束占用端口的进程（替换 <PID> 为实际进程ID）
taskkill /PID <PID> /F

# 方法3：使用其他端口
# 修改 next.config.mjs 中的端口号，或使用：
npm run dev -- -p 3001
```

### 问题2：依赖安装失败

**错误信息：**
```
npm ERR! code ECONNREFUSED
npm ERR! network request failed
```

**解决方案：**

```powershell
# 方法1：使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install

# 方法2：清除缓存后重试
npm cache clean --force
npm install

# 方法3：使用 cnpm（需要先安装）
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install
```

### 问题3：数据库连接失败

**错误信息：**
```
Error: connect ECONNREFUSED
```

**解决方案：**

1. 检查 `.env.local` 文件是否存在
2. 确认 `DATABASE_URL` 配置正确
3. 确认网络连接正常

```powershell
# 查看环境变量配置
type .env.local

# 测试数据库连接（需要安装 node 和 pg）
node test-db-connection.mjs
```

### 问题4：登录失败

**可能原因：**

1. **管理员账号未创建**

   运行创建脚本：

   ```powershell
   # 安装 tsx（如未安装）
   npm install -g tsx

   # 运行管理员创建脚本
   npx tsx src/scripts/create-admin-direct.ts
   ```

2. **浏览器缓存问题**

   - 使用无痕模式（隐私模式）登录
   - 或清除浏览器缓存后重试

3. **数据库连接模式错误**

   检查 `.env.local` 中的配置：

   ```powershell
   # 查看 DATABASE_MOCK_MODE 设置
   type .env.local | findstr DATABASE_MOCK_MODE

   # 确保设置为 false（使用真实数据库）
   DATABASE_MOCK_MODE=false
   ```

## 手动测试登录

### 方法1：使用 curl（推荐）

```powershell
# Windows PowerShell
curl -X POST http://localhost:5000/api/auth/login-direct `
  -H "Content-Type: application/json" `
  -d '{"email":"208343256@qq.com","password":"TomatoAdmin@2024"}'
```

### 方法2：使用测试登录页面

1. 启动服务后，访问：http://localhost:5000/test-login
2. 页面会显示详细的登录日志
3. 点击"填入管理员账号"按钮
4. 点击"登录"按钮
5. 查看日志输出

### 方法3：使用主登录页面

1. 访问：http://localhost:5000/login
2. 输入邮箱：208343256@qq.com
3. 输入密码：TomatoAdmin@2024
4. 点击"登录"按钮

## 完整启动流程示例

```powershell
# ========================================
# Windows 完整启动流程
# ========================================

# 1. 进入项目目录
cd C:\tomato-ai-writer\tomato-ai-writer

# 2. 安装依赖（首次运行）
npm install

# 3. 创建管理员账号（首次运行）
npm install -g tsx
npx tsx src/scripts/create-admin-direct.ts

# 4. 启动开发服务器
npm run dev

# 保持此窗口打开，不要关闭
# ========================================
```

## 停止服务

在命令行窗口中，按 `Ctrl + C` 停止服务

## 重新启动服务

```powershell
# 停止服务（Ctrl + C）
# 然后重新启动
npm run dev
```

## 检查服务状态

```powershell
# 检查端口是否被监听
netstat -ano | findstr :5000

# 如果有输出，说明服务正在运行
```

## 后台运行服务（可选）

如果您希望在后台运行服务：

### 方法1：使用 start 命令

```powershell
# 在新窗口中启动
start cmd /k "npm run dev"
```

### 方法2：使用 PowerShell 后台作业

```powershell
# 启动后台作业
Start-Job -ScriptBlock { cd C:\tomato-ai-writer\tomato-ai-writer; npm run dev }

# 查看后台作业
Get-Job

# 停止后台作业
Stop-Job -Id <JobId>
Remove-Job -Id <JobId>
```

## 日志查看

开发服务运行时，所有日志会直接输出在命令行窗口中，包括：
- 编译信息
- 请求日志
- 错误信息
- 数据库查询日志

## 下一步

启动成功后，您可以：
1. 访问 http://localhost:5000/login 登录
2. 访问 http://localhost:5000/test-login 测试登录（带日志）
3. 访问 http://localhost:5000 查看主页
4. 登录后访问 http://localhost:5000/workspace 进入工作区

## 需要帮助？

如果遇到问题，请检查：
1. Node.js 版本是否 >= 18.17.0
2. npm 是否正常工作
3. 端口 5000 是否被占用
4. 网络连接是否正常
5. 防火墙是否允许 Node.js 访问网络
