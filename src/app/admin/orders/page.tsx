'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Clock, XCircle, ArrowLeft, RefreshCw, Download } from 'lucide-react';
import { BrandIcons } from '@/lib/brandIcons';
import Button from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import Navigation from '@/components/Navigation';
import { Badge } from '@/components/Badge';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [filterStatus, currentPage]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const statusParam = filterStatus === 'ALL' ? '' : `&status=${filterStatus}`;
      const response = await fetch(`/api/admin/orders?page=${currentPage}&limit=20${statusParam}`);
      if (!response.ok) {
        throw new Error('加载订单列表失败');
      }

      const result = await response.json();
      if (result.success) {
        setOrders(result.data.orders || []);
      } else {
        throw new Error(result.error || '加载订单列表失败');
      }
    } catch (error) {
      console.error('加载订单列表失败:', error);
      alert(error instanceof Error ? error.message : '加载订单列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success" icon={<CheckCircle size={14} />}>已支付</Badge>;
      case 'PENDING':
        return <Badge variant="warning" icon={<Clock size={14} />}>待支付</Badge>;
      case 'FAILED':
        return <Badge variant="danger" icon={<XCircle size={14} />}>已失败</Badge>;
      case 'EXPIRED':
        return <Badge variant="default" icon={<Clock size={14} />}>已过期</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'FREE':
        return <Badge variant="default">免费版</Badge>;
      case 'BASIC':
        return <Badge variant="info">基础版</Badge>;
      case 'PREMIUM':
        return <Badge variant="success">高级版</Badge>;
      case 'ENTERPRISE':
        return <Badge variant="warning">企业版</Badge>;
      default:
        return <Badge variant="default">{level}</Badge>;
    }
  };

  const exportOrders = () => {
    // 简单的CSV导出
    const headers = ['订单ID', '用户ID', '套餐', '金额', '支付方式', '状态', '创建时间'];
    const rows = orders.map(order => [
      order.id,
      order.userId,
      order.level,
      `¥${(order.amount / 100).toFixed(2)}`,
      order.paymentMethod,
      order.paymentStatus,
      formatDate(order.createdAt),
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            返回
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">订单管理</h1>
              <p className="mt-2 text-gray-600">查看和管理所有用户订单</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                icon={<RefreshCw size={18} />}
                onClick={loadOrders}
              >
                刷新
              </Button>
              <Button
                variant="secondary"
                icon={<Download size={18} />}
                onClick={exportOrders}
              >
                导出
              </Button>
            </div>
          </div>
        </div>

        {/* 过滤器 */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'PENDING', 'PAID', 'FAILED', 'EXPIRED'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => {
                    setFilterStatus(status);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {status === 'ALL' && '全部'}
                  {status === 'PENDING' && '待支付'}
                  {status === 'PAID' && '已支付'}
                  {status === 'FAILED' && '已失败'}
                  {status === 'EXPIRED' && '已过期'}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* 订单列表 */}
        <Card>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Clock className="animate-spin text-indigo-600" size={40} />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <BrandIcons.Membership level="FREE" size={48} className="mb-4" />
                <p>暂无订单数据</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">订单ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">套餐</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">金额</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">支付方式</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">状态</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">创建时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <code className="text-sm text-gray-700">{order.id.slice(0, 8)}...</code>
                        </td>
                        <td className="px-6 py-4">
                          {getLevelBadge(order.level)}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          ¥{(order.amount / 100).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.paymentMethod === 'wechat' ? '微信支付' : order.paymentMethod}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(order.paymentStatus)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* 分页 */}
        {orders.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              上一页
            </Button>
            <span className="text-sm text-gray-600">第 {currentPage} 页</span>
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={orders.length < 20}
            >
              下一页
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
