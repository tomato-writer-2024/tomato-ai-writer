import Link from 'next/link';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "番茄小说AI辅助写作工具 - 智能创作助手",
  description: "专为番茄小说平台打造的AI辅助写作工具，帮助小说创作者快速生成符合番茄平台风格的爆款爽文内容",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <span className="text-xl font-bold text-gray-900">番茄AI写作助手</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                登录
              </Link>
              <Link href="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                免费注册
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900 sm:text-6xl">
            AI辅助创作，写出
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              爆款爽文
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-lg text-gray-600">
            专为番茄小说平台打造，智能识别爽点、优化剧情逻辑、自动分章润色。
            让日更15,000字成为可能，签约成功率提升至80%以上！
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/workspace"
              className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              开始创作
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border-2 border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 hover:border-gray-400 transition-colors"
            >
              查看定价
            </Link>
          </div>
        </div>

        {/* 功能展示 */}
        <div className="mt-24 grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-white p-8 shadow-lg">
            <div className="mb-4 text-4xl">✍️</div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">智能章节撰写</h3>
            <p className="text-gray-600">
              完读率潜力计算、爽点密度控制、自动分章系统，每章都符合番茄标准
            </p>
          </div>
          <div className="rounded-xl bg-white p-8 shadow-lg">
            <div className="mb-4 text-4xl">🎨</div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">精修润色工坊</h3>
            <p className="text-gray-600">
              网感增强、爽点放大、冗余修剪，让文字更具冲击力和感染力
            </p>
          </div>
          <div className="rounded-xl bg-white p-8 shadow-lg">
            <div className="mb-4 text-4xl">🧠</div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">智能续写大脑</h3>
            <p className="text-gray-600">
              剧情逻辑锚点、多分支剧情生成、风格一致性保障，告别逻辑混乱
            </p>
          </div>
        </div>

        {/* 数据展示 */}
        <div className="mt-24 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-white">
          <h2 className="mb-8 text-center text-3xl font-bold">核心优势</h2>
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold">15k+</div>
              <div className="text-lg">日更字数</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold">80%</div>
              <div className="text-lg">签约成功率</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold">60%</div>
              <div className="text-lg">首章完读率</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold">3x</div>
              <div className="text-lg">推荐量增长</div>
            </div>
          </div>
        </div>

        {/* 定价预览 */}
        <div className="mt-24 text-center">
          <h2 className="mb-12 text-3xl font-bold text-gray-900">选择适合你的套餐</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <h3 className="mb-2 text-xl font-bold text-gray-900">免费版</h3>
              <div className="mb-6 text-4xl font-bold text-gray-900">¥0<span className="text-lg font-normal text-gray-600">/月</span></div>
              <ul className="mb-6 space-y-3 text-left text-gray-600">
                <li>✓ 每天5次AI生成</li>
                <li>✓ 基础章节撰写</li>
                <li>✓ 标准润色功能</li>
                <li>✗ 无续写功能</li>
                <li>✗ 无高级评估</li>
              </ul>
              <button className="w-full rounded-lg border-2 border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50">
                开始使用
              </button>
            </div>
            <div className="rounded-xl border-2 border-blue-600 bg-white p-8 shadow-xl">
              <div className="mb-2 text-sm font-semibold text-blue-600">最受欢迎</div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">VIP版</h3>
              <div className="mb-6 text-4xl font-bold text-gray-900">¥99<span className="text-lg font-normal text-gray-600">/月</span></div>
              <ul className="mb-6 space-y-3 text-left text-gray-600">
                <li>✓ 每天50次AI生成</li>
                <li>✓ 全功能章节撰写</li>
                <li>✓ 高级润色功能</li>
                <li>✓ 智能续写</li>
                <li>✓ 质量评估报告</li>
              </ul>
              <button className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
                立即订阅
              </button>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <h3 className="mb-2 text-xl font-bold text-gray-900">SVIP版</h3>
              <div className="mb-6 text-4xl font-bold text-gray-900">¥299<span className="text-lg font-normal text-gray-600">/月</span></div>
              <ul className="mb-6 space-y-3 text-left text-gray-600">
                <li>✓ 无限AI生成</li>
                <li>✓ 所有VIP功能</li>
                <li>✓ 专属客服支持</li>
                <li>✓ 剧情逻辑优化</li>
                <li>✓ 平台算法优化</li>
              </ul>
              <button className="w-full rounded-lg border-2 border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50">
                立即订阅
              </button>
            </div>
          </div>
        </div>
      </section>

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