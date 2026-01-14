# 快速启动指南（Windows）

## 🚀 最快启动方式（推荐）

### 方式1：双击批处理文件

直接双击项目根目录下的 `start-windows.bat` 文件，脚本会自动：
1. 检查并安装依赖
2. 检查并创建管理员账号
3. 启动开发服务器

### 方式2：命令行启动

```cmd
# 1. 打开命令提示符（cmd）或 PowerShell

# 2. 进入项目目录
cd C:\tomato-ai-writer\tomato-ai-writer

# 3. 安装依赖（首次运行）
npm install

# 4. 启动服务器
npm run dev
```

## 🔑 登录信息

```
邮箱：208343256@qq.com
密码：TomatoAdmin@2024
```

## 🌐 访问地址

启动成功后，在浏览器中访问：

- **主页**：http://localhost:5000
- **登录**：http://localhost:5000/login
- **测试登录**：http://localhost:5000/test-login（推荐，带详细日志）

## ✅ 验证服务是否启动

启动成功后，命令行会显示：

```
▲ Next.js 16.0.0
  - Local:        http://localhost:5000
```

## 🔧 测试登录

### 方法1：双击测试脚本

双击项目根目录下的 `test-login-windows.bat` 文件，会显示登录测试结果。

### 方法2：访问测试页面

在浏览器中访问 http://localhost:5000/test-login

页面功能：
- 点击"填入管理员账号"自动填入登录信息
- 点击"登录"进行登录
- 右侧显示详细日志
- 登录成功后自动跳转到工作区

## ⚠️ 常见问题

### Q1：端口被占用

```cmd
# 查看占用端口的进程
netstat -ano | findstr :5000

# 结束进程（替换 PID）
taskkill /PID <进程ID> /F
```

### Q2：npm install 失败

```cmd
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### Q3：登录失败

1. 确保服务已启动（http://localhost:5000 能访问）
2. 使用无痕模式（隐私模式）登录
3. 访问测试登录页面查看详细日志

## 📖 详细文档

- 完整启动指南：`WINDOWS_LOCAL_STARTUP.md`
- 登录测试文档：`LOCAL_LOGIN_TEST.md`

## 💡 提示

- 启动后不要关闭命令行窗口
- 按 `Ctrl + C` 停止服务
- 修改代码后会自动热更新
- 首次启动需要安装依赖，大约 1-3 分钟
