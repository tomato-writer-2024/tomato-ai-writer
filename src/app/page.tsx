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

export const metadata: Metadata = {
  title: "番茄小说AI辅助写作工具 - 智能创作助手",
  description: "专为番茄小说平台打造的AI辅助写作工具，帮助小说创作者快速生成符合番茄平台风格的爆款爽文内容",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md transition-transform hover:scale-110">
                <BrandIcons.Logo size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                番茄AI写作助手
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/pricing"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <Crown size={18} />
                定价
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <Zap size={18} />
                登录
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Sparkles size={18} />
                免费注册
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center animate-fadeIn">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full mb-6 animate-pulse">
            <Sparkles className="text-indigo-600" size={20} />
            <span className="text-sm font-medium text-indigo-700">AI智能创作，爆款出圈</span>
          </div>
          <h1 className="mb-6 text-5xl font-bold text-gray-900 sm:text-6xl leading-tight">
            AI辅助创作<br />
            写出
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              爆款爽文
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-lg text-gray-600 leading-relaxed">
            专为番茄小说平台打造，智能识别爽点、优化剧情逻辑、自动分章润色。
            让日更15,000字成为可能，签约成功率提升至80%以上！
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <GradientButton size="lg" icon={<PenTool size={22} />} iconPosition="right">
              开始创作
              <Sparkles className="ml-1 group-hover:animate-pulse" size={18} />
            </GradientButton>
            <Button
              variant="outline"
              size="lg"
              icon={<Crown size={22} />}
              className="border-2 border-indigo-500 hover:border-indigo-600"
            >
              <Link href="/pricing" className="w-full h-full flex items-center justify-center">
                查看套餐
              </Link>
            </Button>
          </div>
        </div>

        {/* 数据展示 - 移到前面，更有冲击力 */}
        <Card className="mb-16 border-none shadow-2xl" gradient>
          <CardBody className="text-white py-12">
            <h2 className="mb-8 text-center text-3xl font-bold">核心优势</h2>
            <div className="grid gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <span className="text-5xl font-bold">15k+</span>
                  <Rocket className="animate-bounce" size={32} />
                </div>
                <div className="text-lg text-white/90">日更字数</div>
                <div className="mt-2 text-sm text-white/70">AI智能生成</div>
              </div>
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <span className="text-5xl font-bold">80%</span>
                  <Star className="fill-yellow-300 text-yellow-300" size={32} />
                </div>
                <div className="text-lg text-white/90">签约成功率</div>
                <div className="mt-2 text-sm text-white/70">质量保障</div>
              </div>
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <span className="text-5xl font-bold">60%</span>
                  <Users size={32} />
                </div>
                <div className="text-lg text-white/90">首章完读率</div>
                <div className="mt-2 text-sm text-white/70">爆款潜力</div>
              </div>
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <span className="text-5xl font-bold">3x</span>
                  <TrendingUp size={32} />
                </div>
                <div className="text-lg text-white/90">推荐量增长</div>
                <div className="mt-2 text-sm text-white/70">平台算法</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 功能展示 */}
        <div className="grid gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<BrandIcons.Writing size={32} />}
            title="智能章节撰写"
            description="完读率潜力计算、爽点密度控制、自动分章系统，每章都符合番茄标准"
          />
          <FeatureCard
            icon={<BrandIcons.Shuangdian size={32} />}
            title="精修润色工坊"
            description="网感增强、爽点放大、冗余修剪，让文字更具冲击力和感染力"
          />
          <FeatureCard
            icon={<BrandIcons.AI size={32} />}
            title="智能续写大脑"
            description="剧情逻辑锚点、多分支剧情生成、风格一致性保障，告别逻辑混乱"
          />
        </div>

        {/* 用户评价 - 合并两个评价区域 */}
        <div className="mt-24">
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
            用户真实反馈
          </h2>
          <p className="text-center text-gray-600 mb-12">
            已帮助10,000+作者提升创作效率，签约成功率提升3倍
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            <Card hover>
              <CardBody>
                <div className="mb-4 flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="fill-yellow-400 text-yellow-400" size={16} />
                  ))}
                </div>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  "用这个工具后，我的日更从3000字提升到15000字，签约成功率提升了3倍！首章完读率达到68%，成功签约了！"
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white font-bold">
                    张
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">张小明</h3>
                    <p className="text-sm text-gray-600">签约作家</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card hover>
              <CardBody>
                <div className="mb-4 flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="fill-yellow-400 text-yellow-400" size={16} />
                  ))}
                </div>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  "智能续写功能太惊艳了！帮我理清了剧情线，完读率从65%提升到了85%。现在每月都能稳定更新，收益翻倍！"
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white font-bold">
                    李
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">李芳芳</h3>
                    <p className="text-sm text-gray-600">兼职作者</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card hover>
              <CardBody>
                <div className="mb-4 flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="fill-yellow-400 text-yellow-400" size={16} />
                  ))}
                </div>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  "会员功能很全面，批量处理功能让我一周就能写完一本书。作为新手，这个工具让我快速上手番茄小说写作节奏，第一个月就拿到了5星好评！质量分都在85以上！"
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-pink-600 text-white font-bold">
                    王
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">王大伟</h3>
                    <p className="text-sm text-gray-600">全职作家</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* CTA区域 */}
        <Card className="mt-24 border-none" gradient>
          <CardBody className="py-16 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold">开始你的创作之旅</h2>
            <p className="mb-8 text-lg text-white/90">
              立即注册，免费体验AI智能创作，写出你的第一部爆款爽文
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <GradientButton size="lg">
                <Link href="/register" className="w-full h-full flex items-center justify-center">
                  免费注册
                  <Sparkles className="ml-1" size={18} />
                </Link>
              </GradientButton>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white/10"
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
      <footer className="mt-24 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BrandIcons.Logo size={32} />
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  番茄AI写作助手
                </span>
              </div>
              <p className="text-sm text-gray-600">
                专为番茄小说平台打造的AI辅助写作工具，帮助小说创作者快速生成符合番茄平台风格的爆款爽文内容
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">产品功能</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-indigo-600">智能章节撰写</Link></li>
                <li><Link href="#" className="hover:text-indigo-600">精修润色工坊</Link></li>
                <li><Link href="#" className="hover:text-indigo-600">智能续写大脑</Link></li>
                <li><Link href="#" className="hover:text-indigo-600">质量评估系统</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">帮助中心</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-indigo-600">使用教程</Link></li>
                <li><Link href="#" className="hover:text-indigo-600">常见问题</Link></li>
                <li><Link href="#" className="hover:text-indigo-600">联系客服</Link></li>
                <li><Link href="#" className="hover:text-indigo-600">意见反馈</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">关于我们</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-indigo-600">关于我们</Link></li>
                <li><Link href="#" className="hover:text-indigo-600">隐私政策</Link></li>
                <li><Link href="#" className="hover:text-indigo-600">服务条款</Link></li>
                <li><Link href="#" className="hover:text-indigo-600">加入我们</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
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
