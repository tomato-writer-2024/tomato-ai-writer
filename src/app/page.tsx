'use client';

import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import BrandCard from '@/components/ui/BrandCard';
import FeatureCard from '@/components/ui/FeatureCard';
import Button from '@/components/ui/Button';
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
  MessageSquare,
  Wand2,
  Shield,
  Zap as ZapIcon,
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
        <main className="container-brand section-brand">
          {/* ===================================
               Hero Section - 对标Notion/笔灵AI
               =================================== */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF4757] via-[#6366F1] to-[#06B6D4] p-8 sm:p-12 lg:p-16 text-white">
            {/* 背景装饰 */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10">
              {/* 标签 */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-6">
                <Flame className="w-4 h-4" />
                <span>专为番茄小说平台打造</span>
              </div>

              {/* 主标题 */}
              <h1 className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                AI辅助创作
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                  爆款爽文生成器
                </span>
              </h1>

              {/* 副标题 */}
              <p className="mb-8 text-lg sm:text-xl text-white/90 max-w-2xl leading-relaxed">
                200+ 小说场景生成器、百万级素材库、多平台适配。
                让创作更简单，让爆款更容易。
              </p>

              {/* CTA按钮 */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/workspace"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-[#FF4757] font-semibold shadow-2xl hover:shadow-3xl hover:-translate-y-0.5 transition-all"
                >
                  <Rocket className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>开始创作</span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link
                  href="/templates"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold border-2 border-white/30 hover:bg-white/30 transition-all"
                >
                  <ZapIcon className="w-5 h-5" />
                  <span>快速体验</span>
                </Link>
              </div>
            </div>
          </section>

          {/* ===================================
               数据统计 - 对标笔灵AI
               =================================== */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

          {/* ===================================
               核心功能 - 对标Notion
               =================================== */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
                核心功能
              </h2>
              <p className="text-lg text-slate-600">
                全方位的AI创作工具，满足各种写作需求
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                icon={MessageSquare}
                title="对话写作"
                description="与AI助手协作创作，实时获得专业建议和创作方案，支持多轮对话"
                tags={['多轮对话', '流式输出', '上下文记忆']}
                gradient="from-[#6366F1] to-[#8B5CF6]"
                delay={100}
                onClick={() => (window.location.href = '/dialogue')}
              />
              <BrandCard
                icon={Sparkles}
                title="精修润色"
                description="自动润色和优化文本，提升文章质量，增强读者阅读体验"
                tags={['语法检查', '风格调整', '情感增强']}
                gradient="from-[#8B5CF6] to-[#9B59B6]"
                delay={200}
                onClick={() => (window.location.href = '/editor-review')}
              />
              <BrandCard
                icon={FileEdit}
                title="智能续写"
                description="基于上下文智能续写内容，保持情节连贯，避免卡文"
                tags={['情节预测', '角色保持', '逻辑一致']}
                gradient="from-[#06B6D4] to-[#3B82F6]"
                delay={300}
                onClick={() => (window.location.href = '/continue')}
              />
              <BrandCard
                icon={BookOpen}
                title="爆款拆解"
                description="分析爆款小说的成功要素，提炼写作技巧和创作公式"
                tags={['热点分析', '节奏把控', '爽点设计']}
                gradient="from-[#F59E0B] to-[#F97316]"
                delay={400}
                onClick={() => (window.location.href = '/explosive-analyze')}
              />
              <BrandCard
                icon={Database}
                title="素材库"
                description="百万级素材库，涵盖人物设定、场景描写、对话模板等"
                tags={['人物档案', '场景素材', '对话模板']}
                gradient="from-[#10B981] to-[#059669]"
                delay={500}
                onClick={() => (window.location.href = '/materials')}
              />
            </div>
          </section>

          {/* ===================================
               为什么选择我们 - 对标WPS AI
               =================================== */}
          <section className="card-brand">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
                为什么选择番茄AI
              </h2>
              <p className="text-lg text-slate-600">
                专为番茄小说平台打造，深度理解平台调性和用户偏好
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="group p-6 rounded-2xl bg-slate-50 hover:bg-gradient-to-br hover:from-[#FF4757]/5 hover:to-[#6366F1]/5 border-2 border-slate-100 hover:border-[#FF4757]/20 transition-all duration-300">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4757] to-[#6366F1] text-white shadow-lg shadow-[#FF4757]/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Target className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">精准定位</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  深度理解番茄小说平台调性，生成符合平台风格的内容
                </p>
              </div>

              <div className="group p-6 rounded-2xl bg-slate-50 hover:bg-gradient-to-br hover:from-[#6366F1]/5 hover:to-[#8B5CF6]/5 border-2 border-slate-100 hover:border-[#6366F1]/20 transition-all duration-300">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-[#6366F1]/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">质量保障</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  双视角评分系统（编辑+读者），确保内容质量达到9.8分+
                </p>
              </div>

              <div className="group p-6 rounded-2xl bg-slate-50 hover:bg-gradient-to-br hover:from-[#06B6D4]/5 hover:to-[#10B981]/5 border-2 border-slate-100 hover:border-[#06B6D4]/20 transition-all duration-300">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#06B6D4] to-[#10B981] text-white shadow-lg shadow-[#06B6D4]/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Star className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">持续优化</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  基于千例测试框架，不断优化AI生成质量和用户体验
                </p>
              </div>

              <div className="group p-6 rounded-2xl bg-slate-50 hover:bg-gradient-to-br hover:from-[#10B981]/5 hover:to-[#F59E0B]/5 border-2 border-slate-100 hover:border-[#10B981]/20 transition-all duration-300">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#10B981] to-[#F59E0B] text-white shadow-lg shadow-[#10B981]/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Shield className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">完全合规</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  动态应对平台审核政策，确保内容原创且合规
                </p>
              </div>
            </div>
          </section>

          {/* ===================================
               CTA区域 - 对标笔灵AI
               =================================== */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF4757]/10 to-[#6366F1]/10 border-2 border-[#FF4757]/20 p-8 sm:p-12 lg:p-16 text-center">
            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[#FF4757] to-[#6366F1] text-white shadow-xl shadow-[#FF4757]/30">
                <Wand2 className="h-8 w-8" />
              </div>
              <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
                准备好开始创作了吗？
              </h2>
              <p className="mb-8 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                立即加入我们，体验AI辅助创作，让创作更简单，让爆款更容易
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#FF4757] to-[#6366F1] text-white font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
                >
                  <span>免费注册</span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-900 font-semibold border-2 border-slate-200 hover:border-[#FF4757] hover:text-[#FF4757] transition-all"
                >
                  <span>查看定价</span>
                </Link>
              </div>
            </div>
          </section>

          {/* ===================================
               页脚
               =================================== */}
          <footer className="border-t border-slate-200 bg-white px-6 py-8">
            <div className="max-w-7xl mx-auto text-center text-sm text-slate-600">
              <p>© 2024 番茄AI写作助手. All rights reserved.</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
