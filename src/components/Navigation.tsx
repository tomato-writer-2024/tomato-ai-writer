'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandIcons, BRAND_COLORS } from '@/lib/brandIcons';
import { removeToken, getToken } from '@/lib/auth-client';
import { Menu, X, User, LogOut, Home, LayoutGrid, FileText, BarChart3, Settings, Sparkles, Crown } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: '工作台', href: '/workspace', icon: <LayoutGrid size={20} /> },
  { label: '我的作品', href: '/works', icon: <FileText size={20} /> },
  { label: '数据统计', href: '/stats', icon: <BarChart3 size={20} /> },
  { label: '个人中心', href: '/profile', icon: <User size={20} /> },
];

const quickActions: NavItem[] = [
  { label: '对话写作', href: '/dialogue', icon: <Sparkles size={20} />, badge: '新' },
  { label: '智能续写', href: '/continue', icon: <FileText size={20} />, badge: '热' },
  { label: '角色设定', href: '/characters', icon: <User size={20} /> },
  { label: '写作模板', href: '/templates', icon: <FileText size={20} /> },
];

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsAuthenticatedState(!!getToken());
  }, [pathname]);

  const handleLogout = () => {
    removeToken();
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/90 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={isAuthenticatedState ? '/workspace' : '/'} className="flex items-center gap-3 group">
            <div
              className="flex items-center justify-center rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105"
              style={{
                background: BRAND_COLORS.gradient,
              }}
            >
              <BrandIcons.Logo size={28} className="text-white" />
            </div>
            <span
              className="hidden text-xl font-bold bg-clip-text text-transparent transition-all duration-300 group-hover:opacity-80 sm:block"
              style={{
                backgroundImage: BRAND_COLORS.gradient,
              }}
            >
              番茄AI写作助手
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {isAuthenticatedState ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-cyan-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-cyan-400'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                <div className="mx-2 h-6 w-px bg-slate-300 dark:bg-slate-700" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                >
                  <LogOut size={20} />
                  退出
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/pricing"
                  className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:shadow-lg"
                  style={{
                    background: BRAND_COLORS.gradient,
                  }}
                >
                  <Crown size={18} />
                  会员套餐
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:shadow-lg"
                >
                  <Sparkles size={18} />
                  免费注册
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          <div className="space-y-1 px-4 py-3">
            {isAuthenticatedState ? (
              <>
                {/* 快捷操作 */}
                {quickActions.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      快捷操作
                    </p>
                    {quickActions.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          {item.label}
                        </div>
                        {item.badge && (
                          <span className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2 py-0.5 text-xs font-medium text-white">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}

                {/* 主导航 */}
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  <LogOut size={20} />
                  退出登录
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/pricing"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-md"
                  style={{
                    background: BRAND_COLORS.gradient,
                  }}
                >
                  <Crown size={18} />
                  会员套餐
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-medium text-white shadow-md"
                >
                  <Sparkles size={18} />
                  免费注册
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
