'use client';

import Link from 'next/link';
import { PenTool, User, LogOut, Bell, Search, Zap } from 'lucide-react';

export default function TopNav() {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/50 backdrop-blur-xl bg-opacity-90">
      <div className="flex h-full items-center justify-between px-6">
        {/* 左侧：面包屑和搜索 */}
        <div className="flex items-center gap-6">
          {/* 搜索框 */}
          <div className="hidden md:flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 w-80 border border-slate-200 focus-within:border-[#FF4757] focus-within:ring-2 focus-within:ring-[#FF4757]/10 transition-all">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索作品、章节、素材..."
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>
        </div>

        {/* 右侧：用户操作区 */}
        <div className="flex items-center gap-4">
          {/* 快速开始按钮 */}
          <Link
            href="/writing/chapter"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF4757] to-[#5F27CD] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#FF4757]/25 transition-all hover:scale-105"
          >
            <Zap className="h-4 w-4" />
            <span>快速开始</span>
          </Link>

          {/* 通知 */}
          <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FF4757]" />
          </button>

          {/* 用户菜单 */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900">创作者</p>
              <p className="text-xs text-slate-500">免费版</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4757] to-[#5F27CD] text-white font-semibold">
              <User className="h-5 w-5" />
            </div>
          </div>

          {/* 退出按钮 */}
          <Link
            href="/login"
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            title="退出登录"
          >
            <LogOut className="h-5 w-5 text-slate-600" />
          </Link>
        </div>
      </div>
    </header>
  );
}
