# 🔐 登录问题解决方案

## ✅ 确认信息

**服务状态**: ✅ 正常运行在端口 5000
**登录页面**: ✅ 文件已创建并可访问

---

## 🚀 三种登录方式（任选其一）

### 方式1: 纯原生登录页面（推荐，100%兼容所有浏览器）

```
访问地址: http://localhost:5000/standalone-login.html
```

**优点**:
- ✅ 纯HTML + JavaScript，不依赖任何框架
- ✅ 适用于所有浏览器：Chrome、Edge、Firefox、360、QQ、搜狗等
- ✅ 内置3种Token传输方式，自动降级
- ✅ 实时调试日志，方便排查问题
- ✅ 可生成控制台脚本作为终极解决方案

**使用步骤**:
1. 复制上面地址到浏览器地址栏
2. 输入邮箱: `admin@tomato-ai.com`
3. 输入密码: `Admin@123456`
4. 点击"登录"或"🚀 一键登录"按钮

---

### 方式2: 标准登录页面（React应用）

```
访问地址: http://localhost:5000/admin/login
```

**适用场景**:
- Chrome浏览器
- Microsoft Edge浏览器
- 其他现代浏览器

---

### 方式3: 连接诊断页面（排查问题用）

```
访问地址: http://localhost:5000/diagnostic.html
```

**功能**:
- 检查当前连接信息
- 提供多个登录入口
- 常见问题解答
- 手动诊断命令

---

## ❓ 如果遇到404错误

### 检查清单

1. ✅ **确认URL是否正确**
   - 本地访问: `http://localhost:5000/standalone-login.html`
   - 注意使用 `http` 而不是 `https`
   - 确保端口号是 `5000`

2. ✅ **确认服务是否运行**
   ```bash
   # 在终端运行以下命令检查端口
   netstat -an | grep 5000
   # 或
   lsof -i:5000
   ```

3. ✅ **清除浏览器缓存**
   - Chrome: Ctrl+Shift+Delete
   - Edge: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete

4. ✅ **尝试无痕模式**
   - Chrome: Ctrl+Shift+N
   - Edge: Ctrl+Shift+P
   - Firefox: Ctrl+Shift+P

---

## 🔧 终极解决方案：控制台脚本

如果以上方式都无法访问，请使用控制台脚本：

### 步骤

1. 访问 `http://localhost:5000/diagnostic.html`
2. 按 **F12** 打开浏览器控制台
3. 复制并运行以下脚本：

```javascript
(async function() {
    console.log('🚀 开始自动登录...');

    const email = 'admin@tomato-ai.com';
    const password = 'Admin@123456';

    try {
        // 1. 调用登录API
        console.log('步骤1: 调用登录API...');
        const loginResp = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        const loginData = await loginResp.json();
        console.log('登录响应:', loginData);

        if (!loginData.success) {
            throw new Error(loginData.error || '登录失败');
        }

        const token = loginData.data.token;
        console.log('✅ Token获取成功');

        // 2. 存储Token
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);
        console.log('✅ Token已存储');

        // 3. 验证并跳转
        console.log('步骤2: 验证Token...');
        const verifyResp = await fetch('/api/admin/superadmin/verify', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const verifyData = await verifyResp.json();
        console.log('验证响应:', verifyData);

        if (verifyData.success) {
            console.log('✅ 验证成功，准备跳转...');
            setTimeout(() => {
                window.location.href = '/admin/dashboard';
            }, 1000);
        } else {
            throw new Error(verifyData.error || '验证失败');
        }
    } catch (error) {
        console.error('❌ 登录失败:', error);
        alert('登录失败: ' + error.message);
    }
})();
```

---

## 📞 仍然无法解决？

1. 查看浏览器控制台的错误信息（F12）
2. 尝试不同的浏览器
3. 检查防火墙设置
4. 确认没有其他程序占用5000端口

---

## ✅ 默认账号信息

```
邮箱: admin@tomato-ai.com
密码: Admin@123456
```

---

## 📚 相关文档

- [快速登录指南](QUICK_LOGIN.md)
- [完整登录文档](docs/登录指南-适用于所有浏览器.md)
