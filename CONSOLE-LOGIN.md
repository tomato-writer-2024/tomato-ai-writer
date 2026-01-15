# 🚀 控制台一键登录脚本（适用于360和Edge浏览器）

## ✨ 特点

- ✅ 纯JavaScript代码，不依赖任何框架
- ✅ 适用于所有浏览器：360、Edge、Chrome、Firefox、QQ等
- ✅ 自动处理所有登录逻辑
- ✅ 自动跳转到管理后台
- ✅ 实时显示执行日志

---

## 📝 使用步骤

### 第一步：打开控制台

**Microsoft Edge**:
1. 按键盘 `F12` 键
2. 或右键点击页面 → "检查"
3. 点击顶部的 "Console"（控制台）标签

**360浏览器**:
1. 按键盘 `F12` 键
2. 或右键点击页面 → "审查元素"
3. 点击顶部的 "控制台" 或 "Console" 标签

### 第二步：清除控制台

在控制台中输入以下命令并按回车：

```javascript
console.clear();
```

### 第三步：复制并执行登录脚本

将下面的脚本**完整复制**，粘贴到控制台中，然后按回车：

---

## 🚀 登录脚本（复制下面的所有代码）

```javascript
/****************************************
 * 番茄AI写作工具 - 自动登录脚本
 * 适用于：360浏览器、Edge、Chrome等所有浏览器
 ****************************************/

(async function autoLogin() {
    console.log('%c🚀 开始自动登录流程...', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
    
    // 配置信息
    const CONFIG = {
        email: 'admin@tomato-ai.com',
        password: 'Admin@123456',
        api: {
            login: '/api/auth/login',
            verify: '/api/admin/superadmin/verify'
        }
    };

    // 辅助函数：日志输出
    function log(message, type = 'info') {
        const colors = {
            info: '#64748b',
            success: '#16a34a',
            error: '#dc2626',
            warning: '#ea580c'
        };
        const icons = {
            info: 'ℹ️',
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };
        console.log(`%c${icons[type]} ${message}`, `color: ${colors[type]}; font-size: 14px;`);
    }

    // 步骤1：检查API是否可访问
    log('步骤 1/5：检查服务器连接...', 'info');
    try {
        const healthResp = await fetch('/api/auth/health', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }).catch(() => null);

        if (healthResp && healthResp.ok) {
            log('服务器连接正常', 'success');
        } else {
            log('警告：健康检查失败，但继续尝试登录', 'warning');
        }
    } catch (e) {
        log('健康检查跳过（API可能不存在）', 'warning');
    }

    // 步骤2：调用登录API
    log('步骤 2/5：调用登录API...', 'info');
    let token = null;

    try {
        const loginResp = await fetch(CONFIG.api.login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: CONFIG.email,
                password: CONFIG.password
            }),
            credentials: 'include'
        });

        console.log('登录响应状态:', loginResp.status, loginResp.statusText);

        const loginData = await loginResp.json();
        console.log('登录响应数据:', loginData);

        if (!loginResp.ok || !loginData.success) {
            throw new Error(loginData.error || '登录失败');
        }

        token = loginData.data.token;
        log(`Token获取成功（长度: ${token.length}字符）`, 'success');

    } catch (error) {
        log(`登录失败: ${error.message}`, 'error');
        console.error('详细错误:', error);
        return;
    }

    // 步骤3：存储Token到多个位置
    log('步骤 3/5：存储Token到本地存储...', 'info');

    try {
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);
        document.cookie = `token=${token}; path=/; max-age=604800`;
        log('Token已存储到 localStorage、sessionStorage 和 cookie', 'success');
    } catch (e) {
        log(`部分存储失败: ${e.message}`, 'warning');
    }

    // 步骤4：验证超级管理员权限（尝试多种方式）
    log('步骤 4/5：验证超级管理员权限...', 'info');

    let verifySuccess = false;
    let verifyData = null;

    // 方式1：Authorization header
    try {
        log('尝试方式 1: Authorization Bearer Token', 'info');
        const resp1 = await fetch(CONFIG.api.verify, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        const data1 = await resp1.json();
        console.log('方式1 响应:', data1);

        if (data1.success) {
            verifySuccess = true;
            verifyData = data1;
            log('方式1 验证成功 ✅', 'success');
        } else {
            log(`方式1 失败: ${data1.error}`, 'warning');
        }
    } catch (e) {
        log(`方式1 异常: ${e.message}`, 'warning');
    }

    // 方式2：X-Auth-Token header
    if (!verifySuccess) {
        try {
            log('尝试方式 2: X-Auth-Token header', 'info');
            const resp2 = await fetch(CONFIG.api.verify, {
                method: 'POST',
                headers: {
                    'X-Auth-Token': token,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            const data2 = await resp2.json();
            console.log('方式2 响应:', data2);

            if (data2.success) {
                verifySuccess = true;
                verifyData = data2;
                log('方式2 验证成功 ✅', 'success');
            } else {
                log(`方式2 失败: ${data2.error}`, 'warning');
            }
        } catch (e) {
            log(`方式2 异常: ${e.message}`, 'warning');
        }
    }

    // 方式3：body参数
    if (!verifySuccess) {
        try {
            log('尝试方式 3: body参数', 'info');
            const resp3 = await fetch(CONFIG.api.verify, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token }),
                credentials: 'include'
            });
            const data3 = await resp3.json();
            console.log('方式3 响应:', data3);

            if (data3.success) {
                verifySuccess = true;
                verifyData = data3;
                log('方式3 验证成功 ✅', 'success');
            } else {
                log(`方式3 失败: ${data3.error}`, 'warning');
            }
        } catch (e) {
            log(`方式3 异常: ${e.message}`, 'warning');
        }
    }

    // 步骤5：跳转或显示结果
    log('步骤 5/5：处理登录结果...', 'info');

    if (verifySuccess) {
        console.log('%c=====================================', 'color: #16a34a; font-weight: bold;');
        console.log('%c✅ 登录成功！', 'color: #16a34a; font-size: 18px; font-weight: bold;');
        console.log('%c=====================================', 'color: #16a34a; font-weight: bold;');
        console.log('验证数据:', verifyData);

        // 等待1秒后跳转
        log('准备跳转到管理后台...', 'success');

        setTimeout(() => {
            // 尝试多个可能的跳转地址
            const possibleTargets = [
                '/admin/dashboard',
                '/admin',
                '/dashboard'
            ];

            // 先跳转到首页，让后端处理
            window.location.href = '/admin/dashboard';
        }, 1000);

    } else {
        console.log('%c=====================================', 'color: #dc2626; font-weight: bold;');
        console.log('%c❌ 登录失败', 'color: #dc2626; font-size: 18px; font-weight: bold;');
        console.log('%c=====================================', 'color: #dc2626; font-weight: bold;');
        console.log('%c请检查：', 'color: #dc2626; font-weight: bold;');
        console.log('1. 邮箱和密码是否正确');
        console.log('2. 服务器是否正常运行（端口5000）');
        console.log('3. 网络连接是否正常');
        console.log('%c默认账号:', 'color: #64748b;');
        console.log('  邮箱: admin@tomato-ai.com');
        console.log('  密码: Admin@123456');
    }

})();
```

