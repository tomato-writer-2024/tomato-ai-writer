/**
 * 番茄小说AI写作工具 - 超级管理员控制台登录脚本
 *
 * 使用方法：
 * 1. 修改下面的邮箱和密码
 * 2. 复制整个脚本
 * 3. 按 F12 打开浏览器控制台
 * 4. 粘贴脚本并按 Enter 执行
 * 5. 自动登录成功后会跳转到管理后台
 *
 * 此脚本适用于所有浏览器：Chrome、Edge、Firefox、360、QQ、搜狗等
 */

// ===== 配置区域 - 请修改为你的账号密码 =====
const LOGIN_CONFIG = {
    email: 'admin@tomato-ai.com',  // 修改为你的邮箱
    password: 'Admin@123456'        // 修改为你的密码
};
// ============================================

(async function() {
    console.log('');
    console.log('========================================');
    console.log('  番茄小说AI写作工具 - 自动登录');
    console.log('========================================');
    console.log('');
    console.log('邮箱:', LOGIN_CONFIG.email);
    console.log('');

    try {
        // 步骤1: 调用登录API
        console.log('步骤1: 调用登录API获取token...');
        const loginResp = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: LOGIN_CONFIG.email,
                password: LOGIN_CONFIG.password
            }),
            credentials: 'include'
        });

        const loginData = await loginResp.json();

        if (!loginData.success) {
            throw new Error('登录失败: ' + (loginData.error || '未知错误'));
        }

        const token = loginData.data.token;
        console.log('✅ Token获取成功');
        console.log('   Token长度:', token.length);
        console.log('   Token前20字符:', token.substring(0, 20) + '...');
        console.log('');

        // 步骤2: 验证超级管理员权限（自动尝试3种方式）
        console.log('步骤2: 验证超级管理员权限...');

        let verifySuccess = false;
        let verifyData = null;
        let verifyError = '';

        // 方式1: Authorization header (Bearer token)
        if (!verifySuccess) {
            try {
                console.log('   尝试方式1: Authorization header');
                const resp1 = await fetch('/api/admin/superadmin/verify', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                const data1 = await resp1.json();
                if (data1.success) {
                    verifySuccess = true;
                    verifyData = data1;
                    console.log('   ✅ 方式1验证成功');
                } else {
                    verifyError = data1.error || '未知错误';
                    console.log('   ❌ 方式1失败:', verifyError);
                }
            } catch (e) {
                console.log('   ❌ 方式1异常:', e.message);
                verifyError = e.message;
            }
        }

        // 方式2: X-Auth-Token header
        if (!verifySuccess) {
            try {
                console.log('   尝试方式2: X-Auth-Token header');
                const resp2 = await fetch('/api/admin/superadmin/verify', {
                    method: 'POST',
                    headers: {
                        'X-Auth-Token': token,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                const data2 = await resp2.json();
                if (data2.success) {
                    verifySuccess = true;
                    verifyData = data2;
                    console.log('   ✅ 方式2验证成功');
                } else {
                    verifyError = data2.error || '未知错误';
                    console.log('   ❌ 方式2失败:', verifyError);
                }
            } catch (e) {
                console.log('   ❌ 方式2异常:', e.message);
                verifyError = e.message;
            }
        }

        // 方式3: body参数
        if (!verifySuccess) {
            try {
                console.log('   尝试方式3: body参数');
                const resp3 = await fetch('/api/admin/superadmin/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ token })
                });
                const data3 = await resp3.json();
                if (data3.success) {
                    verifySuccess = true;
                    verifyData = data3;
                    console.log('   ✅ 方式3验证成功');
                } else {
                    verifyError = data3.error || '未知错误';
                    console.log('   ❌ 方式3失败:', verifyError);
                }
            } catch (e) {
                console.log('   ❌ 方式3异常:', e.message);
                verifyError = e.message;
            }
        }

        if (!verifySuccess) {
            throw new Error('所有验证方式均失败: ' + verifyError);
        }

        console.log('');
        console.log('✅ 超级管理员验证通过');
        console.log('   用户ID:', verifyData.admin.id);
        console.log('   用户名:', verifyData.admin.username);
        console.log('');

        // 步骤3: 保存token到本地存储
        console.log('步骤3: 保存token到本地存储...');

        try {
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_info', JSON.stringify(verifyData.admin));
            console.log('✅ Token已保存到localStorage');
        } catch (e) {
            console.warn('⚠️  保存到localStorage失败:', e.message);
        }

        try {
            sessionStorage.setItem('admin_token', token);
            sessionStorage.setItem('admin_info', JSON.stringify(verifyData.admin));
            console.log('✅ Token已保存到sessionStorage');
        } catch (e) {
            console.warn('⚠️  保存到sessionStorage失败:', e.message);
        }

        console.log('');

        // 步骤4: 跳转到管理后台
        console.log('步骤4: 准备跳转到管理后台...');
        console.log('');
        console.log('========================================');
        console.log('  登录成功！即将跳转...');
        console.log('========================================');
        console.log('');

        setTimeout(() => {
            window.location.href = '/admin/dashboard';
        }, 500);

    } catch (e) {
        console.error('');
        console.error('========================================');
        console.error('  ❌ 登录失败');
        console.error('========================================');
        console.error('');
        console.error('错误信息:', e.message);
        console.error('');
        console.error('请检查：');
        console.error('1. 邮箱和密码是否正确');
        console.error('2. 网络连接是否正常');
        console.error('3. 是否访问的正确的URL (localhost:5000)');
        console.error('');
        alert('登录失败: ' + e.message + '\n\n请查看控制台了解详细信息');
    }
})();
