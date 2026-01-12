import Link from 'next/link';

export default function SimpleHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                番茄AI写作助手
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/pricing"
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-cyan-600 transition-colors"
              >
                定价
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-cyan-600 transition-colors"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
              >
                免费注册
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="mb-8 text-6xl font-bold text-slate-900 sm:text-7xl leading-tight">
            AI辅助创作<br />
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              爆款爽文
            </span>
          </h1>
          <p className="mx-auto mb-12 max-w-3xl text-xl text-slate-600 leading-relaxed">
            专为番茄小说平台打造，50+细分生成器、百万级素材库、多平台适配。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link
              href="/workspace"
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-lg font-medium text-white hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
            >
              开始创作
            </Link>
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-cyan-500 hover:border-cyan-600 px-8 py-4 text-lg font-medium text-cyan-700 hover:bg-cyan-50 transition-all"
            >
              查看套餐
            </Link>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-center text-sm text-slate-600">
          <p>© 2024 番茄AI写作助手. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
