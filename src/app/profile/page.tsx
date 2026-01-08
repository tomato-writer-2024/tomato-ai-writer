'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Crown,
  Zap,
  History,
  Settings,
  LogOut,
  CreditCard,
  FileText,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
} from 'lucide-react';
import BrandIcons from '@/lib/brandIcons';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  membershipLevel: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  membershipExpireAt: string | null;
  totalGenerations: number;
  totalWords: number;
  createdAt: string;
}

interface Order {
  id: string;
  transactionId: string;
  level: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // 模拟获取用户信息
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // TODO: 实际调用API获取用户信息
      // const response = await fetch('/api/user/profile', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });

      // 模拟数据
      setUser({
        id: '1',
        username: '番茄作家',
        email: 'writer@example.com',
        membershipLevel: 'BASIC',
        membershipExpireAt: '2025-02-08',
        totalGenerations: 156,
        totalWords: 234000,
        createdAt: '2024-12-01',
      });

      // 模拟订单数据
      setOrders([
        {
          id: '1',
          transactionId: 'ORD20250108001',
          level: 'BASIC',
          amount: 2900,
          paymentStatus: 'PAID',
          createdAt: '2025-01-08',
        },
      ]);

      // 加载订单列表
      // const ordersResponse = await fetch('/api/orders', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // if (ordersResponse.ok) {
      //   const data = await ordersResponse.json();
      //   setOrders(data.data.orders);
      // }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      alert('密码长度至少为6位');
      return;
    }

    try {
      // TODO: 实际调用API修改密码
      // const response = await fetch('/api/user/password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      //   body: JSON.stringify({ newPassword })
      // });

      alert('密码修改成功！');
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('修改密码失败:', error);
      alert('修改密码失败，请稍后重试');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const getMembershipBadge = (level: string) => {
    const badges = {
      FREE: { label: '免费版', color: 'gray' },
      BASIC: { label: '基础版', color: 'indigo' },
      PREMIUM: { label: '高级版', color: 'pink' },
      ENTERPRISE: { label: '企业版', color: 'cyan' },
    };
    return badges[level as keyof typeof badges] || badges.FREE;
  };

  const getOrderStatusBadge = (status: string) => {
    const badges = {
      PENDING: { label: '待支付', color: 'yellow', icon: Clock },
      PAID: { label: '已支付', color: 'green', icon: CheckCircle },
      FAILED: { label: '支付失败', color: 'red', icon: Clock },
    };
    return badges[status as keyof typeof badges] || { label: '未知', color: 'gray', icon: Clock };
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Zap className="mx-auto animate-spin text-indigo-600" size={40} />
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/workspace" className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
                <BrandIcons.Logo size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                番茄AI写作助手
              </span>
            </Link>
            <Link
              href="/workspace"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md"
            >
              <FileText size={18} />
              返回工作区
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* 左侧：用户信息卡片 */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              {/* 头像和基本信息 */}
              <div className="flex flex-col items-center pb-6 border-b border-gray-200">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <User className="text-white" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.username}</h2>
                <p className="mt-1 text-sm text-gray-600">{user?.email}</p>
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-${getMembershipBadge(user?.membershipLevel || 'FREE').color}-100 text-${getMembershipBadge(user?.membershipLevel || 'FREE').color}-700`}>
                    <Crown size={12} />
                    {getMembershipBadge(user?.membershipLevel || 'FREE').label}
                  </span>
                </div>
                {user?.membershipLevel !== 'FREE' && user?.membershipExpireAt && (
                  <p className="mt-2 text-xs text-gray-500">
                    到期时间: {user.membershipExpireAt}
                  </p>
                )}
              </div>

              {/* 快捷操作 */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                    activeTab === 'overview'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User size={20} />
                  <span className="font-medium">概览</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                    activeTab === 'orders'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <History size={20} />
                  <span className="font-medium">订单历史</span>
                </button>
                <Link
                  href="/pricing"
                  className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <CreditCard size={20} />
                  <span className="font-medium">升级会员</span>
                </Link>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <Settings size={20} />
                  <span className="font-medium">修改密码</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut size={20} />
                  <span className="font-medium">退出登录</span>
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：详细内容 */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 统计数据 */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-indigo-100 p-3">
                        <Zap className="text-indigo-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">总生成次数</p>
                        <p className="text-2xl font-bold text-gray-900">{user?.totalGenerations}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-purple-100 p-3">
                        <FileText className="text-purple-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">总生成字数</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {user?.totalWords ? (user.totalWords / 10000).toFixed(1) : 0}万字
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-pink-100 p-3">
                        <Calendar className="text-pink-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">注册时间</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 会员权益说明 */}
                <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                    <Crown className="text-indigo-600" size={20} />
                    当前会员权益
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 text-green-500 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">AI生成次数</p>
                        <p className="text-sm text-gray-600">
                          {user?.membershipLevel === 'FREE' && '每天5次'}
                          {user?.membershipLevel === 'BASIC' && '每天30次'}
                          {(user?.membershipLevel === 'PREMIUM' || user?.membershipLevel === 'ENTERPRISE') && '无限次'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 text-green-500 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">单次生成字数</p>
                        <p className="text-sm text-gray-600">
                          {user?.membershipLevel === 'FREE' && '2000字'}
                          {user?.membershipLevel === 'BASIC' && '3000字'}
                          {user?.membershipLevel === 'PREMIUM' && '5000字'}
                          {user?.membershipLevel === 'ENTERPRISE' && '10000字'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 text-green-500 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">导出格式</p>
                        <p className="text-sm text-gray-600">
                          {user?.membershipLevel === 'FREE' && 'TXT'}
                          {user?.membershipLevel === 'BASIC' && 'TXT、DOCX'}
                          {(user?.membershipLevel === 'PREMIUM' || user?.membershipLevel === 'ENTERPRISE') && 'TXT、DOCX、PDF'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <History className="text-indigo-600" size={20} />
                  订单历史
                </h3>
                {orders.length === 0 ? (
                  <div className="py-12 text-center">
                    <History className="mx-auto mb-4 text-gray-300" size={48} />
                    <p className="text-gray-500">暂无订单记录</p>
                    <Link
                      href="/pricing"
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 transition-all"
                    >
                      <CreditCard size={16} />
                      购买会员
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const status = getOrderStatusBadge(order.paymentStatus);
                      const StatusIcon = status.icon;
                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:bg-gray-50 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-gray-100 p-3">
                              <CreditCard className="text-gray-600" size={20} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{getMembershipBadge(order.level).label}</p>
                              <p className="text-sm text-gray-600">{order.transactionId}</p>
                              <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('zh-CN')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">¥{(order.amount / 100).toFixed(2)}</p>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-${status.color}-100 text-${status.color}-700`}>
                              <StatusIcon size={10} />
                              {status.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 修改密码模态框 */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-6 text-xl font-bold text-gray-900">修改密码</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="至少6位密码"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">确认密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="再次输入密码"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 font-medium text-white hover:from-indigo-600 hover:to-purple-700 transition-all"
                >
                  确认修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
