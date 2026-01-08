'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, Clock } from 'lucide-react';
import BrandIcons from '@/lib/brandIcons';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import Navigation from '@/components/Navigation';

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <BrandIcons.Zap className="mx-auto animate-spin text-indigo-600" size={40} />
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* 左侧：用户信息卡片 */}
          <div className="lg:col-span-1">
            <Card className="card-shadow">
              <CardBody>
                {/* 头像和基本信息 */}
                <div className="flex flex-col items-center pb-6 border-b border-gray-200/50">
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                    <BrandIcons.Membership level={user?.membershipLevel} size={48} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{user?.username}</h2>
                  <p className="mt-1 text-sm text-gray-600">{user?.email}</p>
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-1.5 text-xs font-semibold text-indigo-700">
                      <BrandIcons.Crown size={12} />
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
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                      activeTab === 'overview'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BrandIcons.Home size={20} />
                    <span className="font-medium">概览</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                      activeTab === 'orders'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BrandIcons.Stats size={20} />
                    <span className="font-medium">订单历史</span>
                  </button>
                  <Link
                    href="/pricing"
                    className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <BrandIcons.Crown size={20} />
                    <span className="font-medium">升级会员</span>
                  </Link>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <BrandIcons.Settings size={20} />
                    <span className="font-medium">修改密码</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-all"
                  >
                    <BrandIcons.Efficiency size={20} />
                    <span className="font-medium">退出登录</span>
                  </button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 右侧：详细内容 */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 统计数据 */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card hover>
                    <CardBody>
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 p-3">
                          <BrandIcons.Zap size={24} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">总生成次数</p>
                          <p className="text-2xl font-bold gradient-text">{user?.totalGenerations}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                  <Card hover>
                    <CardBody>
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 p-3">
                          <BrandIcons.Book size={24} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">总生成字数</p>
                          <p className="text-2xl font-bold gradient-text">
                            {user?.totalWords ? (user.totalWords / 10000).toFixed(1) : 0}万字
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                  <Card hover>
                    <CardBody>
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-pink-100 to-pink-200 p-3">
                          <BrandIcons.Settings size={24} className="text-pink-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">注册时间</p>
                          <p className="text-2xl font-bold gradient-text">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '-'}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>

                {/* 会员权益说明 */}
                <Card>
                  <CardBody>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 p-2">
                        <BrandIcons.Crown size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">当前会员权益</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-green-100 p-1.5">
                          <CheckCircle size={18} className="text-green-600" />
                        </div>
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
                        <div className="rounded-lg bg-green-100 p-1.5">
                          <CheckCircle size={18} className="text-green-600" />
                        </div>
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
                        <div className="rounded-lg bg-green-100 p-1.5">
                          <CheckCircle size={18} className="text-green-600" />
                        </div>
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
                  </CardBody>
                </Card>
              </div>
            )}

            {activeTab === 'orders' && (
              <Card>
                <CardBody>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 p-2">
                      <BrandIcons.Stats size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">订单历史</h3>
                  </div>
                  {orders.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                        <BrandIcons.Stats size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500">暂无订单记录</p>
                      <Link
                        href="/pricing"
                        className="mt-4 inline-flex items-center gap-2"
                      >
                        <GradientButton icon={<BrandIcons.Crown size={16} />}>
                          购买会员
                        </GradientButton>
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
                            className="flex items-center justify-between rounded-xl border border-gray-200/50 p-4 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 p-3">
                                <BrandIcons.Membership level={order.level as any} size={20} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{getMembershipBadge(order.level).label}</p>
                                <p className="text-sm text-gray-600">{order.transactionId}</p>
                                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('zh-CN')}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold gradient-text">¥{(order.amount / 100).toFixed(2)}</p>
                              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                                status.color === 'green' ? 'bg-green-100 text-green-700' :
                                status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                <StatusIcon size={10} />
                                {status.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* 修改密码模态框 */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="mx-4 w-full max-w-md card-shadow">
            <CardBody>
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 p-2">
                  <BrandIcons.Settings size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">修改密码</h3>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">新密码</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="再次输入密码"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    variant="outline"
                    fullWidth
                  >
                    取消
                  </Button>
                  <GradientButton type="submit" fullWidth>
                    确认修改
                  </GradientButton>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
