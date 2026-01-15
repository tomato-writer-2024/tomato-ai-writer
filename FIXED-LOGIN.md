# 🔐 超级管理员登录 - 最终修正版

## ⚠️ 问题已修正

Dashboard页面需要的token key是 `admin_token` 和 `admin_info`，已修正脚本。

---

## 📋 操作步骤

### 第一步：打开浏览器
访问任意 `http://localhost:5000` 页面

### 第二步：按 F12 打开控制台

### 第三步：复制并执行下面的修正脚本

---

## 🚀 最终修正版登录脚本（复制以下代码）

```javascript
/****************************************
 * 超级管理员自动登录脚本 - 修正版
 * 正确保存 admin_token 和 admin_info
 ****************************************/

(async function login() {
    console.clear();
    console.log('%c🚀 开始登录超级管理员后台...', 'color: #3b82f6; font-size: 16px; font-weight: bold;');

    const email = '208343256@qq.com';
    const password = 'TomatoAdmin@2024';

    try {
        console.log('正在登录...');
        console.log('账号:', email);

        // 1. 登录获取Token
        const loginResp = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        const loginData = await loginResp.json();

        if (!loginResp.ok || !loginData.success) {
            throw new Error(loginData.error || '登录失败');
        }

        const token = loginData.data.token;
        const user = loginData.data.user;

        console.log('%c✅ 登录成功！', 'color: #16a34a;');
        console.log('用户信息:', user);

        // 2. ✅ 使用正确的key保存token和用户信息
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_info', JSON.stringify(user));

        // 也保存到sessionStorage
        sessionStorage.setItem('admin_token', token);
        sessionStorage.setItem('admin_info', JSON.stringify(user));

        // Cookie也保存（兼容性）
        document.cookie = `token=${token}; path=/; max-age=604800`;

        console.log('%c✅ Token和用户信息已保存到浏览器', 'color: #16a34a;');
        console.log('保存的keys: admin_token, admin_info');

        // 3. 验证超级管理员权限
        console.log('正在验证权限...');
        const verifyResp = await fetch('/api/admin/superadmin/verify', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const verifyData = await verifyResp.json();

        if (!verifyData.success) {
            throw new Error(verifyData.error || '权限验证失败');
        }

        console.log('%c✅ 权限验证成功！', 'color: #16a34a;');
        console.log('%c=====================================', 'color: #16a34a; font-weight: bold;');
        console.log('%c✅ 登录成功！正在跳转...', 'color: #16a34a; font-size: 18px; font-weight: bold;');
        console.log('%c=====================================', 'color: #16a34a; font-weight: bold;');

        // 4. 跳转到dashboard
        setTimeout(() => {
            window.location.href = '/admin/dashboard';
        }, 1500);

    } catch (error) {
        console.log('%c=====================================', 'color: #dc2626; font-weight: bold;');
        console.log('%c❌ 登录失败', 'color: #dc2626; font-size: 18px; font-weight: bold;');
        console.log('%c=====================================', 'color: #dc2626; font-weight: bold;');
        console.error('错误：', error.message);

        // 显示调试信息
        console.log('');
        console.log('%c调试信息：', 'color: #64748b;');
        console.log('已保存的数据:');
        console.log('  admin_token:', localStorage.getItem('admin_token'));
        console.log('  admin_info:', localStorage.getItem('admin_info'));
    }

})();
```

---

## ✅ 关键修正点

1. **使用正确的key名称**：
   - `admin_token`（不是 `token`）
   - `admin_info`（JSON格式的用户信息）

2. **保存到多个位置**：
   - localStorage（永久）
   - sessionStorage（会话）
   - Cookie（兼容）

---

## 🎯 验证是否成功

### 在控制台运行以下命令检查：

```javascript
console.log('admin_token:', localStorage.getItem('admin_token'));
console.log('admin_info:', localStorage.getItem('admin_info'));
```

应该能看到token和用户信息的JSON字符串。

---

## 📌 使用后如何进入

**直接访问：**

```
http://localhost:5000/admin/dashboard
```

会自动检测到 `admin_token` 和 `admin_info`，直接进入！

---

## ⚠️ 如果还是失败

请复制以下诊断代码到控制台执行：

```javascript
// 诊断检查
console.log('=== localStorage检查 ===');
console.log('admin_token:', localStorage.getItem('admin_token'));
console.log('admin_info:', localStorage.getItem('admin_info'));
console.log('');
console.log('=== sessionStorage检查 ===');
console.log('admin_token:', sessionStorage.getItem('admin_token'));
console.log('admin_info:', sessionStorage.getItem('admin_info'));
console.log('');
console.log('=== Cookie检查 ===');
console.log(document.cookie);
```

将结果告诉我，我会进一步帮你诊断。
