'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Keyboard,
  Globe,
  Save,
  LogOut,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';
import { getToken, removeToken } from '@/lib/auth-client';

export default function SettingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [settings, setSettings] = useState({
    // 用户设置
    username: '',
    email: '',
    // 通知设置
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    // 界面设置
    theme: 'light' as 'light' | 'dark' | 'auto',
    language: 'zh-CN',
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    // 快捷键设置
    enableShortcuts: true,
    // 隐私设置
    publicProfile: false,
    showStats: true,
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    try {
      // 从localStorage加载设置
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }

      // 从API加载用户信息
      const response = await fetch('/api/user/profile', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSettings(prev => ({
            ...prev,
            username: result.data.username || prev.username,
            email: result.data.email || prev.email,
          }));
        }
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // 保存到localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('保存设置失败:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      removeToken();
      router.push('/login');
    }
  };

  const SettingItem = ({
    icon: Icon,
    title,
    description,
    action,
  }: {
    icon: any;
    title: string;
    description?: string;
    action: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand/10 to-brand-dark/10 text-brand dark:text-brand-light">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          {description && (
            <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
          )}
        </div>
      </div>
      <div>{action}</div>
    </div>
  );

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`
        relative h-6 w-11 rounded-full transition-colors duration-200
        ${checked ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-600'}
      `}
    >
      <span
        className={`
          absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200
          ${checked ? 'translate-x-5' : 'translate-x-0.5'}
        `}
      />
    </button>
  );

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">⏳</div>
          <p className="text-slate-600 dark:text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50/30 to-pink-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/workspace" className="flex items-center gap-3">
              <div className="text-2xl">🍅</div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
                番茄AI写作助手
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand to-brand-dark px-4 py-2 text-sm font-medium text-white hover:from-brand-dark hover:to-brand transition-all disabled:opacity-50"
              >
                {saveStatus === 'saved' ? <Check size={18} /> : <Save size={18} />}
                {saveStatus === 'saved' ? '已保存' : saveStatus === 'saving' ? '保存中...' : '保存设置'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
            <Settings size={36} className="text-brand" />
            设置
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            管理您的账户设置、偏好和隐私选项
          </p>
        </div>

        {/* 用户信息 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <User size={20} />
            账户信息
          </h2>
          <div className="space-y-3">
            <SettingItem
              icon={User}
              title="用户名"
              description={settings.username}
              action={
                <ChevronRight size={20} className="text-slate-400" />
              }
            />
            <SettingItem
              icon={Bell}
              title="邮箱"
              description={settings.email}
              action={
                <ChevronRight size={20} className="text-slate-400" />
              }
            />
          </div>
        </div>

        {/* 通知设置 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Bell size={20} />
            通知设置
          </h2>
          <div className="space-y-3">
            <SettingItem
              icon={Bell}
              title="邮件通知"
              description="接收重要更新和提醒"
              action={
                <ToggleSwitch
                  checked={settings.emailNotifications}
                  onChange={(value) => setSettings(prev => ({ ...prev, emailNotifications: value }))}
                />
              }
            />
            <SettingItem
              icon={Bell}
              title="推送通知"
              description="接收浏览器推送通知"
              action={
                <ToggleSwitch
                  checked={settings.pushNotifications}
                  onChange={(value) => setSettings(prev => ({ ...prev, pushNotifications: value }))}
                />
              }
            />
            <SettingItem
              icon={Bell}
              title="周报"
              description="每周发送创作数据报告"
              action={
                <ToggleSwitch
                  checked={settings.weeklyReport}
                  onChange={(value) => setSettings(prev => ({ ...prev, weeklyReport: value }))}
                />
              }
            />
          </div>
        </div>

        {/* 界面设置 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Palette size={20} />
            界面设置
          </h2>
          <div className="space-y-3">
            <SettingItem
              icon={Palette}
              title="主题"
              description={
                settings.theme === 'light' ? '浅色' : settings.theme === 'dark' ? '深色' : '自动'
              }
              action={
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as any }))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                >
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                  <option value="auto">自动</option>
                </select>
              }
            />
            <SettingItem
              icon={Globe}
              title="语言"
              description="简体中文"
              action={
                <select
                  value={settings.language}
                  onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English</option>
                </select>
              }
            />
            <SettingItem
              icon={Palette}
              title="字体大小"
              description={settings.fontSize === 'small' ? '小' : settings.fontSize === 'medium' ? '中' : '大'}
              action={
                <select
                  value={settings.fontSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, fontSize: e.target.value as any }))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                >
                  <option value="small">小</option>
                  <option value="medium">中</option>
                  <option value="large">大</option>
                </select>
              }
            />
          </div>
        </div>

        {/* 快捷键设置 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Keyboard size={20} />
            快捷键
          </h2>
          <div className="space-y-3">
            <SettingItem
              icon={Keyboard}
              title="启用快捷键"
              description="使用键盘快捷键快速访问功能"
              action={
                <ToggleSwitch
                  checked={settings.enableShortcuts}
                  onChange={(value) => setSettings(prev => ({ ...prev, enableShortcuts: value }))}
                />
              }
            />
          </div>
        </div>

        {/* 隐私设置 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Shield size={20} />
            隐私设置
          </h2>
          <div className="space-y-3">
            <SettingItem
              icon={Shield}
              title="公开个人资料"
              description="允许其他用户查看您的个人资料"
              action={
                <ToggleSwitch
                  checked={settings.publicProfile}
                  onChange={(value) => setSettings(prev => ({ ...prev, publicProfile: value }))}
                />
              }
            />
            <SettingItem
              icon={Shield}
              title="显示创作统计"
              description="在个人资料中显示创作数据"
              action={
                <ToggleSwitch
                  checked={settings.showStats}
                  onChange={(value) => setSettings(prev => ({ ...prev, showStats: value }))}
                />
              }
            />
          </div>
        </div>

        {/* 退出登录 */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border-2 border-red-500 px-6 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={20} />
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
}
