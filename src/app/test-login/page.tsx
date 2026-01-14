'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestLoginPage() {
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

      addLog('正在发送请求到 /api/auth/login-direct...');
      const response = await fetch('/api/auth/login-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      addLog(`响应状态: ${response.status} ${response.statusText}`);

      const data = await response.json();
      addLog(`响应数据: ${JSON.stringify(data, null, 2)}`);

      if (data.success) {
        addLog('登录成功！');
        addLog(`Token: ${data.data.token.substring(0, 50)}...`);

        // 存储token到localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.data.token);
          addLog('Token已存储到localStorage');
        }

        addLog('正在跳转到 /workspace...');
        setTimeout(() => {
          router.push('/workspace');
        }, 1000);
      } else {
        addLog(`登录失败: ${data.error}`);
      }
    } catch (error) {
      console.error('登录失败:', error);
      addLog(`错误: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">测试登录页面</h1>

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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? '登录中...' : '登录'}
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
                <div key={index} className="border-b border-gray-700 pb-1">
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
          </div>
        </div>

        {/* 检查localStorage */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">LocalStorage</h2>
          <button
            onClick={() => {
              const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
              if (token) {
                addLog(`Token存在: ${token.substring(0, 50)}...`);
              } else {
                addLog('Token不存在');
              }
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            检查Token
          </button>
        </div>
      </div>
    </div>
  );
}
