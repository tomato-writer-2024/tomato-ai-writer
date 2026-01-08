'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandIcons, { BRAND_COLORS } from '@/lib/brandIcons';
import { Menu, X, User, FileText, BarChart3, Settings, LogOut } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requireAuth?: boolean;
}

const navItems: NavItem[] = [
  { label: '工作区', href: '/workspace', icon: <BrandIcons.Writing size={20} />, requireAuth: true },
  { label: '作品管理', href: '/works', icon: <BrandIcons.Book size={20} />, requireAuth: true },
  { label: '数据统计', href: '/stats', icon: <BrandIcons.Stats size={20} />, requireAuth: true },
  { label: '个人中心', href: '/profile', icon: <User size={20} />, requireAuth: true },
];

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={isAuthenticated ? '/workspace' : '/'} className="flex items-center gap-3 group">
            <div
              className="flex items-center justify-center rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105"
              style={{
                background: BRAND_COLORS.gradient,
              }}
            >
              <BrandIcons.Logo size={28} className="text-white" />
            </div>
            <span
              className="text-xl font-bold bg-clip-text text-transparent transition-all duration-300 group-hover:opacity-80"
              style={{
                backgroundImage: BRAND_COLORS.gradient,
              }}
            >
              番茄AI写作助手
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {isAuthenticated ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="ml-2 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut size={20} />
                  退出
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-indigo-600"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:shadow-lg"
                  style={{
                    background: BRAND_COLORS.gradient,
                  }}
                >
                  <BrandIcons.Zap size={18} />
                  免费注册
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
          <div className="space-y-1 px-4 py-3">
            {isAuthenticated ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
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
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50"
                >
                  <LogOut size={20} />
                  退出
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-md"
                  style={{
                    background: BRAND_COLORS.gradient,
                  }}
                >
                  <BrandIcons.Zap size={18} />
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
