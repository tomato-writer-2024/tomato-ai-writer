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

  const handleConfirmPayment = async () => {
    if (!order) return;

    try {
      const response = await fetch(`/api/payment/${order.transactionId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '确认支付失败');
      }

      const result = await response.json();
      if (result.success) {
        alert('支付确认成功！系统正在开通会员服务，请稍候...');
      } else {
        throw new Error(result.error || '确认支付失败');
      }
    } catch (error) {
      console.error('确认支付失败:', error);
      alert(error instanceof Error ? error.message : '确认支付失败，请稍后重试');
    }
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
                      <span>请使用微信扫描右侧二维码支付，支付成功后系统将自动确认订单</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 text-green-500 flex-shrink-0" size={16} />
                      <span>支付有效期为5分钟，超时后需重新下单</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 text-green-500 flex-shrink-0" size={16} />
                      <span>如有问题请联系客服，支付成功后会员立即生效</span>
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
                    <h3 className="text-lg font-bold text-gray-900">微信支付</h3>
                  </div>

                  {/* 微信支付说明 */}
                  <div className="mb-6 rounded-xl bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <BrandIcons.Quality size={20} className="mt-0.5 text-green-600 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium text-gray-900 mb-1">个人开发者收款</p>
                        <p>本人为个人开发者，使用个人微信收款码收款。支付成功后系统将自动确认订单并开通会员服务。</p>
                      </div>
                    </div>
                  </div>

                  {/* 二维码 */}
                  <div className="mb-6 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
                    <div className="mb-4 flex justify-center">
                      <img
                        src="/wechat-qr-code.png"
                        alt="微信收款码"
                        className="h-48 w-48 rounded-lg object-contain"
                      />
                    </div>
                    <p className="text-sm text-gray-600">请使用微信扫码支付</p>
                    <p className="mt-2 text-xs text-orange-600 font-medium">
                      扫码支付后，点击下方按钮确认支付
                    </p>
                  </div>

                  {/* 确认支付按钮 */}
                  <Button
                    variant="outline"
                    icon={<CheckCircle size={18} />}
                    fullWidth
                    className="mb-4"
                    onClick={() => handleConfirmPayment()}
                  >
                    我已完成支付，确认开通会员
                  </Button>

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
