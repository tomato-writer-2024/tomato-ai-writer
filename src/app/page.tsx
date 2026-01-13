'use client';

import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import BrandCard from '@/components/ui/BrandCard';
import FeatureCard from '@/components/ui/FeatureCard';
import {
  PenTool,
  Sparkles,
  BookOpen,
  FileEdit,
  Database,
  Zap,
  TrendingUp,
  Users,
  Award,
  ArrowRight,
  Star,
  CheckCircle2,
  Target,
  Rocket,
  Flame,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="ml-0 md:ml-72 transition-all duration-300">
        {/* 顶部导航 */}
        <TopNav />

        {/* 内容区域 */}
        <main className="px-6 py-8">
          {/* 英雄区域 */}
          <section className="mb-12 rounded-3xl bg-gradient-to-br from-[#FF4757] via-[#5F27CD] to-[#3498DB] p-8 md:p-12 text-white relative overflow-hidden">
            {/* 背景装饰 */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-white/90">专为番茄小说平台打造</span>
              </div>

              <h1 className="mb-6 text-4xl md:text-6xl font-bold leading-tight">
                AI辅助创作
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                  爆款爽文生成器
                </span>
              </h1>

              <p className="mb-8 text-lg md:text-xl text-white/90 max-w-2xl">
                200+ 小说场景生成器、百万级素材库、多平台适配。
                让创作更简单，让爆款更容易。
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/workspace"
                  className="
                    inline-flex items-center justify-center gap-2 px-8 py-4
                    rounded-xl bg-white text-[#FF4757] font-semibold
                    hover:shadow-2xl hover:scale-105 transition-all
                  "
                >
                  <Rocket className="h-5 w-5" />
                  <span>开始创作</span>
                </Link>
                <Link
                  href="/templates"
                  className="
                    inline-flex items-center justify-center gap-2 px-8 py-4
                    rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold border border-white/30
                    hover:bg-white/30 transition-all
                  "
                >
                  <Zap className="h-5 w-5" />
                  <span>快速体验</span>
                </Link>
              </div>
            </div>
          </section>

          {/* 数据统计 */}
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={BookOpen}
                title="已生成章节"
                value="10,000+"
                trend="本月 +25%"
                trendUp
                delay={0}
              />
              <FeatureCard
                icon={Users}
                title="活跃创作者"
                value="5,000+"
                trend="本月 +18%"
                trendUp
                delay={100}
              />
              <FeatureCard
                icon={Award}
                title="完读率提升"
                value="60%+"
                trend="平均提升 35%"
                trendUp
                delay={200}
              />
            </div>
          </section>

          {/* 核心功能 */}
          <section className="mb-12">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                核心功能
              </h2>
              <p className="text-slate-600">
                全方位的AI创作工具，满足各种写作需求
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <BrandCard
                icon={PenTool}
                title="章节撰写"
                description="AI辅助撰写章节内容，支持多种风格和题材，一键生成高质量文本"
                tags={['智能续写', '风格控制', '自动排版']}
                gradient="from-[#FF4757] to-[#FF6B81]"
                delay={0}
                onClick={() => (window.location.href = '/works')}
              />
              <BrandCard
                icon={Sparkles}
                title="精修润色"
                description="自动润色和优化文本，提升文章质量，增强读者阅读体验"
                tags={['语法检查', '风格调整', '情感增强']}
                gradient="from-[#5F27CD] to-[#9B59B6]"
                delay={100}
                onClick={() => (window.location.href = '/editor-review')}
              />
              <BrandCard
                icon={FileEdit}
                title="智能续写"
                description="基于上下文智能续写内容，保持情节连贯，避免卡文"
                tags={['情节预测', '角色保持', '逻辑一致']}
                gradient="from-[#00D2D3] to-[#3498DB]"
                delay={200}
                onClick={() => (window.location.href = '/continue')}
              />
              <BrandCard
                icon={BookOpen}
                title="爆款拆解"
                description="分析爆款小说的成功要素，提炼写作技巧和创作公式"
                tags={['热点分析', '节奏把控', '爽点设计']}
                gradient="from-[#F39C12] to-[#E67E22]"
                delay={300}
                onClick={() => (window.location.href = '/explosive-analyze')}
              />
              <BrandCard
                icon={Database}
                title="素材库"
                description="百万级素材库，涵盖人物设定、场景描写、对话模板等"
                tags={['人物档案', '场景素材', '对话模板']}
                gradient="from-[#1ABC9C] to-[#2ECC71]"
                delay={400}
                onClick={() => (window.location.href = '/materials')}
              />
              <BrandCard
                icon={Zap}
                title="黄金开头"
                description="生成吸引人的开篇内容，抓住读者眼球，提升完读率"
                tags={['钩子设计', '悬念营造', '快速入戏']}
                gradient="from-[#FF4757] to-[#E84118]"
                delay={500}
                onClick={() => (window.location.href = '/golden-start')}
              />
            </div>
          </section>

          {/* 为什么选择我们 */}
          <section className="mb-12 rounded-3xl bg-white border border-slate-200 p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                为什么选择番茄AI
              </h2>
              <p className="text-slate-600">
                专为番茄小说平台打造，深度理解平台调性和用户偏好
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4757] to-[#5F27CD] mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">精准定位</h3>
                <p className="text-sm text-slate-600">
                  深度理解番茄小说平台调性，生成符合平台风格的内容
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#5F27CD] to-[#9B59B6] mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">质量保障</h3>
                <p className="text-sm text-slate-600">
                  双视角评分系统（编辑+读者），确保内容质量达到9.8分+
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3498DB] to-[#00D2D3] mb-4">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">持续优化</h3>
                <p className="text-sm text-slate-600">
                  基于千例测试框架，不断优化AI生成质量和用户体验
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1ABC9C] to-[#2ECC71] mb-4">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">完全合规</h3>
                <p className="text-sm text-slate-600">
                  动态应对平台审核政策，确保内容原创且合规
                </p>
              </div>
            </div>
          </section>

          {/* CTA区域 */}
          <section className="mb-12 rounded-3xl bg-gradient-to-br from-[#FF4757]/10 to-[#5F27CD]/10 border border-[#FF4757]/20 p-8 md:p-12 text-center">
            <h2 className="mb-4 text-2xl md:text-3xl font-bold text-slate-900">
              准备好开始创作了吗？
            </h2>
            <p className="mb-8 text-slate-600 max-w-2xl mx-auto">
              立即加入我们，体验AI辅助创作，让创作更简单，让爆款更容易
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="
                  inline-flex items-center justify-center gap-2 px-8 py-4
                  rounded-xl bg-gradient-to-r from-[#FF4757] to-[#5F27CD] text-white font-semibold
                  hover:shadow-2xl hover:shadow-[#FF4757]/25 hover:scale-105 transition-all
                "
              >
                <span>免费注册</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/pricing"
                className="
                  inline-flex items-center justify-center gap-2 px-8 py-4
                  rounded-xl bg-white text-slate-900 font-semibold border-2 border-slate-200
                  hover:border-[#FF4757] transition-all
                "
              >
                <span>查看定价</span>
              </Link>
            </div>
          </section>
        </main>

        {/* 页脚 */}
        <footer className="border-t border-slate-200 bg-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center text-sm text-slate-600">
            <p>© 2024 番茄AI写作助手. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
