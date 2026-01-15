# 🔐 超级管理员登录 - 完整脚本

## ✨ 说明

**只需执行一次**，登录成功后浏览器会自动保存Token，后续访问无需再执行脚本！

---

## 📋 操作步骤

### 第一步：打开浏览器

使用 **360浏览器** 或 **Microsoft Edge** 打开任意页面：

```
http://localhost:5000
```

### 第二步：打开控制台

- **360浏览器**：按 `F12` 键 → 点击 "控制台" 标签
- **Edge浏览器**：按 `F12` 键 → 点击 "Console" 标签

### 第三步：清除控制台（可选）

在控制台中输入：

```javascript
console.clear()
```

按回车执行。

### 第四步：复制并执行登录脚本

**完整复制下面的代码**，粘贴到控制台中，按回车执行：

---

## 🚀 完整登录脚本（复制下面的全部代码）

```javascript
/****************************************
 * 超级管理员自动登录脚本
 * 执行一次后，浏览器会自动保存登录状态
 * 后续访问 http://localhost:5000/admin/dashboard 即可直接进入
 ****************************************/

(async function login() {
    console.clear();
    console.log('%c🚀 开始登录超级管理员后台...', 'color: #3b82f6; font-size: 16px; font-weight: bold;');

    // 配置
    const email = 'admin@tomato-ai.com';
    const password = 'Admin@123456';

    try {
        // 1. 登录获取Token
        console.log('正在登录...');
        const loginResp = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        const loginData = await loginResp.json();
        if (!loginData.success) {
            throw new Error(loginData.error || '登录失败');
        }

        const token = loginData.data.token;
        console.log('%c✅ 登录成功！Token已获取', 'color: #16a34a;');

        // 2. 保存Token到多个位置（实现永久登录）
        localStorage.setItem('token', token);           // 永久保存（清除浏览器数据才会删除）
        sessionStorage.setItem('token', token);          // 会话保存（关闭浏览器后清除）
        document.cookie = `token=${token}; path=/; max-age=604800`; // Cookie保存7天
        console.log('%c✅ Token已保存到浏览器（永久有效）', 'color: #16a34a;');

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

        // 4. 跳转到管理后台
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
        console.log('%c请检查：', 'color: #dc2626; font-weight: bold;');
        console.log('  1. 服务器是否正常运行（端口5000）');
        console.log('  2. 网络连接是否正常');
        console.log('  3. 默认账号是否正确：');
        console.log('     邮箱：admin@tomato-ai.com');
        console.log('     密码：Admin@123456');
    }

})();
```

---

## ✅ 第一次执行后

### 成功标志

控制台会显示：

```
🚀 开始登录超级管理员后台...
正在登录...
✅ 登录成功！Token已获取
✅ Token已保存到浏览器（永久有效）
正在验证权限...
✅ 权限验证成功！
=====================================
✅ 登录成功！正在跳转...
=====================================
ℹ️ 提示：
  - Token已保存，下次可直接访问管理后台
  - 管理后台地址：http://localhost:5000/admin/dashboard
```

浏览器会自动跳转到管理后台。

---

## 🎯 以后如何登录（无需脚本）

### 方式1：直接访问管理后台

在浏览器地址栏输入：

```
http://localhost:5000/admin/dashboard
```

如果Token未过期，会直接进入管理后台。

### 方式2：访问首页

在浏览器地址栏输入：

```
http://localhost:5000/
```

然后点击左侧菜单中的管理后台入口。

---

## 📌 重要说明

### Token有效期

- **localStorage**：永久保存（手动清除浏览器数据或清除缓存才会删除）
- **sessionStorage**：关闭浏览器后清除
- **Cookie**：7天有效期

### 何时需要重新执行脚本

只有以下情况需要重新执行脚本：

1. ✅ **清除了浏览器数据/缓存**
2. ✅ **Cookie过期（7天后）**
3. ✅ **使用了无痕模式**
4. ✅ **更换了浏览器**

### 修改账号密码（如果需要）

如果需要使用其他账号，修改脚本中的这两行：

```javascript
const email = 'your-email@example.com';
const password = 'your-password';
```

---

## ⚠️ 第一次粘贴时的提示

如果浏览器显示：

> "不要将代码粘贴到不了解或尚未审阅自己的 DevTools 控制台中"

输入：`允许粘贴` 然后回车，然后重新粘贴脚本。

---

## 🎉 完成后

现在你可以：
1. ✅ 直接访问 `http://localhost:5000/admin/dashboard` 进入管理后台
2. ✅ Token永久保存，无需重复执行脚本
3. ✅ 在360浏览器和Edge中无缝切换使用

**祝你使用愉快！** 🚀
