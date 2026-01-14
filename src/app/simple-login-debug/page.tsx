'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SimpleLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('208343256@qq.com');
  const [password, setPassword] = useState('TomatoAdmin@2024');
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogs([]);
    setIsLoading(true);

    try {
      addLog('开始登录流程...');
      addLog(`邮箱: ${email}`);
      addLog(`密码: ${password.replace(/./g, '*')}`);

      // 使用简化版API（不使用中间件）
      addLog('正在发送请求到 /api/auth/login-simple...');
      const response = await fetch('/api/auth/login-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      addLog(`响应状态: ${response.status} ${response.statusText}`);
      addLog(`响应类型: ${response.headers.get('content-type')}`);

      // 检查响应是否存在
      const text = await response.text();
      addLog(`响应内容（原始）: ${text.substring(0, 200)}...`);

      if (!text) {
        addLog('❌ 错误: API返回了空响应');
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        addLog(`❌ JSON解析失败: ${parseError}`);
        return;
      }

      addLog(`解析后的数据: ${JSON.stringify(data, null, 2)}`);

      if (data.success) {
        addLog('✅ 登录成功！');
        addLog(`Token: ${data.data.token.substring(0, 50)}...`);

        // 存储token到localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          addLog('✅ Token已存储到localStorage');
        }

        addLog('正在跳转到 /admin/dashboard...');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1000);
      } else {
        addLog(`❌ 登录失败: ${data.error}`);
      }
    } catch (error) {
      console.error('登录失败:', error);
      addLog(`❌ 错误: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">简化登录页面（调试用）</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 登录表单 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">登录表单</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '登录中...' : '登录（使用简化API）'}
              </button>
            </form>
          </div>

          {/* 日志输出 */}
          <div className="bg-gray-900 text-green-400 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">日志</h2>
              <button
                onClick={() => setLogs([])}
                className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
              >
                清空
              </button>
            </div>
            <div className="space-y-2 font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 && <p className="text-gray-500">等待登录...</p>}
              {logs.map((log, index) => (
                <div key={index} className="border-b border-gray-700 pb-1 break-words">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">快捷操作</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setEmail('208343256@qq.com');
                setPassword('TomatoAdmin@2024');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              填入管理员账号
            </button>
            <button
              onClick={() => {
                setLogs([]);
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              清空日志
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const token = localStorage.getItem('token');
                  const user = localStorage.getItem('user');
                  if (token) {
                    addLog(`Token存在: ${token.substring(0, 50)}...`);
                  }
                  if (user) {
                    addLog(`用户信息: ${user}`);
                  }
                }
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              检查LocalStorage
            </button>
          </div>
        </div>

        {/* 说明 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">说明</h2>
          <ul className="list-disc list-inside space-y-2 text-yellow-700">
            <li>此页面使用简化版API：<code>/api/auth/login-simple</code></li>
            <li>简化API不使用任何中间件，直接返回响应</li>
            <li>如果简化API可以正常登录，说明原始API的中间件有问题</li>
            <li>登录成功后会自动跳转到：<code>/admin/dashboard</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
