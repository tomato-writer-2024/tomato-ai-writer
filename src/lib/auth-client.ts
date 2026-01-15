// ============================================================================
// 客户端Token管理（仅用于浏览器环境）
// ============================================================================

/**
 * 存储Token到localStorage
 */
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

/**
 * 获取Token
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

/**
 * 删除Token（登出）
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// ============================================================================
// authClient - 统一的客户端认证接口
// ============================================================================

interface User {
	id: string;
	email: string;
	username?: string;
	role: string;
	membershipLevel: string;
}

const authClient = {
	/**
	 * 获取当前登录用户
	 */
	async getCurrentUser(): Promise<User | null> {
		const token = getToken();
		if (!token) {
			return null;
		}

		try {
			const response = await fetch('/api/auth/me', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				return null;
			}

			const data = await response.json();
			return data.user || null;
		} catch (error) {
			console.error('获取用户信息失败:', error);
			return null;
		}
	},

	/**
	 * 登出
	 */
	async logout(): Promise<void> {
		removeToken();
		window.location.href = '/login';
	},

	/**
	 * 检查是否已登录
	 */
	isAuthenticated(): boolean {
		return isAuthenticated();
	},

	/**
	 * 获取Token
	 */
	getToken(): string | null {
		return getToken();
	},
};

export { authClient };
