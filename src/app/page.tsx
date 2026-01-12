import Link from 'next/link';
import type { Metadata } from "next";
import {
  PenTool,
  Sparkles,
  Zap,
  TrendingUp,
  Crown,
  Star,
  Users,
  Shield,
  Rocket,
  BookOpen,
  Target,
  Database,
  Globe,
  Palette,
  Award,
  CheckCircle,
  Edit3,
  Brain,
  Lightbulb,
  BarChart3,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import {
  StatCard,
  FeatureCard,
  ProgressBar,
  TagCloud,
  Timeline,
} from '@/components/ui/advancedComponents';

export const metadata: Metadata = {
  title: "番茄小说AI辅助写作工具 - 智能创作助手",
  description: "专为番茄小说平台打造的AI辅助写作工具，50+生成器、百万素材库、多平台适配，帮助小说创作者快速生成符合平台风格的爆款爽文内容",
  keywords: [
    "番茄小说",
    "AI写作",
    "小说生成器",
    "爽文生成",
    "网文创作",
    "智能续写",
    "精修润色",
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/90 backdrop-blur-md dark:bg-slate-900/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl shadow-lg transition-transform hover:scale-110">
                <BrandLogo size="md" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                番茄AI写作助手
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/pricing"
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-cyan-600 transition-colors dark:text-slate-300 dark:hover:text-cyan-400"
              >
                <Crown size={18} />
                定价
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-cyan-600 transition-colors dark:text-slate-300 dark:hover:text-cyan-400"
              >
                <Zap size={18} />
                登录
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Sparkles size={18} />
                免费注册
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center animate-fadeIn">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 px-5 py-2.5 rounded-full mb-8 animate-pulse">
            <Sparkles className="text-cyan-600" size={20} />
            <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">50+生成器 · 百万素材库 · 多平台适配</span>
          </div>
          <h1 className="mb-8 text-6xl font-bold text-slate-900 dark:text-slate-100 sm:text-7xl leading-tight">
            AI辅助创作<br />
            写出
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              爆款爽文
            </span>
          </h1>
          <p className="mx-auto mb-12 max-w-3xl text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            专为番茄小说平台打造，50+细分生成器、百万级素材库、多平台适配。
            智能识别爽点、优化剧情逻辑、自动分章润色。
            让日更15,000字成为可能，签约成功率提升至80%以上！
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-20">
            <Link
              href="/workspace"
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-lg font-medium text-white hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <PenTool size={24} />
              开始创作
              <Sparkles className="ml-1 group-hover:animate-pulse" size={18} />
            </Link>
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-cyan-500 hover:border-cyan-600 px-8 py-4 text-lg font-medium text-cyan-700 hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-cyan-900/20 transition-all"
            >
              <Crown size={24} />
              查看套餐
            </Link>
          </div>
        </div>

        {/* 核心优势数据展示 */}
        <div className="grid gap-6 md:grid-cols-4 mb-20">
          <StatCard
            title="日更字数"
            value="15k+"
            icon={<Rocket className="text-cyan-500" size={32} />}
            trend={{ value: 50, isPositive: true }}
            color="cyan"
          />
          <StatCard
            title="签约成功率"
            value="80%"
            icon={<Award className="text-purple-500" size={32} />}
            trend={{ value: 30, isPositive: true }}
            color="purple"
          />
          <StatCard
            title="首章完读率"
            value="60%+"
            icon={<Users className="text-orange-500" size={32} />}
            trend={{ value: 20, isPositive: true }}
            color="orange"
          />
          <StatCard
            title="推荐量增长"
            value="3x"
            icon={<TrendingUp className="text-green-500" size={32} />}
            trend={{ value: 200, isPositive: true }}
            color="green"
          />
        </div>
      </section>

      {/* 核心功能展示 */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            核心功能
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            50+细分生成器，覆盖创作全流程
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          <FeatureCard
            icon={<Edit3 size={36} />}
            title="智能续写"
            description="AI智能续写，保持剧情连贯和风格一致"
            link="/continue"
            isNew
          />
          <FeatureCard
            icon={<Brain size={36} />}
            title="爆款拆解"
            description="深度拆解爆款作品的成功要素"
            link="/explosive-analyze"
          />
          <FeatureCard
            icon={<Star size={36} />}
            title="编辑审稿"
            description="模拟编辑审稿，提供专业修改建议"
            link="/editor-review"
            isPro
          />
          <FeatureCard
            icon={<Award size={36} />}
            title="黄金开头"
            description="生成吸引读者的黄金3秒开头"
            link="/golden-start"
            isPro
          />
          <FeatureCard
            icon={<Crown size={36} />}
            title="爽感引擎"
            description="优化情节爽点，提升读者爽感"
            link="/satisfaction-engine"
            isNew
          />
          <FeatureCard
            icon={<BarChart3 size={36} />}
            title="数据统计"
            description="查看创作数据和统计分析"
            link="/stats"
          />
        </div>

        {/* 新增功能区域 */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              特色功能
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              智能化创作工具链
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<BookOpen size={36} />}
              title="素材库"
              description="管理你的创作素材和参考资料"
              link="/materials"
              isNew
            />
            <FeatureCard
              icon={<Target size={36} />}
              title="大纲生成"
              description="自动生成完整故事大纲"
              link="/outline-generator"
              isNew
            />
            <FeatureCard
              icon={<Database size={36} />}
              title="角色生成"
              description="一键创建立体角色"
              link="/characters"
              isPro
            />
            <FeatureCard
              icon={<Globe size={36} />}
              title="风格模拟"
              description="模拟不同作家的写作风格"
              link="/style-simulator"
              isNew
            />
            <FeatureCard
              icon={<Shield size={36} />}
              title="情节反转"
              description="设计意想不到的剧情反转"
              link="/plot-twist"
              isNew
            />
          </div>
        </div>

        {/* 生成器展示 */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              50+细分生成器
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              从角色设定到结局设计，全流程覆盖
            </p>
          </div>

          <TagCloud
            tags={[
              { name: '角色设定', count: 8, color: 'cyan' },
              { name: '情节设计', count: 10, color: 'purple' },
              { name: '世界观', count: 5, color: 'orange' },
              { name: '对话生成', count: 5, color: 'green' },
              { name: '场景描写', count: 5, color: 'cyan' },
              { name: '情感描写', count: 4, color: 'purple' },
              { name: '风格转换', count: 4, color: 'orange' },
              { name: '结构设计', count: 3, color: 'green' },
              { name: '标题生成', count: 3, color: 'cyan' },
              { name: '描写技巧', count: 4, color: 'purple' },
              { name: '结局设计', count: 3, color: 'orange' },
              { name: '反转设计', count: 3, color: 'green' },
              { name: '系统设计', count: 2, color: 'cyan' },
              { name: '关系设计', count: 2, color: 'purple' },
              { name: '黄金开头', count: 2, color: 'orange' },
              { name: '金句生成', count: 2, color: 'green' },
            ]}
            size="lg"
          />
        </div>

        {/* 平台支持 */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              支持平台
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              一键适配，多平台发布
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: '番茄小说', color: 'red', icon: '🍅' },
              { name: '起点中文网', color: 'blue', icon: '📚' },
              { name: '晋江文学城', color: 'purple', icon: '💝' },
              { name: '知乎盐选', color: 'cyan', icon: '💡' },
            ].map((platform) => (
              <div
                key={platform.name}
                className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{platform.icon}</div>
                  <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {platform.name}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      独家适配
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 使用流程 */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            使用流程
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            简单四步，开启创作之旅
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Timeline
            items={[
              {
                title: '注册账号',
                description: '免费注册，立即获得创作权限',
                status: 'completed',
              },
              {
                title: '选择题材',
                description: '从8大热门题材中选择，或自定义题材',
                status: 'completed',
              },
              {
                title: '智能生成',
                description: '使用50+生成器，快速生成内容',
                status: 'in-progress',
              },
              {
                title: '优化发布',
                description: '润色精修，原创检测，一键发布',
                status: 'pending',
              },
            ]}
          />
        </div>
      </section>

      {/* CTA区域 */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-700 p-12 text-center">
          <div className="relative z-10">
            <h2 className="mb-6 text-4xl font-bold text-white">
              立即开始创作
            </h2>
            <p className="mb-8 text-xl text-cyan-100">
              免费注册，获得10万字免费额度
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-bold text-cyan-600 hover:bg-cyan-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Sparkles size={24} />
                免费注册
              </Link>
              <Link
                href="/workspace"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white px-8 py-4 text-lg font-medium text-white hover:bg-white/10 transition-all"
              >
                <PenTool size={24} />
                开始创作
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="border-t border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl">
                  <BrandLogo size="md" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                  番茄AI写作助手
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                专为番茄小说平台打造的AI辅助写作工具
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                产品
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/workspace" className="hover:text-cyan-600 dark:hover:text-cyan-400">创作工坊</Link></li>
                <li><Link href="/pricing" className="hover:text-cyan-600 dark:hover:text-cyan-400">定价方案</Link></li>
                <li><Link href="/features" className="hover:text-cyan-600 dark:hover:text-cyan-400">功能介绍</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                支持
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/help" className="hover:text-cyan-600 dark:hover:text-cyan-400">帮助中心</Link></li>
                <li><Link href="/contact" className="hover:text-cyan-600 dark:hover:text-cyan-400">联系我们</Link></li>
                <li><Link href="/faq" className="hover:text-cyan-600 dark:hover:text-cyan-400">常见问题</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                法律
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/terms" className="hover:text-cyan-600 dark:hover:text-cyan-400">用户协议</Link></li>
                <li><Link href="/privacy" className="hover:text-cyan-600 dark:hover:text-cyan-400">隐私政策</Link></li>
                <li><Link href="/copyright" className="hover:text-cyan-600 dark:hover:text-cyan-400">版权声明</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-8 text-center text-sm text-slate-600 dark:text-slate-400 dark:border-slate-800">
            © 2025 番茄AI写作助手. 保留所有权利.
          </div>
        </div>
      </footer>
    </div>
  );
}
