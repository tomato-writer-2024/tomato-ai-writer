'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KeyRound, Mail, ArrowLeft, Zap, CheckCircle } from 'lucide-react';
import BrandIcons from '@/lib/brandIcons';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('请输入邮箱地址');
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('邮箱格式不正确');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
      } else {
        setError(data.error || '发送失败，请稍后重试');
      }
    } catch (error) {
      console.error('发送失败:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="w-full max-w-md px-4">
          <Link href="/" className="mb-8 flex items-center justify-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
              <BrandIcons.Logo size={28} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              番茄AI写作助手
            </span>
          </Link>

          <div className="rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                <CheckCircle className="text-green-600" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">邮件已发送</h2>
              <p className="mt-2 text-gray-600">
                我们已向 <span className="font-semibold text-indigo-600">{email}</span> 发送了密码重置邮件
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                <p className="font-semibold mb-2">下一步：</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>检查您的邮箱（包括垃圾邮件文件夹）</li>
                  <li>点击邮件中的重置密码链接</li>
                  <li>输入新密码完成重置</li>
                </ol>
              </div>

              <p className="text-sm text-gray-500 text-center">
                邮件有效期为 30 分钟，请尽快完成重置
              </p>

              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-semibold text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                >
                  返回登录
                </Link>
              </div>

              <div className="pt-4 text-center">
                <p className="text-sm text-gray-600">
                  没有收到邮件？{' '}
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    重新发送
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="w-full max-w-md px-4">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
            <BrandIcons.Logo size={28} />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            番茄AI写作助手
          </span>
        </Link>

        <div className="rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 mb-4">
              <KeyRound className="text-indigo-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">忘记密码</h2>
            <p className="mt-2 text-gray-600">输入您的邮箱，我们将发送重置链接</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 pl-10 pr-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-semibold text-white hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <Zap className="animate-spin" size={20} />
                  发送中...
                </>
              ) : (
                <>
                  <Mail size={20} />
                  发送重置链接
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft size={16} />
              返回登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
