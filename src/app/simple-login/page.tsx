'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function SimpleLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatus({ type: 'error', message: '请填写完整信息' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: 'info', message: '正在登录...' });

    try {
      // 1. 测试登录API
      console.log('[Step 1] 调用登录API...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('[Step 1] 登录API响应:', data);

      if (data.success) {
        setStatus({ type: 'success', message: '登录成功！正在跳转...' });

        // 2. 存储token
        console.log('[Step 2] 存储token到localStorage...');
        if (data.data && data.data.token) {
          localStorage.setItem('token', data.data.token);
          console.log('[Step 2] Token已存储');
        }

        // 3. 测试API认证
        console.log('[Step 3] 测试API认证...');
        await new Promise(resolve => setTimeout(resolve, 500));
        const statsResponse = await fetch('/api/user/stats', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.data.token}`,
          },
        });
        console.log('[Step 3] API认证响应状态:', statsResponse.status);

        if (statsResponse.ok) {
          console.log('[Step 3] API认证成功');
          setStatus({ type: 'success', message: '登录成功！跳转到工作台...' });

          // 4. 跳转到workspace
          console.log('[Step 4] 跳转到 /workspace');
          setTimeout(() => {
            router.push('/workspace');
          }, 500);
        } else {
          console.log('[Step 3] API认证失败');
          setStatus({
            type: 'error',
            message: `登录成功但API认证失败 (HTTP ${statsResponse.status})，请检查控制台`
          });
        }
      } else {
        console.log('[Step 1] 登录API失败:', data.error);
        setStatus({ type: 'error', message: '登录失败: ' + data.error });
      }
    } catch (error) {
      console.error('登录失败:', error);
      setStatus({ type: 'error', message: '网络错误，请检查控制台' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">简单登录测试</h1>
            <p className="text-gray-600 text-sm">用于诊断登录和认证问题</p>
          </div>

          {/* 状态提示 */}
          {status.type && (
            <div className={`mb-6 rounded-lg p-4 flex items-start gap-3 ${
              status.type === 'success' ? 'bg-green-50 text-green-700' :
              status.type === 'error' ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {status.type === 'success' && <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
              {status.type === 'error' && <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
              {status.type === 'info' && <div className="h-5 w-5 flex-shrink-0 mt-0.5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />}
              <div className="flex-1">
                <p className="text-sm font-medium">{status.message}</p>
              </div>
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 pl-10 pr-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  placeholder="208343256@qq.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 pl-10 pr-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  placeholder="TomatoAdmin@2024"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-semibold text-white hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  登录中...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  登录
                </>
              )}
            </button>
          </form>

          {/* 说明 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">诊断步骤：</p>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>调用登录API</li>
              <li>存储token到localStorage</li>
              <li>测试API认证（/api/user/stats）</li>
              <li>跳转到 /workspace</li>
            </ol>
            <p className="text-xs text-gray-500 mt-2">请打开浏览器控制台（F12）查看详细日志</p>
          </div>

          {/* 快捷链接 */}
          <div className="mt-4 flex flex-col gap-2">
            <a
              href="/"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              返回首页
            </a>
            <a
              href="/test-deployment"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              测试部署状态
            </a>
            <a
              href="/login"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              正式登录页面
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
