'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Clock, AlertCircle, Upload, ArrowLeft, QrCode } from 'lucide-react';
import { BrandIcons } from '@/lib/brandIcons';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'uploading' | 'reviewing' | 'success' | 'failed'>('pending');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [remark, setRemark] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('/微信收款码.png');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    try {
      const orderId = searchParams.get('orderId');
      if (!orderId) {
        router.push('/pricing');
        return;
      }

      const response = await fetch(`/api/payment/${orderId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '加载订单失败');
      }

      const result = await response.json();
      if (result.success) {
        setOrder(result.data);

        if (result.data.paymentStatus === 'PAID') {
          setPaymentStatus('success');
        } else if (result.data.paymentStatus === 'FAILED' || result.data.paymentStatus === 'EXPIRED') {
          setPaymentStatus('failed');
        } else if (result.data.paymentStatus === 'PENDING_REVIEW') {
          setPaymentStatus('reviewing');
          startReviewPolling(orderId);
        }
      }
    } catch (error) {
      console.error('加载订单失败:', error);
      alert('加载订单失败，请刷新重试');
      router.push('/pricing');
    } finally {
      setIsLoading(false);
    }
  };

  const startReviewPolling = (orderId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/${orderId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            if (result.data.paymentStatus === 'PAID') {
              setPaymentStatus('success');
              clearInterval(pollInterval);
            } else if (result.data.paymentStatus === 'FAILED') {
              setPaymentStatus('failed');
              clearInterval(pollInterval);
            }
          }
        }
      } catch (error) {
        console.error('查询审核状态失败:', error);
      }
    }, 5000);

    setTimeout(() => clearInterval(pollInterval), 10 * 60 * 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('仅支持JPG、PNG格式图片');
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('图片大小不能超过5MB');
        return;
      }

      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile || !order) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('orderId', order.id);
      formData.append('proofImage', proofFile);
      formData.append('transactionId', transactionId);
      formData.append('remark', remark);

      const response = await fetch('/api/payment/upload-proof', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '上传失败');
      }

      const result = await response.json();
      if (result.success) {
        setPaymentStatus('reviewing');
        startReviewPolling(order.id);
      } else {
        throw new Error(result.error || '上传失败');
      }
    } catch (error) {
      console.error('上传支付凭证失败:', error);
      alert(error instanceof Error ? error.message : '上传失败，请稍后重试');
    } finally {
      setIsUploading(false);
    }
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
          <Card className="w-full max-w-md">
            <CardBody>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="text-green-600" size={40} />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  支付成功！
                </h2>
                <p className="mt-2 text-gray-600">您的会员已激活</p>
              </div>

              <div className="space-y-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">订单号</span>
                  <span className="font-medium text-gray-900">{order.transactionId || order.id}</span>
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
                  <span className="text-lg font-bold text-green-600">¥{(order.amount / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleBackToPricing}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  返回定价
                </button>
                <button
                  onClick={handleBackToWorkspace}
                  className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 font-semibold text-white hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                  开始使用
                </button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* 待支付 */}
      {paymentStatus === 'pending' && (
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={handleBackToPricing}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回定价页面</span>
            </button>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* 左侧：订单信息 */}
            <Card>
              <CardBody>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">订单信息</h2>

                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-600">套餐类型</span>
                    <span className="font-medium text-gray-900">
                      {order.level === 'BASIC' && '基础版'}
                      {order.level === 'PREMIUM' && '高级版'}
                      {order.level === 'ENTERPRISE' && '企业版'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-600">订单号</span>
                    <span className="font-medium text-gray-900">{order.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-600">创建时间</span>
                    <span className="font-medium text-gray-900">
                      {new Date(order.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div className="pt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-gray-600">支付金额</span>
                      <span className="text-3xl font-bold text-red-600">¥{(order.amount / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* 右侧：扫码支付 */}
            <Card>
              <CardBody>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">扫码支付</h2>

                <div className="mb-6 text-center">
                  <div className="inline-block rounded-2xl bg-white p-4 shadow-lg">
                    <QrCode size={200} className="text-gray-900" />
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    请使用微信扫描上方二维码完成支付
                  </p>
                </div>

                <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">支付说明</p>
                      <ul className="space-y-1 text-yellow-700">
                        <li>• 请在10分钟内完成支付</li>
                        <li>• 支付金额必须与订单金额一致</li>
                        <li>• 支付后请上传转账截图</li>
                        <li>• 审核通过后会员立即生效</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setPaymentStatus('uploading')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 font-semibold text-white hover:from-red-600 hover:to-red-700 transition-all"
                >
                  <Upload size={20} />
                  <span>我已经完成支付</span>
                </button>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* 上传凭证 */}
      {paymentStatus === 'uploading' && (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={() => setPaymentStatus('pending')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回支付页面</span>
            </button>
          </div>

          <Card>
            <CardBody>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">上传支付凭证</h2>

              <div className="space-y-6">
                {/* 上传区域 */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    转账截图 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-xl border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 transition-colors">
                    {previewUrl ? (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="支付凭证预览"
                          className="mx-auto max-h-80 rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setProofFile(null);
                            setPreviewUrl('');
                          }}
                          className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          拖拽图片到此处，或点击选择文件
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          支持JPG、PNG格式，最大5MB
                        </p>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleFileChange}
                          className="absolute inset-0 cursor-pointer opacity-0"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 微信转账单号 */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    微信转账单号
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="请输入微信转账单号（可选）"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* 备注 */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    备注
                  </label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="如有特殊情况，请在此说明（可选）"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* 提交按钮 */}
                <button
                  onClick={handleUploadProof}
                  disabled={!proofFile || isUploading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 font-semibold text-white hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Clock className="h-5 w-5 animate-spin" />
                      <span>上传中...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      <span>提交凭证</span>
                    </>
                  )}
                </button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* 审核中 */}
      {paymentStatus === 'reviewing' && (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardBody>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                  <Clock className="text-yellow-600" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">审核中</h2>
                <p className="mt-2 text-gray-600">
                  您的支付凭证已提交，管理员正在审核
                </p>
              </div>

              <div className="space-y-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">审核时间：1-24小时</p>
                    <p className="text-yellow-700">审核通过后会员立即生效</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  刷新状态
                </button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* 支付失败 */}
      {paymentStatus === 'failed' && (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardBody>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="text-red-600" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">支付失败</h2>
                <p className="mt-2 text-gray-600">
                  支付已超时或被拒绝
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setPaymentStatus('pending')}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  重新支付
                </button>
                <button
                  onClick={handleBackToPricing}
                  className="flex-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 font-semibold text-white hover:from-red-600 hover:to-red-700 transition-all"
                >
                  返回定价
                </button>
              </div>
            </CardBody>
          </Card>
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

import { X } from 'lucide-react';
