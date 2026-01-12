'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PenTool, BookOpen, FileEdit, Sparkles, Database, LayoutDashboard, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: '首页', href: '/', icon: Home, current: false },
  { name: '工作台', href: '/workspace', icon: LayoutDashboard, current: false },
  {
    name: '创作工具',
    items: [
      { name: '章节撰写', href: '/writing/chapter', icon: PenTool },
      { name: '精修润色', href: '/writing/polish', icon: Sparkles },
      { name: '智能续写', href: '/writing/continue', icon: FileEdit },
      { name: '爆款拆解', href: '/writing/analyze', icon: BookOpen },
    ],
  },
  {
    name: '资源中心',
    items: [
      { name: '素材库', href: '/materials', icon: Database },
      { name: '写作模板', href: '/templates', icon: FileEdit },
    ],
  },
];

const userMenu = [
  { name: '个人中心', href: '/profile', icon: LayoutDashboard },
  { name: '设置', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <>
      {/* 移动端遮罩 */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={`
          fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-200
          flex flex-col transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo区域 */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4757] to-[#5F27CD] shadow-lg shadow-[#FF4757]/30">
                <PenTool className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">番茄AI</h1>
                <p className="text-xs text-slate-500">写作助手</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4757] to-[#5F27CD] shadow-lg shadow-[#FF4757]/30">
              <PenTool className="h-5 w-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4 text-slate-600" />
            ) : (
              <X className="h-4 w-4 text-slate-600" />
            )}
          </button>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* 主导航 */}
          <div className="space-y-1">
            {navigation.slice(0, 2).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-gradient-to-r from-[#FF4757] to-[#5F27CD] text-white shadow-lg shadow-[#FF4757]/20'
                      : 'text-slate-700 hover:bg-slate-100'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'flex-shrink-0'}`} />
                  {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </div>

          {/* 创作工具 */}
          <div>
            {!isCollapsed && (
              <p className="mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                创作工具
              </p>
            )}
            <div className="space-y-1">
              {navigation[2].items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                      ${isActive(item.href)
                        ? 'bg-gradient-to-r from-[#FF4757]/10 to-[#5F27CD]/10 text-[#FF4757] border border-[#FF4757]/20'
                        : 'text-slate-700 hover:bg-slate-100'
                      }
                    `}
                    title={isCollapsed ? item.name : ''}
                  >
                    <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'flex-shrink-0'}`} />
                    {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 资源中心 */}
          <div>
            {!isCollapsed && (
              <p className="mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                资源中心
              </p>
            )}
            <div className="space-y-1">
              {navigation[3].items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                      ${isActive(item.href)
                        ? 'bg-gradient-to-r from-[#FF4757]/10 to-[#5F27CD]/10 text-[#FF4757] border border-[#FF4757]/20'
                        : 'text-slate-700 hover:bg-slate-100'
                      }
                    `}
                    title={isCollapsed ? item.name : ''}
                  >
                    <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'flex-shrink-0'}`} />
                    {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 用户菜单 */}
          <div>
            {!isCollapsed && (
              <p className="mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                个人
              </p>
            )}
            <div className="space-y-1">
              {userMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                      ${isActive(item.href)
                        ? 'bg-gradient-to-r from-[#FF4757]/10 to-[#5F27CD]/10 text-[#FF4757] border border-[#FF4757]/20'
                        : 'text-slate-700 hover:bg-slate-100'
                      }
                    `}
                    title={isCollapsed ? item.name : ''}
                  >
                    <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'flex-shrink-0'}`} />
                    {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* 底部信息 */}
        <div className="border-t border-slate-200 p-4">
          {!isCollapsed && (
            <div className="text-xs text-slate-500">
              <p>© 2024 番茄AI</p>
              <p className="mt-1">为创作赋能</p>
            </div>
          )}
        </div>
      </aside>

      {/* 移动端打开按钮 */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg border border-slate-200"
      >
        <Menu className="h-5 w-5 text-slate-700" />
      </button>
    </>
  );
}
