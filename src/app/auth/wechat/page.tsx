'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, User, Mail } from 'lucide-react';

export default function WechatAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri') || '/workspace';

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 模拟微信授权页面的加载
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleAuth = async (authorized: boolean) => {
    if (!authorized) {
      // 拒绝授权，返回登录页
      router.push('/login');
      return;
    }

    // 模拟授权成功
    setIsLoading(true);

    try {
      // 调用微信登录API
      const response = await fetch('/api/auth/wechat-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'mock_wechat_code',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 保存token到localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // 跳转到目标页面
        router.push(redirectUri);
      } else {
        alert('微信登录失败: ' + data.error);
        router.push('/login');
      }
    } catch (error) {
      console.error('微信登录失败:', error);
      alert('微信登录失败，请稍后重试');
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* 模拟微信顶部栏 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">申请获取你的公开信息（昵称、头像）</h1>
        </div>
      </div>

      {/* 模拟微信授权页面 */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="text-white" size={32} />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                番茄AI写作助手 申请获得
              </h2>
              <p className="text-gray-600 mb-4">
                登录后可使用AI辅助创作、智能续写、精修润色等功能
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <div className="font-medium text-gray-900">获得你的公开信息（昵称、头像）</div>
                    <div className="text-sm text-gray-600">用于展示用户信息</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <div className="font-medium text-gray-900">获得你的手机号</div>
                    <div className="text-sm text-gray-600">用于账号安全和找回</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 模拟用户信息展示 */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                微
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">微信用户</div>
                <div className="text-sm text-gray-500">wx_user_123456</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Mail size={16} />
                <span>邮箱</span>
              </div>
              <div className="text-gray-900 font-medium">wx_user@example.com</div>
            </div>
          </div>
        </div>

        {/* 模拟应用信息 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">关于番茄AI写作助手</h3>
          <p className="text-gray-600 text-sm mb-4">
            专为番茄小说平台打造的AI辅助写作工具，提供50+细分生成器、百万级素材库、多平台适配等功能，帮助小说创作者快速生成符合平台风格的爆款爽文内容。
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>类型：工具类应用</span>
            <span>•</span>
            <span>开发者：番茄AI团队</span>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="flex gap-4">
          <button
            onClick={() => handleAuth(false)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-6 py-4 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <XCircle size={20} />
            拒绝
          </button>
          <button
            onClick={() => handleAuth(true)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-4 font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            <CheckCircle size={20} />
            {isLoading ? '授权中...' : '同意'}
          </button>
        </div>

        {/* 底部提示 */}
        <div className="mt-6 text-center text-xs text-gray-500">
          授权即表示你同意《用户协议》和《隐私政策》
        </div>
      </div>
    </div>
  );
}
