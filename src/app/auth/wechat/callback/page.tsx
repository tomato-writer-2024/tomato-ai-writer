'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

export default function WechatCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isProcessingRef = useRef(false);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在处理微信授权...');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // 防止重复执行
    if (isProcessingRef.current) {
      return;
    }

    const handleWechatCallback = async () => {
      isProcessingRef.current = true;

      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const redirectUri = searchParams.get('redirect_uri') || '/workspace';

      console.log('[微信登录回调] 开始处理', {
        code: code ? '已接收' : '未接收',
        redirectUri,
      });

      if (!code) {
        setStatus('error');
        setMessage('未收到授权码，请重新登录');
        console.error('[微信登录回调] 缺少授权码');
        return;
      }

      try {
        console.log('[微信登录回调] 正在调用API...');
        const response = await fetch('/api/auth/wechat-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        console.log('[微信登录回调] API响应', {
          success: data.success,
          hasData: !!data.data,
        });

        if (data.success && data.data) {
          setStatus('success');
          setMessage('微信登录成功！正在跳转到工作台...');

          try {
            // 保存token和用户信息
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            console.log('[微信登录回调] Token保存成功，准备跳转到', redirectUri);

            // 跳转到目标页面（增加时间让用户看到成功状态）
            setTimeout(() => {
              console.log('[微信登录回调] 开始跳转到', redirectUri);
              router.push(redirectUri);
            }, 3000);
          } catch (storageError) {
            console.error('[微信登录回调] 保存token失败:', storageError);
            setStatus('error');
            setMessage('保存登录信息失败，请清除浏览器缓存后重试');
          }
        } else {
          setStatus('error');
          setMessage(data.error || '微信登录失败，请稍后重试');
          console.error('[微信登录回调] 登录失败', data.error);
        }
      } catch (error) {
        console.error('[微信登录回调] 网络错误:', error);
        setStatus('error');
        setMessage('网络错误，请检查网络连接后重试');
      }
    };

    handleWechatCallback();
  }, [searchParams, router]);

  const handleRetry = () => {
    isProcessingRef.current = false;
    setStatus('loading');
    setMessage('正在重新处理微信授权...');
  };

  const handleReturn = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 状态卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Loader2 className="text-green-500 animate-spin" size={64} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-green-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
                    </svg>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">微信授权中</h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-xs text-gray-400 mt-2">请稍候，正在处理您的登录请求...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <CheckCircle className="text-green-500" size={64} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-green-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
                    </svg>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">登录成功</h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-xs text-gray-400 mt-2">即将跳转到工作台...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <XCircle className="text-red-500" size={64} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-red-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">登录失败</h2>
              <p className="text-gray-600 mb-4">{message}</p>

              {/* 错误详情 */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mb-4 text-sm text-green-600 hover:text-green-700 font-medium"
              >
                {showDetails ? '隐藏' : '查看'}错误详情
              </button>

              {showDetails && (
                <div className="bg-red-50 rounded-lg p-4 mb-4 text-left">
                  <h3 className="text-sm font-semibold text-red-700 mb-2">故障排查：</h3>
                  <ul className="text-xs text-red-600 space-y-1">
                    <li>• 确认微信授权已成功完成</li>
                    <li>• 检查网络连接是否正常</li>
                    <li>• 清除浏览器缓存和Cookie后重试</li>
                    <li>• 如果问题持续，请使用邮箱密码登录</li>
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw size={20} />
                  重试
                </button>
                <button
                  onClick={handleReturn}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <AlertCircle size={20} />
                  返回登录
                </button>
              </div>
            </>
          )}
        </div>

        {/* 页脚 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© 2024 番茄小说AI · 让创作更简单</p>
        </div>
      </div>
    </div>
  );
}
