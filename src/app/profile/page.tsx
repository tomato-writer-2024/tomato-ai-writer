'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import BrandIcons from '@/lib/brandIcons';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input } from '@/components/Input';
import { MembershipBadge } from '@/components/Badge';
import Navigation from '@/components/Navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/Tabs';
import { User, Mail, Phone, MapPin, Calendar, Crown, TrendingUp, Award, Settings, Bell, Shield, Lock, Download, Upload, Camera, Loader2 } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl?: string;
  membership: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  joinDate: string;
  totalWords: number;
  totalNovels: number;
  averageRating: number;
}

interface MembershipPlan {
  level: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const membershipPlans: MembershipPlan[] = [
  {
    level: 'FREE',
    name: '免费版',
    price: 0,
    features: [
      '每天5次AI生成',
      '基础章节撰写',
      '标准润色功能',
      '单次生成2000字',
      '100MB存储空间',
    ],
  },
  {
    level: 'BASIC',
    name: '基础版',
    price: 29,
    features: [
      '每天30次AI生成',
      '智能章节续写',
      '高级润色功能',
      '单次生成3000字',
      '1GB存储空间',
      '爽点密度分析',
      '完读率预测',
    ],
  },
  {
    level: 'PREMIUM',
    name: '高级版',
    price: 99,
    features: [
      '无限次AI生成',
      '多风格创作',
      '专业润色工坊',
      '单次生成5000字',
      '10GB存储空间',
      '剧情逻辑分析',
      '角色一致性保障',
      '批量章节生成',
      'VIP专属客服',
    ],
    popular: true,
  },
  {
    level: 'ENTERPRISE',
    name: '企业版',
    price: 299,
    features: [
      '所有高级版功能',
      '更大存储空间（50GB）',
      '优先技术支持',
      '功能优先体验',
      '企业级安全保障',
    ],
  },
];

const membershipNames = {
  FREE: '免费用户',
  BASIC: '基础会员',
  PREMIUM: '高级会员',
  ENTERPRISE: '企业用户',
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
  });
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // 加载用户信息
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('加载用户信息失败');
      }

      const result = await response.json();
      if (result.success) {
        setUser(result.data);
        setFormData({
          username: result.data.username,
          email: result.data.email,
          phone: result.data.phone || '',
          location: result.data.location || '',
        });
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      // 使用localStorage中的用户信息作为fallback
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const localUser = JSON.parse(userStr);
        setUser(localUser);
        setFormData({
          username: localUser.username,
          email: localUser.email,
          phone: localUser.phone || '',
          location: localUser.location || '',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('保存用户信息失败');
      }

      const result = await response.json();
      if (result.success) {
        alert('用户信息保存成功！');
        setIsEditing(false);
        loadUserProfile(); // 重新加载用户信息
      }
    } catch (error) {
      console.error('保存用户信息失败:', error);
      alert('保存失败，请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('请选择图片文件（jpg, png, gif, webp）');
      return;
    }

    // 验证文件大小（限制为2MB）
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      alert('图片大小不能超过2MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传头像失败');
      }

      const result = await response.json();
      if (result.success) {
        alert('头像上传成功！');
        loadUserProfile(); // 重新加载用户信息
      }
    } catch (error) {
      console.error('上传头像失败:', error);
      alert('上传失败，请稍后重试');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleUpgrade = (level: 'BASIC' | 'PREMIUM' | 'ENTERPRISE' | 'FREE') => {
    if (level === 'FREE') return; // FREE不需要升级
    window.location.href = `/payment?plan=${level}`;
  };

  const getStatCard = (title: string, value: string, icon: React.ReactNode, color: string) => (
    <div className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg">
      <div className={`rounded-xl bg-gradient-to-br ${color} p-3 shadow-md`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
          <p className="mt-2 text-gray-600">管理你的账户信息和会员服务</p>
        </div>

        {/* 用户信息卡片 */}
        <Card className="mb-8">
          <CardBody>
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              {/* 头像 */}
              <div className="relative">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg overflow-hidden">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={64} className="text-white" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <BrandIcons.Membership level={user?.membership || 'FREE'} size={40} />
                </div>
                {/* 头像上传按钮 */}
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 p-2 text-white shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  title="上传头像"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Camera size={16} />
                  )}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* 用户信息 */}
              <div className="flex-1 text-center md:text-left">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                  </div>
                ) : user ? (
                  <>
                    <div className="mb-4 flex flex-col items-center gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                          <MembershipBadge level={user.membership} />
                          <span className="text-sm text-gray-500">
                            加入于 {new Date(user.joinDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {!isEditing && (
                        <Button
                          variant="outline"
                          icon={<Settings size={18} />}
                          onClick={() => setIsEditing(true)}
                        >
                          编辑资料
                        </Button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Input
                            label="用户名"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            icon={<User size={20} className="text-gray-400" />}
                            fullWidth
                          />
                          <Input
                            label="邮箱"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            icon={<Mail size={20} className="text-gray-400" />}
                            fullWidth
                          />
                          <Input
                            label="手机号"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            icon={<Phone size={20} className="text-gray-400" />}
                            fullWidth
                          />
                          <Input
                            label="所在地"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            icon={<MapPin size={20} className="text-gray-400" />}
                            fullWidth
                          />
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={isSaving}
                          >
                            取消
                          </Button>
                          <GradientButton
                            onClick={handleSave}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 animate-spin" size={16} />
                                保存中...
                              </>
                            ) : (
                              '保存修改'
                            )}
                          </GradientButton>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail size={18} className="text-gray-500" />
                          <span className="text-gray-700">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={18} className="text-gray-500" />
                          <span className="text-gray-700">{user.phone || '未设置'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={18} className="text-gray-500" />
                          <span className="text-gray-700">{user.location || '未设置'}</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    无法加载用户信息
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 统计卡片 */}
        {!isLoading && user && (
          <div className="mb-8 grid gap-6 md:grid-cols-4">
            {getStatCard(
              '总字数',
              Math.round(user.totalWords / 10000) + '万',
              <BrandIcons.Writing size={24} className="text-white" />,
              'from-indigo-500 to-indigo-600'
            )}
            {getStatCard(
              '作品数量',
              user.totalNovels.toString(),
              <BrandIcons.Book size={24} className="text-white" />,
              'from-purple-500 to-purple-600'
            )}
            {getStatCard(
              '平均评分',
              user.averageRating.toFixed(1),
              <Award size={24} className="text-yellow-400 fill-yellow-400 text-white" />,
              'from-pink-500 to-pink-600'
            )}
            {getStatCard(
              '会员等级',
              membershipNames[user.membership],
              <Crown size={24} className="text-white" />,
              'from-orange-500 to-orange-600'
            )}
          </div>
        )}

        {/* 功能标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="membership">会员服务</TabsTrigger>
            <TabsTrigger value="settings">账户设置</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardBody>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 p-2">
                      <TrendingUp size={20} className="text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">写作趋势</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-gray-600">本周写作</span>
                        <span className="font-semibold text-gray-900">12,500字</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                          style={{ width: '65%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-gray-600">本月写作</span>
                        <span className="font-semibold text-gray-900">45,600字</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600"
                          style={{ width: '78%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-gray-600">年度写作</span>
                        <span className="font-semibold text-gray-900">856,000字</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-600"
                          style={{ width: '85%' }}
                        />
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 p-2">
                      <BrandIcons.Quality size={20} className="text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">质量分析</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <span className="text-sm text-gray-600">平均完读率</span>
                      <span className="text-lg font-bold text-green-600">82%</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <span className="text-sm text-gray-600">最高评分</span>
                      <span className="text-lg font-bold text-indigo-600">9.5</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <span className="text-sm text-gray-600">签约作品</span>
                      <span className="text-lg font-bold text-purple-600">4部</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <span className="text-sm text-gray-600">爆款作品</span>
                      <span className="text-lg font-bold text-pink-600">2部</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="membership" className="mt-6">
            <div className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">会员套餐</h3>
                  <p className="text-gray-600">选择适合你的会员计划</p>
                </div>
                {!isLoading && user && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">当前套餐:</span>
                    <MembershipBadge level={user.membership} />
                  </div>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {membershipPlans.map((plan) => (
                  <Card
                    key={plan.level}
                    hover
                    className={`relative h-full ${
                      plan.popular
                        ? 'border-2 border-indigo-500 shadow-xl'
                        : ''
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1 text-xs font-semibold text-white shadow-md">
                          最受欢迎
                        </span>
                      </div>
                    )}
                    <CardBody className="flex h-full flex-col">
                      <div className="mb-6 text-center">
                        <div className="mb-3 flex justify-center">
                          <BrandIcons.Membership level={plan.level} size={64} />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                        <div className="mt-2 flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            ¥{plan.price}
                          </span>
                          <span className="text-sm text-gray-600">/月</span>
                        </div>
                      </div>

                      <ul className="mb-6 flex-1 space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                            <BrandIcons.Quality size={16} className="mt-0.5 flex-shrink-0 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {user && plan.level === user.membership ? (
                        <Button variant="outline" fullWidth disabled>
                          当前套餐
                        </Button>
                      ) : (
                        <Button
                          variant={plan.popular ? 'primary' : 'outline'}
                          fullWidth
                          onClick={() => handleUpgrade(plan.level)}
                        >
                          {plan.level === 'FREE' ? '免费使用' : '立即升级'}
                        </Button>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardBody>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 p-2">
                      <Lock size={20} className="text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">安全设置</h3>
                  </div>
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      fullWidth
                      icon={<Lock size={18} />}
                    >
                      修改密码
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      icon={<Shield size={18} />}
                    >
                      两步验证
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      icon={<Phone size={18} />}
                    >
                      绑定手机
                    </Button>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 p-2">
                      <Bell size={20} className="text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">通知设置</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                      <span className="text-sm font-medium text-gray-900">邮件通知</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors">
                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                      <span className="text-sm font-medium text-gray-900">短信通知</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                      <span className="text-sm font-medium text-gray-900">系统消息</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors">
                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                      </button>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="md:col-span-2">
                <CardBody>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-gradient-to-br from-orange-100 to-red-100 p-2">
                      <Download size={20} className="text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">数据导出</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button
                      variant="outline"
                      fullWidth
                      icon={<Download size={18} />}
                    >
                      导出作品数据
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      icon={<Download size={18} />}
                    >
                      导出账户信息
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      icon={<Download size={18} />}
                    >
                      导出订单记录
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