---

## 🎯 执行后的结果

### ✅ 成功情况

控制台会显示：

```
🚀 开始自动登录流程...
ℹ️ 步骤 1/5：检查服务器连接...
✅ 服务器连接正常
ℹ️ 步骤 2/5：调用登录API...
✅ Token获取成功（长度: 1234字符）
ℹ️ 步骤 3/5：存储Token到本地存储...
✅ Token已存储到 localStorage、sessionStorage 和 cookie
ℹ️ 步骤 4/5：验证超级管理员权限...
ℹ️ 尝试方式 1: Authorization Bearer Token
✅ 方式1 验证成功 ✅
ℹ️ 步骤 5/5：处理登录结果...
✅ 准备跳转到管理后台...

=====================================
✅ 登录成功！
=====================================
```

浏览器会自动跳转到管理后台。

### ❌ 失败情况

控制台会显示具体的错误信息，请根据提示检查：
- 服务器是否正常运行
- 网络连接是否正常
- 邮箱密码是否正确

---

## ⚠️ 注意事项

1. **安全性提示**：
   - 第一次粘贴时，浏览器可能会显示警告："不要将代码粘贴到不了解或尚未审阅自己的 DevTools 控制台中"
   - 输入：`允许粘贴` 并按回车
   - 然后重新粘贴脚本并执行

2. **如果执行失败**：
   - 确保在 `http://localhost:5000` 的任意页面上执行
   - 不要在 `https://` 页面执行
   - 检查控制台是否有其他错误信息

3. **修改账号密码**：
   - 如果需要使用其他账号，修改脚本中的：
     ```javascript
     const CONFIG = {
         email: 'your-email@example.com',
         password: 'your-password',
         ...
     };
     ```

---

## 📱 如果仍然无法登录

1. 打开浏览器控制台（F12）
2. 点击 "Network"（网络）标签
3. 重新执行登录脚本
4. 查看请求列表中失败的请求
5. 点击失败的请求，查看 "Headers" 和 "Response" 标签
6. 将错误信息截图或复制给我，我会帮您进一步诊断

---

## ✅ 优势

相比使用登录页面，控制台脚本的优势：

- ✅ 完全绕过HTML页面和React框架
- ✅ 不受浏览器安全策略限制
- ✅ 可以看到详细的执行日志
- ✅ 适用于所有浏览器，包括360、Edge、Chrome、Firefox等
- ✅ 一次编写，永久使用

**祝您登录顺利！** 🎉
