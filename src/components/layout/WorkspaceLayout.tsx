'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="ml-0 md:ml-72 transition-all duration-300">
        {/* 顶部导航 */}
        <TopNav />

        {/* 内容区域 */}
        <main className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
