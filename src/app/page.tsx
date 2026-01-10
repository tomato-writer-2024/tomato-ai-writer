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
  Rocket
} from 'lucide-react';
import BrandIcons from '@/lib/brandIcons';
import { Card, CardBody, FeatureCard } from '@/components/Card';
import { Button, GradientButton } from '@/components/Button';
import { Badge } from '@/components/Badge';

export const metadata: Metadata = {
  title: "番茄小说AI辅助写作工具 - 智能创作助手",
  description: "专为番茄小说平台打造的AI辅助写作工具，帮助小说创作者快速生成符合番茄平台风格的爆款爽文内容",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl shadow-lg transition-transform hover:scale-110">
                <BrandIcons.Logo size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                番茄AI写作助手
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/pricing"
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-cyan-600 transition-colors"
              >
                <Crown size={18} />
                定价
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-cyan-600 transition-colors"
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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-blue-100 px-5 py-2.5 rounded-full mb-8 animate-pulse">
            <Sparkles className="text-cyan-600" size={20} />
            <span className="text-sm font-semibold text-cyan-700">AI智能创作，爆款出圈</span>
          </div>
          <h1 className="mb-8 text-6xl font-bold text-slate-900 sm:text-7xl leading-tight">
            AI辅助创作<br />
            写出
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              爆款爽文
            </span>
          </h1>
          <p className="mx-auto mb-12 max-w-3xl text-xl text-slate-600 leading-relaxed">
            专为番茄小说平台打造，智能识别爽点、优化剧情逻辑、自动分章润色。
            让日更15,000字成为可能，签约成功率提升至80%以上！
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-20">
            <GradientButton size="lg" icon={<PenTool size={22} />} iconPosition="right">
              开始创作
              <Sparkles className="ml-1 group-hover:animate-pulse" size={18} />
            </GradientButton>
            <Button
              variant="outline"
              size="lg"
              icon={<Crown size={22} />}
              className="border-2 border-cyan-500 hover:border-cyan-600 text-cyan-700 hover:bg-cyan-50"
            >
              <Link href="/pricing" className="w-full h-full flex items-center justify-center">
                查看套餐
              </Link>
            </Button>
          </div>
        </div>

        {/* 核心优势数据展示 */}
        <Card className="mb-20 border-2 border-cyan-100 bg-white/60 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow">
          <CardBody className="py-16">
            <h2 className="mb-12 text-center text-4xl font-bold text-slate-900">核心优势</h2>
            <div className="grid gap-10 md:grid-cols-4">
              <div className="text-center group">
                <div className="mb-3 flex items-center justify-center gap-2">
                  <span className="text-6xl font-bold bg-gradient-to-br from-cyan-500 to-blue-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                    15k+
                  </span>
                  <Rocket className="animate-bounce text-cyan-500" size={36} />
                </div>
                <div className="text-xl font-semibold text-slate-800">日更字数</div>
                <div className="mt-2 text-slate-600">AI智能生成</div>
              </div>
              <div className="text-center group">
                <div className="mb-3 flex items-center justify-center gap-2">
                  <span className="text-6xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                    80%
                  </span>
                </div>
                <div className="text-xl font-semibold text-slate-800">签约成功率</div>
                <div className="mt-2 text-slate-600">质量保障</div>
              </div>
              <div className="text-center group">
                <div className="mb-3 flex items-center justify-center gap-2">
                  <span className="text-6xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                    60%
                  </span>
                  <Users className="text-indigo-500" size={36} />
                </div>
                <div className="text-xl font-semibold text-slate-800">首章完读率</div>
                <div className="mt-2 text-slate-600">爆款潜力</div>
              </div>
              <div className="text-center group">
                <div className="mb-3 flex items-center justify-center gap-2">
                  <span className="text-6xl font-bold bg-gradient-to-br from-purple-500 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                    3x
                  </span>
                  <TrendingUp className="text-purple-500" size={36} />
                </div>
                <div className="text-xl font-semibold text-slate-800">推荐量增长</div>
                <div className="mt-2 text-slate-600">平台算法</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 功能展示 */}
        <div className="mb-16">
          <h2 className="mb-12 text-center text-4xl font-bold text-slate-900">核心功能</h2>
          <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-4">
            <FeatureCard
              icon={<BrandIcons.Writing size={36} />}
              title="精修润色工坊"
              description="完读率潜力计算、爽点密度控制、网感增强，让文字更具冲击力"
              link="/workspace"
            />
            <FeatureCard
              icon={<BrandIcons.AI size={36} />}
              title="智能续写大脑"
              description="剧情逻辑锚点、多分支剧情生成、风格一致性保障，告别逻辑混乱"
              link="/continue"
            />
            <FeatureCard
              icon={<BrandIcons.Star size={36} />}
              title="爆款拆解分析"
              description="深度拆解爆款作品的6大分析维度和5大爆款公式，提炼可复制的成功模板"
              link="/explosive-analyze"
            />
            <FeatureCard
              icon={<BrandIcons.Award size={36} />}
              title="模拟编辑审稿"
              description="双视角专业审稿，预测书评章评9.8分+，为达成爆款Top3提供明确方向"
              link="/editor-review"
            />
            <FeatureCard
              icon={<BrandIcons.Crown size={36} />}
              title="黄金开头生成"
              description="遵循黄金3秒+黄金500字原则，生成多版本开头，助你打造爆款开篇"
              link="/golden-start"
            />
            <FeatureCard
              icon={<BrandIcons.Stats size={36} />}
              title="数据统计追踪"
              description="爆款趋势分析、质量追踪、用户画像，全方位助力内容优化"
              link="/stats"
            />
          </div>

          {/* 新增功能 */}
          <div className="mt-16">
            <h3 className="mb-8 text-center text-3xl font-bold text-slate-900">全新功能</h3>
            <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-4">
              <FeatureCard
                icon={<BrandIcons.User size={36} />}
                title="角色设定系统"
                description="智能生成立体饱满的角色设定，构建独特的人物魅力"
                link="/characters"
              />
              <FeatureCard
                icon={<BrandIcons.Sparkles size={36} />}
                title="世界观构建器"
                description="构建宏大完整的世界观设定，为你的小说奠定坚实基础"
                link="/world-building"
              />
              <FeatureCard
                icon={<BrandIcons.Book size={36} />}
                title="智能大纲生成"
                description="生成完整小说大纲和章节规划，构建精彩的故事框架"
                link="/outline-generator"
              />
              <FeatureCard
                icon={<BrandIcons.Zap size={36} />}
                title="人物关系图谱"
                description="构建复杂的人物关系网络，驱动剧情发展"
                link="/relationship-map"
              />
              <FeatureCard
                icon={<BrandIcons.Writing size={36} />}
                title="卡文诊断助手"
                description="AI诊断卡文原因，提供个性化解决方案，助你突破创作瓶颈"
                link="/writer-block"
              />
              <FeatureCard
                icon={<BrandIcons.Star size={36} />}
                title="爽点优化引擎"
                description="智能识别和优化爽点，提升完读率和读者满意度"
                link="/satisfaction-engine"
              />
              <FeatureCard
                icon={<BrandIcons.Book size={36} />}
                title="文风模拟器"
                description="模拟知名作者写作风格，为你的内容注入独特魅力"
                link="/style-simulator"
              />
              <FeatureCard
                icon={<BrandIcons.Crown size={36} />}
                title="情节反转建议器"
                description="生成精彩的情节反转，为你的故事制造意外和震撼"
                link="/plot-twist"
              />
              <FeatureCard
                icon={<BrandIcons.Award size={36} />}
                title="智能结局生成"
                description="生成完美的结局，为你的故事画上圆满句号"
                link="/ending-generator"
              />
              <FeatureCard
                icon={<BrandIcons.Stats size={36} />}
                title="书名生成器"
                description="智能生成吸睛书名，提升作品关注度和点击率"
                link="/title-generator"
              />
              <FeatureCard
                icon={<BrandIcons.Sparkles size={36} />}
                title="封面描述生成"
                description="生成专业封面描述和AI绘画提示词，打造吸睛封面"
                link="/cover-generator"
              />
            </div>
          </div>
        </div>

        {/* 用户评价 */}
        <div className="mt-24">
          <h2 className="mb-4 text-center text-4xl font-bold text-slate-900">
            用户真实反馈
          </h2>
          <p className="text-center text-slate-600 mb-12 text-lg">
            已帮助10,000+作者提升创作效率，签约成功率提升3倍
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            <Card hover className="border-2 border-slate-100 hover:border-cyan-200">
              <CardBody>
                <div className="mb-4 flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="fill-yellow-400 text-yellow-400" size={18} />
                  ))}
                </div>
                <p className="mb-6 text-slate-700 leading-relaxed text-base">
                  "用这个工具后，我的日更从3000字提升到15000字，签约成功率提升了3倍！首章完读率达到68%，成功签约了！"
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-lg font-bold">
                    张
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">张小明</h3>
                    <p className="text-sm text-slate-600">签约作家</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card hover className="border-2 border-slate-100 hover:border-blue-200">
              <CardBody>
                <div className="mb-4 flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="fill-yellow-400 text-yellow-400" size={18} />
                  ))}
                </div>
                <p className="mb-6 text-slate-700 leading-relaxed text-base">
                  "智能续写功能太惊艳了！帮我理清了剧情线，完读率从65%提升到了85%。现在每月都能稳定更新，收益翻倍！"
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-lg font-bold">
                    李
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">李芳芳</h3>
                    <p className="text-sm text-slate-600">兼职作者</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card hover className="border-2 border-slate-100 hover:border-indigo-200">
              <CardBody>
                <div className="mb-4 flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="fill-yellow-400 text-yellow-400" size={18} />
                  ))}
                </div>
                <p className="mb-6 text-slate-700 leading-relaxed text-base">
                  "会员功能很全面，批量处理功能让我一周就能写完一本书。作为新手，这个工具让我快速上手番茄小说写作节奏，第一个月就拿到了5星好评！质量分都在85以上！"
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-lg font-bold">
                    王
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">王大伟</h3>
                    <p className="text-sm text-slate-600">全职作家</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* CTA区域 */}
        <Card className="mt-24 border-none" gradient>
          <CardBody className="py-20 text-center text-white">
            <h2 className="mb-5 text-4xl font-bold">开始你的创作之旅</h2>
            <p className="mb-10 text-xl text-white/90 max-w-2xl mx-auto">
              立即注册，免费体验AI智能创作，写出你的第一部爆款爽文
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <GradientButton size="lg">
                <Link href="/register" className="w-full h-full flex items-center justify-center">
                  免费注册
                  <Sparkles className="ml-1" size={18} />
                </Link>
              </GradientButton>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white/10 hover:shadow-xl transition-all"
              >
                <Link href="/pricing" className="w-full h-full flex items-center justify-center">
                  查看套餐
                  <Crown className="ml-1" size={18} />
                </Link>
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* 页脚 */}
      <footer className="mt-24 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BrandIcons.Logo size={32} />
                <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                  番茄AI写作助手
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                专为番茄小说平台打造的AI辅助写作工具，帮助小说创作者快速生成符合番茄平台风格的爆款爽文内容
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">产品功能</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="#" className="hover:text-cyan-600 transition-colors">智能章节撰写</Link></li>
                <li><Link href="#" className="hover:text-cyan-600 transition-colors">精修润色工坊</Link></li>
                <li><Link href="#" className="hover:text-cyan-600 transition-colors">智能续写大脑</Link></li>
                <li><Link href="#" className="hover:text-cyan-600 transition-colors">质量评估系统</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">帮助中心</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="#" className="hover:text-cyan-600 transition-colors">使用教程</Link></li>
                <li><Link href="#" className="hover:text-cyan-600 transition-colors">常见问题</Link></li>
                <li><Link href="#" className="hover:text-cyan-600 transition-colors">联系客服</Link></li>
                <li><Link href="#" className="hover:text-cyan-600 transition-colors">意见反馈</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">关于我们</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="#" className="hover:text-cyan-600 transition-colors">关于我们</Link></li>
                <li><Link href="#" className="hover:text-cyan-600 transition-colors">隐私政策</Link></li>
                <li><Link href="#" className="hover:text-cyan-600 transition-colors">服务条款</Link></li>
                <li><Link href="#" className="hover:text-cyan-600 transition-colors">加入我们</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-slate-200 text-center text-sm text-slate-600">
            <p className="flex items-center justify-center gap-2">
              <Shield size={16} />
              <span>&copy; 2025 番茄AI写作助手. 保留所有权利. 安全可靠，值得信赖</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
