# 🔐 超级管理员登录 - 正确账号版本

## ⚠️ 重要信息

**正确账号：**
```
邮箱：208343256@qq.com
密码：TomatoAdmin@2024
```

---

## 📋 操作步骤

### 第一步：打开浏览器
使用 **360浏览器** 或 **Microsoft Edge**，访问任意 `localhost:5000` 开头的页面

### 第二步：按 F12 打开控制台

### 第三步：复制并执行下面的脚本

---

## 🚀 修正后的登录脚本（使用正确账号）

```javascript
/****************************************
 * 超级管理员自动登录脚本
 * 使用数据库中已存在的账号
 ****************************************/

(async function login() {
    console.clear();
    console.log('%c🚀 开始登录超级管理员后台...', 'color: #3b82f6; font-size: 16px; font-weight: bold;');

    // ✅ 使用正确的超级管理员账号
    const email = '208343256@qq.com';
    const password = 'TomatoAdmin@2024';

    try {
        console.log('正在登录...');
        console.log('账号:', email);

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
        console.log('%c✅ 登录成功！Token已获取', 'color: #16a34a;');

        // 保存Token到浏览器（永久有效）
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);
        document.cookie = `token=${token}; path=/; max-age=604800`;
        console.log('%c✅ Token已保存到浏览器（永久有效）', 'color: #16a34a;');

        // 验证超级管理员权限
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
        console.log('ℹ️ 提示：');
        console.log('  - Token已保存，下次可直接访问管理后台');
        console.log('  - 管理后台地址：http://localhost:5000/admin/dashboard');

        setTimeout(() => {
            window.location.href = '/admin/dashboard';
        }, 1500);

    } catch (error) {
        console.log('%c=====================================', 'color: #dc2626; font-weight: bold;');
        console.log('%c❌ 登录失败', 'color: #dc2626; font-size: 18px; font-weight: bold;');
        console.log('%c=====================================', 'color: #dc2626; font-weight: bold;');
        console.error('错误：', error.message);
        console.log('');
        console.log('%c当前使用账号：', 'color: #dc2626; font-weight: bold;');
        console.log('  邮箱：208343256@qq.com');
        console.log('  密码：TomatoAdmin@2024');
    }

})();
```

---

## ✅ 成功标志

控制台显示绿色成功信息后，会自动跳转到：
```
http://localhost:5000/admin/dashboard
```

---

## 🎯 以后如何登录（无需脚本）

**直接在浏览器地址栏输入：**

```
http://localhost:5000/admin/dashboard
```

Token已保存，会自动登录！

---

## 📌 重要说明

- ✅ **只需执行一次**脚本
- ✅ Token永久保存在浏览器中
- ✅ 以后直接访问 `/admin/dashboard` 即可
- ✅ 不需要重复执行脚本
