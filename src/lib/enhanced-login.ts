/**
 * 增强型登录工具
 * 支持多重Token传输方式，解决不同浏览器的兼容性问题
 */

export interface LoginResult {
	success: boolean;
	error?: string;
	token?: string;
	user?: any;
	debug?: string[];
}

export interface LoginOptions {
	email: string;
	password: string;
	// 是否使用多重Token传输
	useMultiToken?: boolean;
	// 最大重试次数
	maxRetries?: number;
	// 调试回调
	onDebug?: (message: string) => void;
}

/**
 * 增强型登录函数
 * 支持多重Token传输方式：Authorization header、X-Auth-Token、body参数
 */
export async function enhancedLogin(options: LoginOptions): Promise<LoginResult> {
	const {
		email,
		password,
		useMultiToken = true,
		maxRetries = 3,
		onDebug = () => {},
	} = options;

	const debugInfo: string[] = [];
	const addDebug = (msg: string) => {
		const timestamp = new Date().toLocaleTimeString();
		const fullMsg = `[${timestamp}] ${msg}`;
		debugInfo.push(fullMsg);
		onDebug(fullMsg);
		console.log('[增强登录]', msg);
	};

	addDebug('=== 开始增强登录流程 ===');
	addDebug(`使用多重Token传输: ${useMultiToken}`);
	addDebug(`最大重试次数: ${maxRetries}`);

	// 第一步：获取token
	addDebug('步骤1: 调用登录API获取token');

	try {
		const loginResponse = await fetch('/api/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email, password }),
			credentials: 'include',
		});

		addDebug(`登录API状态码: ${loginResponse.status}`);

		const loginData = await loginResponse.json();

		if (!loginResponse.ok || !loginData.success) {
			addDebug(`登录失败: ${loginData.error || '未知错误'}`);
			return {
				success: false,
				error: loginData.error || '登录失败',
				debug: debugInfo,
			};
		}

		const token = loginData.data.token;
		addDebug(`✅ 获取token成功，长度: ${token.length}, 前20字符: ${token.substring(0, 20)}...`);

		// 第二步：验证token（支持多重传输方式）
		addDebug('步骤2: 验证超级管理员权限');

		// 定义Token传输策略
		const strategies = [
			{
				name: 'Authorization header',
				execute: async () => {
					return await fetch('/api/admin/superadmin/verify', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${token}`,
						},
						credentials: 'include',
					});
				},
			},
			{
				name: 'X-Auth-Token header',
				execute: async () => {
					return await fetch('/api/admin/superadmin/verify', {
						method: 'POST',
						headers: {
							'X-Auth-Token': token,
						},
						credentials: 'include',
					});
				},
			},
			{
				name: 'body参数',
				execute: async () => {
					return await fetch('/api/admin/superadmin/verify', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						credentials: 'include',
						body: JSON.stringify({ token }),
					});
				},
			},
		];

		// 尝试每种策略
		let verifySuccess = false;
		let lastError: string | null = null;
		let adminInfo: any = null;

		for (const strategy of strategies) {
			addDebug(`尝试策略: ${strategy.name}`);

			try {
				const response = await strategy.execute();
				addDebug(`${strategy.name} 响应状态: ${response.status}`);

				if (response.ok) {
					const data = await response.json();
					if (data.success) {
						addDebug(`✅ ${strategy.name} 验证成功!`);
						verifySuccess = true;
						adminInfo = data.admin;
						break;
					}
				}

				lastError = `${strategy.name} 返回 ${response.status}`;
				addDebug(`❌ ${strategy.name} 失败: ${lastError}`);
			} catch (e: any) {
				lastError = `${strategy.name} 异常: ${e.message}`;
				addDebug(`❌ ${strategy.name} 异常: ${e.message}`);
			}
		}

		if (!verifySuccess) {
			addDebug('所有Token传输策略均失败');
			return {
				success: false,
				error: `Token验证失败，最后错误: ${lastError}`,
				debug: debugInfo,
			};
		}

		addDebug('✅ 超级管理员验证通过');

		// 第三步：保存token
		addDebug('步骤3: 保存token到本地存储');

		try {
			// 保存到localStorage
			localStorage.setItem('admin_token', token);
			localStorage.setItem('admin_info', JSON.stringify(adminInfo));
			addDebug('✅ Token已保存到localStorage');

			// 同时保存到sessionStorage（双重保险）
			try {
				sessionStorage.setItem('admin_token', token);
				sessionStorage.setItem('admin_info', JSON.stringify(adminInfo));
				addDebug('✅ Token已保存到sessionStorage（双重保险）');
			} catch (e) {
				addDebug('⚠️ sessionStorage保存失败，忽略');
			}

			// 验证保存成功
			const verifyToken = localStorage.getItem('admin_token');
			if (!verifyToken) {
				throw new Error('保存后无法读取token');
			}
			addDebug('✅ Token保存验证成功');

		} catch (e: any) {
			addDebug(`❌ Token保存失败: ${e.message}`);
			return {
				success: false,
				error: `无法保存登录信息: ${e.message}`,
				debug: debugInfo,
			};
		}

		addDebug('=== 登录流程全部完成 ===');

		return {
			success: true,
			token,
			user: adminInfo,
			debug: debugInfo,
		};

	} catch (e: any) {
		addDebug(`❌ 登录流程异常: ${e.message}`);
		console.error('[增强登录] 异常:', e);
		return {
			success: false,
			error: e.message || '登录失败，请重试',
			debug: debugInfo,
		};
	}
}

/**
 * 创建通用自动登录脚本
 * 可以在任何浏览器的控制台中执行
 */
export function generateAutoLoginScript(email: string, password: string): string {
	return `
// ========== 自动登录脚本 ==========
// 说明：在任何浏览器的控制台中执行此脚本，绕过前端验证

(async function() {
    console.log('=== 开始自动登录 ===');
    
    const email = '${email}';
    const password = '${password}';
    
    try {
        console.log('1. 调用登录API...');
        const loginResp = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });
        
        const loginData = await loginResp.json();
        console.log('登录API响应:', loginData);
        
        if (!loginData.success) {
            throw new Error('登录失败: ' + (loginData.error || '未知错误'));
        }
        
        const token = loginData.data.token;
        console.log('✅ Token获取成功，长度:', token.length);
        
        console.log('2. 验证超级管理员权限...');
        const verifyResp = await fetch('/api/admin/superadmin/verify', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        const verifyData = await verifyResp.json();
        console.log('验证API响应:', verifyData);
        
        if (!verifyData.success) {
            throw new Error('验证失败: ' + (verifyData.error || '未知错误'));
        }
        
        console.log('✅ 超级管理员验证通过');
        
        console.log('3. 保存token...');
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_info', JSON.stringify(verifyData.admin));
        sessionStorage.setItem('admin_token', token);
        sessionStorage.setItem('admin_info', JSON.stringify(verifyData.admin));
        console.log('✅ Token已保存');
        
        console.log('4. 跳转到管理后台...');
        setTimeout(() => {
            window.location.href = '/admin/dashboard';
        }, 500);
        
    } catch (e) {
        console.error('❌ 自动登录失败:', e);
        alert('登录失败: ' + e.message);
    }
})();
`;
}
