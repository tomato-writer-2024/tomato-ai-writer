import Link from 'next/link';
import type { Metadata } from "next";
import {
  PenTool,
  Sparkles,
  Brain,
  Zap,
  TrendingUp,
  Check,
  X,
  BookOpen,
  Crown
} from 'lucide-react';

export const metadata: Metadata = {
  title: "番茄小说AI辅助写作工具 - 智能创作助手",
  description: "专为番茄小说平台打造的AI辅助写作工具，帮助小说创作者快速生成符合番茄平台风格的爆款爽文内容",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
                <BookOpen className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                番茄AI写作助手
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                <Zap size={18} />
                登录
              </Link>
              <Link href="/register" className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg">
                <Sparkles size={18} />
                免费注册
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full mb-8">
            <Sparkles className="text-indigo-600" size={20} />
            <span className="text-sm font-medium text-indigo-700">AI智能创作，爆款出圈</span>
          </div>
          <h1 className="mb-6 text-5xl font-bold text-gray-900 sm:text-6xl">
            AI辅助创作，写出
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              爆款爽文
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-lg text-gray-600 leading-relaxed">
            专为番茄小说平台打造，智能识别爽点、优化剧情逻辑、自动分章润色。
            让日更15,000字成为可能，签约成功率提升至80%以上！
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/workspace"
              className="group flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <PenTool size={22} />
              开始创作
              <Sparkles className="group-hover:animate-pulse" size={22} />
            </Link>
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-indigo-500 px-8 py-4 text-lg font-semibold text-indigo-700 hover:bg-indigo-50 transition-all"
            >
              <Crown size={22} />
              查看定价
            </Link>
          </div>
        </div>

        {/* 功能展示 */}
        <div className="mt-24 grid gap-8 md:grid-cols-3">
          <div className="group rounded-xl bg-white p-8 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform">
              <PenTool className="text-white" size={32} />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">智能章节撰写</h3>
            <p className="text-gray-600 leading-relaxed">
              完读率潜力计算、爽点密度控制、自动分章系统，每章都符合番茄标准
            </p>
          </div>
          <div className="group rounded-xl bg-white p-8 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg group-hover:scale-110 transition-transform">
              <Sparkles className="text-white" size={32} />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">精修润色工坊</h3>
            <p className="text-gray-600 leading-relaxed">
              网感增强、爽点放大、冗余修剪，让文字更具冲击力和感染力
            </p>
          </div>
          <div className="group rounded-xl bg-white p-8 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-orange-600 shadow-lg group-hover:scale-110 transition-transform">
              <Brain className="text-white" size={32} />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">智能续写大脑</h3>
            <p className="text-gray-600 leading-relaxed">
              剧情逻辑锚点、多分支剧情生成、风格一致性保障，告别逻辑混乱
            </p>
          </div>
        </div>

        {/* 数据展示 */}
        <div className="mt-24 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-12 text-white shadow-2xl">
          <h2 className="mb-8 text-center text-3xl font-bold">核心优势</h2>
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold">15k+</div>
              <div className="text-lg text-white/90">日更字数</div>
              <div className="mt-2 text-sm text-white/70">AI智能生成</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold">80%</div>
              <div className="text-lg text-white/90">签约成功率</div>
              <div className="mt-2 text-sm text-white/70">质量保障</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold">60%</div>
              <div className="text-lg text-white/90">首章完读率</div>
              <div className="mt-2 text-sm text-white/70">爆款潜力</div>
            </div>
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <span className="text-5xl font-bold">3x</span>
                <TrendingUp size={40} />
              </div>
              <div className="text-lg text-white/90">推荐量增长</div>
              <div className="mt-2 text-sm text-white/70">平台算法</div>
            </div>
          </div>
        </div>

        {/* 定价预览 */}
        <div className="mt-24 text-center">
          <h2 className="mb-12 text-3xl font-bold text-gray-900">选择适合你的套餐</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
              <h3 className="mb-2 text-xl font-bold text-gray-900">免费版</h3>
              <div className="mb-6 text-4xl font-bold text-gray-900">¥0<span className="text-lg font-normal text-gray-600">/月</span></div>
              <ul className="mb-6 space-y-3 text-left text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={18} />
                  每天5次AI生成
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={18} />
                  基础章节撰写
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={18} />
                  标准润色功能
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <X size={18} />
                  无续写功能
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <X size={18} />
                  无高级评估
                </li>
              </ul>
              <Link
                href="/workspace"
                className="block w-full rounded-lg border-2 border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                开始使用
              </Link>
            </div>
            <div className="relative rounded-xl border-2 border-indigo-500 bg-white p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1 text-sm font-semibold text-white shadow-lg">
                  <Sparkles size={16} />
                  最受欢迎
                </span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">高级版</h3>
              <div className="mb-6 text-4xl font-bold text-gray-900">¥99<span className="text-lg font-normal text-gray-600">/月</span></div>
              <ul className="mb-6 space-y-3 text-left text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={18} />
                  每天50次AI生成
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={18} />
                  全功能章节撰写
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={18} />
                  高级润色功能
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={18} />
                  智能续写
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={18} />
                  质量评估报告
                </li>
              </ul>
              <Link
                href="/workspace"
                className="block w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-semibold text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                立即订阅
              </Link>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
              <h3 className="mb-2 text-xl font-bold text-gray-900">企业版</h3>
              <div className="mb-6 text-4xl font-bold text-gray-900">¥299<span className="text-lg font-normal text-gray-600">/月</span></div>
              <ul className="mb-6 space-y-3 text-left text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={18} />
                  无限AI生成
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={18} />
                  所有高级功能
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={18} />
                  专属客服支持
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={18} />
                  剧情逻辑优化
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={18} />
                  平台算法优化
                </li>
              </ul>
              <Link
                href="/workspace"
                className="block w-full rounded-lg border-2 border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                立即订阅
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="mt-24 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="flex items-center justify-center gap-2">
              <span>&copy; 2025 番茄AI写作助手. 保留所有权利.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
