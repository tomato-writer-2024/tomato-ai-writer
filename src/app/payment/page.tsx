'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import BrandIcons from '@/lib/brandIcons';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat'>('alipay');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [countdown, setCountdown] = useState(300); // 5分钟倒计时
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrder();
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (paymentStatus === 'pending' && countdown === 0) {
      setPaymentStatus('failed');
    }
  }, [countdown, paymentStatus]);

  const loadOrder = async () => {
    try {
      const orderId = searchParams.get('orderId');
      if (!orderId) {
        router.push('/pricing');
        return;
      }

      // 调用API获取订单信息
      const response = await fetch(`/api/payment/${orderId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '加载订单失败');
      }

      const result = await response.json();
      if (result.success) {
        setOrder({
          ...result.data,
          id: orderId,
          transactionId: result.data.orderId,
        });

        // 检查订单状态
        if (result.data.paymentStatus === 'PAID') {
          setPaymentStatus('success');
        } else if (result.data.paymentStatus === 'FAILED' || result.data.paymentStatus === 'EXPIRED') {
          setPaymentStatus('failed');
        } else {
          // 开始支付轮询
          startPaymentPolling(orderId);
        }
      }
    } catch (error) {
      console.error('加载订单失败:', error);
      router.push('/pricing');
    } finally {
      setIsLoading(false);
    }
  };

  const startPaymentPolling = (orderId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/${orderId}`);
        if (!response.ok) {
          throw new Error('查询支付状态失败');
        }

        const result = await response.json();
        if (result.success && result.data) {
          // 检查订单状态
          if (result.data.paymentStatus === 'PAID') {
            setPaymentStatus('success');
            clearInterval(pollInterval);
          } else if (result.data.paymentStatus === 'FAILED' || result.data.paymentStatus === 'EXPIRED') {
            setPaymentStatus('failed');
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('查询支付状态失败:', error);
      }
    }, 3000); // 每3秒查询一次
  };

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToPricing = () => {
    router.push('/pricing');
  };

  const handleBackToWorkspace = () => {
    router.push('/workspace');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <Clock className="mx-auto animate-spin text-indigo-600" size={40} />
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-600" size={64} />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">订单不存在</h2>
          <button
            onClick={handleBackToPricing}
            className="mt-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            返回定价页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* 支付成功 */}
      {paymentStatus === 'success' && (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md card-shadow">
            <CardBody>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="text-green-600" size={40} />
                </div>
                <h2 className="text-2xl font-bold gradient-text">支付成功！</h2>
                <p className="mt-2 text-gray-600">您的会员已激活</p>
              </div>

              <div className="space-y-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">订单号</span>
                  <span className="font-medium text-gray-900">{order.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">套餐</span>
                  <span className="font-medium text-gray-900">
                    {order.level === 'BASIC' && '基础版'}
                    {order.level === 'PREMIUM' && '高级版'}
                    {order.level === 'ENTERPRISE' && '企业版'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">支付金额</span>
                  <span className="text-lg font-bold gradient-text">¥{(order.amount / 100).toFixed(2)}</span>
                </div>
              </div>

              <GradientButton onClick={handleBackToWorkspace} fullWidth>
                开始使用
              </GradientButton>
            </CardBody>
          </Card>
        </div>
      )}

      {/* 支付失败 */}
      {paymentStatus === 'failed' && (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md card-shadow">
            <CardBody>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="text-red-600" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">支付已超时</h2>
                <p className="mt-2 text-gray-600">订单已失效，请重新下单</p>
              </div>

              <GradientButton onClick={handleBackToPricing} fullWidth>
                重新下单
              </GradientButton>
            </CardBody>
          </Card>
        </div>
      )}

      {/* 待支付 */}
      {paymentStatus === 'pending' && (
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <button
            onClick={handleBackToPricing}
            className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            返回
          </button>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* 左侧：订单信息 */}
            <div>
              <Card className="mb-6">
                <CardBody>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 p-2">
                      <BrandIcons.Membership level={order?.level} size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">订单详情</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">订单号</span>
                      <span className="font-medium text-gray-900">{order.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">套餐</span>
                      <span className="font-medium text-gray-900">
                        {order.level === 'BASIC' && '基础版'}
                        {order.level === 'PREMIUM' && '高级版'}
                        {order.level === 'ENTERPRISE' && '企业版'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">周期</span>
                      <span className="font-medium text-gray-900">
                        {order.billingCycle === 'monthly' ? '月付' : '年付'}
                      </span>
                    </div>
                    <div className="border-t border-gray-200/50 pt-4">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-900">支付金额</span>
                        <span className="text-2xl font-bold gradient-text">
                          ¥{(order.amount / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* 倒计时 */}
              <Card className="card-shadow">
                <CardBody className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <div className="flex items-center gap-3">
                    <Clock size={32} />
                    <div>
                      <p className="text-sm opacity-90">支付剩余时间</p>
                      <p className="text-3xl font-bold">{formatCountdown(countdown)}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* 支付说明 */}
              <Card className="mt-6">
                <CardBody>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-gradient-to-br from-green-100 to-green-200 p-2">
                      <BrandIcons.Quality size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">支付说明</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 text-green-500 flex-shrink-0" size={16} />
                      <span>请使用手机扫码支付，支付成功后自动跳转</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 text-green-500 flex-shrink-0" size={16} />
                      <span>支付有效期为5分钟，超时后需重新下单</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 text-green-500 flex-shrink-0" size={16} />
                      <span>如有问题请联系客服</span>
                    </li>
                  </ul>
                </CardBody>
              </Card>
            </div>

            {/* 右侧：支付方式 */}
            <div>
              <Card>
                <CardBody>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 p-2">
                      <BrandIcons.Export size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">选择支付方式</h3>
                  </div>

                  {/* 支付方式选择 */}
                  <div className="mb-6 space-y-3">
                    <button
                      onClick={() => setPaymentMethod('alipay')}
                      className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all ${
                        paymentMethod === 'alipay'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200/50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2 ${
                          paymentMethod === 'alipay'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <BrandIcons.Export size={20} />
                        </div>
                        <span className="font-medium">支付宝</span>
                      </div>
                      {paymentMethod === 'alipay' && (
                        <div className="h-6 w-6 rounded-full bg-blue-600">
                          <CheckCircle className="m-1 text-white" size={16} />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => setPaymentMethod('wechat')}
                      className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all ${
                        paymentMethod === 'wechat'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200/50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2 ${
                          paymentMethod === 'wechat'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <BrandIcons.Export size={20} />
                        </div>
                        <span className="font-medium">微信支付</span>
                      </div>
                      {paymentMethod === 'wechat' && (
                        <div className="h-6 w-6 rounded-full bg-green-600">
                          <CheckCircle className="m-1 text-white" size={16} />
                        </div>
                      )}
                    </button>
                  </div>

                  {/* 二维码 */}
                  <div className="mb-6 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="h-48 w-48 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">二维码占位</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">请使用{paymentMethod === 'alipay' ? '支付宝' : '微信'}扫码支付</p>
                  </div>

                  {/* 支付金额确认 */}
                  <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4 text-center">
                    <p className="text-sm text-gray-600">支付金额</p>
                    <p className="text-3xl font-bold gradient-text">
                      ¥{(order.amount / 100).toFixed(2)}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">加载中...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
