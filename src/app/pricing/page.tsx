'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: '免费版',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        '每天5次AI生成',
        '基础章节撰写',
        '标准润色功能',
        '无续写功能',
        '无高级评估',
        '无专属客服',
      ],
      cta: '开始使用',
      popular: false,
    },
    {
      name: 'VIP版',
      monthlyPrice: 99,
      yearlyPrice: 89,
      features: [
        '每天50次AI生成',
        '全功能章节撰写',
        '高级润色功能',
        '智能续写',
        '质量评估报告',
        '优先客服支持',
      ],
      cta: '立即订阅',
      popular: true,
    },
    {
      name: 'SVIP版',
      monthlyPrice: 299,
      yearlyPrice: 269,
      features: [
        '无限AI生成',
        '所有VIP功能',
        '专属客服支持',
        '剧情逻辑优化',
        '平台算法优化',
        '数据分析报告',
        '作品诊断服务',
      ],
      cta: '立即订阅',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <span className="text-xl font-bold text-gray-900">番茄AI写作助手</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                登录
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                免费注册
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* 标题区域 */}
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">选择适合你的套餐</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            解锁全部功能，提升创作效率，让AI成为你的创作伙伴
          </p>
        </div>

        {/* 计费周期切换 */}
        <div className="mt-8 flex justify-center">
          <div className="rounded-full bg-white p-1 shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-full px-8 py-2 text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              月付
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`rounded-full px-8 py-2 text-sm font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              年付 <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">省10%</span>
            </button>
          </div>
        </div>

        {/* 定价卡片 */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 shadow-lg transition-all ${
                plan.popular
                  ? 'scale-105 border-2 border-blue-600 bg-white'
                  : 'border border-gray-200 bg-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white">
                    最受欢迎
                  </span>
                </div>
              )}

              <h3 className="mb-2 text-xl font-bold text-gray-900">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ¥{billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                </span>
                <span className="text-gray-600">/{billingCycle === 'monthly' ? '月' : '月'}</span>
              </div>

              <ul className="mb-8 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-0.5 text-green-600">✓</span>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/workspace"
                className={`block w-full rounded-lg py-3 text-center font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* 功能对比 */}
        <div className="mt-24">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">功能对比</h2>
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">功能</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">免费版</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">VIP版</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">SVIP版</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">AI生成次数/天</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">5次</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">50次</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">无限</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">章节撰写</td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600">✓</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600">✓</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600">✓</span></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">精修润色</td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600">✓</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600">✓</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600">✓</span></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">智能续写</td>
                  <td className="px-6 py-4 text-center"><span className="text-gray-400">✗</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600">✓</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600">✓</span></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">质量评估报告</td>
                  <td className="px-6 py-4 text-center"><span className="text-gray-400">✗</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600">✓</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600">✓</span></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">剧情逻辑优化</td>
                  <td className="px-6 py-4 text-center"><span className="text-gray-400">✗</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-gray-400">✗</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600">✓</span></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">平台算法优化</td>
                  <td className="px-6 py-4 text-center"><span className="text-gray-400">✗</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-gray-400">✗</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600">✓</span></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">专属客服支持</td>
                  <td className="px-6 py-4 text-center"><span className="text-gray-400">✗</span></td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">优先</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">专属</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 常见问题 */}
        <div className="mt-24">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">常见问题</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-2 font-semibold text-gray-900">免费版能用多久？</h3>
              <p className="text-gray-600">
                免费版永久免费，适合体验产品功能。如需更多功能，可以升级到VIP或SVIP版本。
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-2 font-semibold text-gray-900">如何支付？</h3>
              <p className="text-gray-600">
                支持微信支付、支付宝等多种支付方式，安全便捷。
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-2 font-semibold text-gray-900">可以退款吗？</h3>
              <p className="text-gray-600">
                支持7天无理由退款。如有疑问，请联系客服。
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-2 font-semibold text-gray-900">可以随时取消订阅吗？</h3>
              <p className="text-gray-600">
                可以，您可以在账户设置中随时取消订阅，取消后将在当前周期结束后停止服务。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="mt-24 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 番茄AI写作助手. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
