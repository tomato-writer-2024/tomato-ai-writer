'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';
import { BrandIcons } from '@/lib/brandIcons';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import Navigation from '@/components/Navigation';
import { Badge } from '@/components/Badge';

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const handleSubscribe = async (level: string, cycle: 'monthly' | 'yearly') => {
    setIsCreatingOrder(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          billingCycle: cycle,
          paymentMethod: 'wechat', // 微信支付
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '创建订单失败');
      }

      const result = await response.json();
      if (result.success) {
        // 跳转到支付页面
        router.push(`/payment?orderId=${result.data.orderId}`);
      } else {
        throw new Error(result.error || '创建订单失败');
      }
    } catch (error) {
      console.error('创建订单失败:', error);
      alert(error instanceof Error ? error.message : '创建订单失败，请稍后重试');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const plans = [
    {
      name: '免费版',
      level: 'FREE',
      icon: <BrandIcons.Membership level="FREE" size={24} />,
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        '每天5次AI生成',
        '每月100次AI生成',
        '基础章节撰写',
        '标准润色功能',
        '单次生成2000字',
        '100MB存储空间',
        'TXT格式导出',
      ],
      cta: '开始使用',
      popular: false,
    },
    {
      name: '基础版',
      level: 'BASIC',
      icon: <BrandIcons.Membership level="BASIC" size={24} />,
      monthlyPrice: 29,
      yearlyPrice: 22,
      features: [
        '每天30次AI生成',
        '每月500次AI生成',
        '全功能章节撰写',
        '高级润色功能',
        '单次生成3000字',
        '500MB存储空间',
        'TXT、DOCX格式导出',
        '批量处理（最多5章）',
        '邮件客服支持',
      ],
      cta: '立即订阅',
      popular: false,
    },
    {
      name: '高级版',
      level: 'PREMIUM',
      icon: <BrandIcons.Membership level="PREMIUM" size={24} />,
      monthlyPrice: 99,
      yearlyPrice: 89,
      features: [
        '无限AI生成',
        '全功能章节撰写',
        '高级润色功能',
        '智能续写',
        '单次生成5000字',
        '5GB存储空间',
        'TXT、DOCX、PDF格式导出',
        '批量处理（最多20章）',
        '原创性检测',
        '质量评估报告',
        '优先客服支持',
      ],
      cta: '立即订阅',
      popular: true,
    },
    {
      name: '企业版',
      level: 'ENTERPRISE',
      icon: <BrandIcons.Membership level="ENTERPRISE" size={24} />,
      monthlyPrice: 299,
      yearlyPrice: 269,
      features: [
        '无限AI生成',
        '所有高级功能',
        '单次生成10000字',
        '50GB存储空间',
        '专属客服支持',
        '剧情逻辑优化',
        '平台算法优化',
        '数据分析报告',
        '作品诊断服务',
        'API接口访问',
        '子账号管理（最多10个）',
        '批量处理（最多100章）',
      ],
      cta: '立即订阅',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* 标题区域 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full mb-6">
            <BrandIcons.Crown size={20} className="text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">选择适合你的创作套餐</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl gradient-text">
            解锁全部功能，提升创作效率
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            让AI成为你的创作伙伴，打造爆款爽文，实现签约梦想
          </p>
        </div>

        {/* 计费周期切换 */}
        <div className="mt-12 flex justify-center">
          <div className="rounded-full bg-white p-1 shadow-md">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BrandIcons.Zap size={18} />
              月付
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BrandIcons.Sparkles size={18} />
              年付 <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 font-semibold">省10%</span>
            </button>
          </div>
        </div>

        {/* 定价卡片 */}
        <div className="mt-16 grid gap-8 md:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              hover={!plan.popular}
              gradient={plan.popular}
              className={`${plan.popular ? 'scale-105 shadow-2xl' : ''}`}
            >
              <CardBody>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
                      <BrandIcons.Sparkles size={16} />
                      最受欢迎
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    plan.popular
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      : 'bg-gradient-to-br from-gray-100 to-gray-200'
                  }`}>
                    <div className={plan.popular ? 'text-white' : 'text-gray-600'}>
                      {plan.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold gradient-text">
                    ¥{billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                  </span>
                  <span className="text-gray-600">/{billingCycle === 'monthly' ? '月' : '月'}</span>
                </div>

                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 text-green-500">
                        <Check size={18} />
                      </span>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.level === 'FREE' ? (
                  <Button variant="secondary" icon={<BrandIcons.Zap size={18} />} fullWidth onClick={() => router.push('/workspace')}>
                    {plan.cta}
                  </Button>
                ) : plan.popular ? (
                  <GradientButton icon={<BrandIcons.Zap size={18} />} fullWidth onClick={() => handleSubscribe(plan.level, billingCycle)}>
                    {plan.cta}
                  </GradientButton>
                ) : (
                  <Button variant="secondary" icon={<BrandIcons.Zap size={18} />} fullWidth onClick={() => handleSubscribe(plan.level, billingCycle)}>
                    {plan.cta}
                  </Button>
                )}
              </CardBody>
            </Card>
          ))}
        </div>

        {/* 功能对比 */}
        <div className="mt-24">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full mb-4">
              <BrandIcons.Stats size={20} className="text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">功能对比</span>
            </div>
            <h2 className="text-3xl font-bold gradient-text">选择最适合你的方案</h2>
          </div>
          <Card>
            <CardBody className="p-0 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">功能</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">免费版</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">基础版</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">高级版</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">企业版</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">AI生成次数/天</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">5次</td>
                    <td className="px-6 py-4 text-center text-sm text-indigo-600 font-semibold">30次</td>
                    <td className="px-6 py-4 text-center text-sm text-indigo-600 font-semibold">无限</td>
                    <td className="px-6 py-4 text-center text-sm text-indigo-600 font-semibold">无限</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">章节撰写</td>
                    <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                    <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                    <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                    <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">精修润色</td>
                    <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                    <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                    <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                    <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">智能续写</td>
                    <td className="px-6 py-4 text-center text-gray-400">—</td>
                    <td className="px-6 py-4 text-center text-gray-400">—</td>
                    <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                    <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">质量评估</td>
                    <td className="px-6 py-4 text-center text-gray-400">—</td>
                    <td className="px-6 py-4 text-center text-gray-400">—</td>
                    <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                    <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">专属客服</td>
                    <td className="px-6 py-4 text-center text-gray-400">—</td>
                    <td className="px-6 py-4 text-center text-gray-400">—</td>
                    <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                    <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                  </tr>
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
