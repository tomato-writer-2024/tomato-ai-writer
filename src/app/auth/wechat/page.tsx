'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, User, Mail, Shield } from 'lucide-react';

export default function WechatAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri') || '/workspace';

  const [isLoading, setIsLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const handleAuth = async (authorized: boolean) => {
    if (!authorized) {
      // 拒绝授权，返回登录页
      router.push('/login');
      return;
    }

    // 同意授权，跳转到回调页面
    setIsLoading(true);

    try {
      // 模拟授权成功，跳转到回调页面
      setTimeout(() => {
        const callbackUrl = `/auth/wechat/callback?code=${encodeURIComponent('mock_wechat_code')}&state=${encodeURIComponent(redirectUri)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        router.push(callbackUrl);
      }, 500);
    } catch (error) {
      console.error('微信授权失败:', error);
      alert('微信授权失败，请稍后重试');
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
            className="text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 truncate">申请获取你的公开信息（昵称、头像）</h1>
        </div>
      </div>

      {/* 模拟微信授权页面 */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                <CheckCircle className="text-white" size={32} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 mb-2 break-words">
                番茄AI写作助手 申请获得
              </h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                登录后可使用AI辅助创作、智能续写、精修润色等功能
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 text-sm sm:text-base break-words">获得你的公开信息（昵称、头像）</div>
                    <div className="text-sm text-gray-600">用于展示用户信息</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Shield className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 text-sm sm:text-base break-words">账号安全保护</div>
                    <div className="text-sm text-gray-600">用于账号安全和找回</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 模拟用户信息展示 */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                微
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 break-words">微信用户</div>
                <div className="text-sm text-gray-500 break-words">wx_user_123456</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Mail size={16} />
                <span>邮箱</span>
              </div>
              <div className="text-gray-900 font-medium break-words">wx_user@example.com</div>
            </div>
          </div>
        </div>

        {/* 模拟应用信息 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">关于番茄AI写作助手</h3>
            <button
              onClick={() => setShowDetail(!showDetail)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              {showDetail ? '收起' : '展开'}
            </button>
          </div>
          {showDetail && (
            <>
              <p className="text-gray-600 text-sm mb-4">
                专为番茄小说平台打造的AI辅助写作工具，提供50+细分生成器、百万级素材库、多平台适配等功能，帮助小说创作者快速生成符合平台风格的爆款爽文内容。
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">工具类应用</span>
                <span className="bg-gray-100 px-2 py-1 rounded">番茄AI团队</span>
                <span className="bg-gray-100 px-2 py-1 rounded">v1.0.0</span>
              </div>
            </>
          )}
          {!showDetail && (
            <p className="text-gray-600 text-sm">
              专为番茄小说平台打造的AI辅助写作工具
            </p>
          )}
        </div>

        {/* 底部操作按钮 */}
        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={() => handleAuth(false)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 sm:px-6 py-3 sm:py-4 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
          >
            <XCircle size={18} />
            拒绝
          </button>
          <button
            onClick={() => handleAuth(true)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 sm:px-6 py-3 sm:py-4 font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
          >
            <CheckCircle size={18} />
            {isLoading ? '授权中...' : '同意'}
          </button>
        </div>

        {/* 底部提示 */}
        <div className="mt-6 text-center text-xs text-gray-500 px-2">
          授权即表示你同意《用户协议》和《隐私政策》
        </div>
      </div>
    </div>
  );
}
