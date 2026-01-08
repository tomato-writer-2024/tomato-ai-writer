'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Check,
  X,
  ChevronRight,
  Crown,
  Sparkles,
  Zap,
  Star,
  TrendingUp
} from 'lucide-react';
import BrandIcons from '@/lib/brandIcons';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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
      {/* 导航栏 */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
                <BrandIcons.Logo size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                番茄AI写作助手
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                <Zap size={18} />
                登录
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <Sparkles size={18} />
                免费注册
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* 标题区域 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full mb-6">
            <Crown className="text-indigo-600" size={20} />
            <span className="text-sm font-medium text-indigo-700">选择适合你的创作套餐</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
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
              <Zap size={18} />
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
              <Star size={18} />
              年付 <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 font-semibold">省10%</span>
            </button>
          </div>
        </div>

        {/* 定价卡片 */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 shadow-lg transition-all duration-300 ${
                plan.popular
                  ? 'scale-105 border-2 border-indigo-500 bg-white shadow-2xl'
                  : 'border border-gray-200 bg-white hover:shadow-2xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
                    <Sparkles size={16} />
                    最受欢迎
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${
                  plan.popular
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                    : 'bg-gray-100'
                }`}>
                  <div className={plan.popular ? 'text-white' : 'text-gray-600'}>
                    {plan.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ¥{billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                </span>
                <span className="text-gray-600">/{billingCycle === 'monthly' ? '月' : '月'}</span>
              </div>

              <ul className="mb-8 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className={`mt-0.5 flex-shrink-0 ${
                      feature.startsWith('无') ? 'text-gray-400' : 'text-green-500'
                    }`}>
                      {feature.startsWith('无') ? <X size={18} /> : <Check size={18} />}
                    </span>
                    <span className={`text-sm ${feature.startsWith('无') ? 'text-gray-400' : 'text-gray-600'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/workspace"
                className={`block w-full flex items-center justify-center gap-2 rounded-lg py-3 text-center font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:scale-105'
                    : 'border-2 border-gray-200 text-gray-700 hover:border-indigo-500 hover:bg-indigo-50'
                }`}
              >
                {plan.cta}
                <ChevronRight size={18} />
              </Link>
            </div>
          ))}
        </div>

        {/* 功能对比 */}
        <div className="mt-24">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">功能对比</h2>
          <div className="overflow-x-auto rounded-2xl bg-white shadow-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">功能</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">免费版</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">高级版</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">企业版</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">AI生成次数/天</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">5次</td>
                  <td className="px-6 py-4 text-center text-sm text-indigo-600 font-semibold">50次</td>
                  <td className="px-6 py-4 text-center text-sm text-indigo-600 font-semibold">无限</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">章节撰写</td>
                  <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                  <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                  <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">精修润色</td>
                  <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                  <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                  <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">智能续写</td>
                  <td className="px-6 py-4 text-center"><X className="text-gray-400 mx-auto" size={20} /></td>
                  <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                  <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">质量评估</td>
                  <td className="px-6 py-4 text-center"><X className="text-gray-400 mx-auto" size={20} /></td>
                  <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                  <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">专属客服</td>
                  <td className="px-6 py-4 text-center"><X className="text-gray-400 mx-auto" size={20} /></td>
                  <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                  <td className="px-6 py-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
