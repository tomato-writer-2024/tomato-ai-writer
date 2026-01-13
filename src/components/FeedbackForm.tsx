'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle2, AlertCircle, Bug, Lightbulb, MessageSquare, AlertTriangle, FileText } from 'lucide-react';
import { getToken } from '@/lib/auth-client';

interface FeedbackFormData {
  type: 'bug' | 'feature' | 'feedback' | 'complaint' | 'other';
  category: 'general' | 'ui' | 'performance' | 'ai' | 'payment' | 'other';
  subject: string;
  description: string;
  email: string;
}

const typeOptions = [
  { value: 'bug', label: 'Bug反馈', icon: Bug, description: '报告产品中的问题或错误' },
  { value: 'feature', label: '功能建议', icon: Lightbulb, description: '建议新功能或改进现有功能' },
  { value: 'feedback', label: '使用反馈', icon: MessageSquare, description: '分享您的使用体验和建议' },
  { value: 'complaint', label: '投诉', icon: AlertTriangle, description: '对产品或服务的投诉' },
  { value: 'other', label: '其他', icon: FileText, description: '其他类型的反馈' },
];

const categoryOptions = [
  { value: 'general', label: '常规问题' },
  { value: 'ui', label: '界面问题' },
  { value: 'performance', label: '性能问题' },
  { value: 'ai', label: 'AI生成' },
  { value: 'payment', label: '支付问题' },
  { value: 'other', label: '其他' },
];

export default function FeedbackForm() {
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'feedback',
    category: 'general',
    subject: '',
    description: '',
    email: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证表单
    if (!formData.subject.trim()) {
      setErrorMessage('请输入反馈主题');
      setSubmitStatus('error');
      return;
    }

    if (formData.subject.length > 200) {
      setErrorMessage('主题不能超过200字');
      setSubmitStatus('error');
      return;
    }

    if (!formData.description.trim()) {
      setErrorMessage('请输入详细描述');
      setSubmitStatus('error');
      return;
    }

    if (formData.description.length > 5000) {
      setErrorMessage('描述不能超过5000字');
      setSubmitStatus('error');
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('邮箱格式不正确');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const token = getToken();
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        // 重置表单
        setFormData({
          type: 'feedback',
          category: 'general',
          subject: '',
          description: '',
          email: '',
        });
      } else {
        setErrorMessage(result.error || '提交失败，请稍后重试');
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
      setErrorMessage('网络错误，请稍后重试');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const option = typeOptions.find(opt => opt.value === type);
    if (!option) return null;

    const Icon = option.icon;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            用户反馈
          </h1>
          <p className="text-slate-600">
            您的意见对我们非常重要，感谢您的反馈！
          </p>
        </div>

        {submitStatus === 'success' ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              提交成功！
            </h2>
            <p className="text-slate-600 mb-6">
              感谢您的反馈！我们会尽快处理您的意见。
            </p>
            <button
              onClick={() => setSubmitStatus('idle')}
              className="text-[#FF4757] font-medium hover:underline"
            >
              提交新的反馈
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 反馈类型 */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">
                反馈类型
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: option.value as any })}
                    className={`
                      flex flex-col items-center p-4 rounded-xl border-2 transition-all
                      ${formData.type === option.value
                        ? 'border-[#FF4757] bg-red-50 text-[#FF4757]'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }
                    `}
                  >
                    {getTypeIcon(option.value)}
                    <span className="text-sm font-medium mt-2">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 反馈分类 */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-900 mb-2">
                反馈分类
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF4757] focus:border-transparent transition-all"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 反馈主题 */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-900 mb-2">
                主题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="简要描述您的反馈主题"
                maxLength={200}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF4757] focus:border-transparent transition-all"
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.subject.length}/200 字
              </p>
            </div>

            {/* 详细描述 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-900 mb-2">
                详细描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请详细描述您的问题、建议或反馈"
                rows={6}
                maxLength={5000}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF4757] focus:border-transparent transition-all resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.description.length}/5000 字
              </p>
            </div>

            {/* 联系邮箱 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">
                联系邮箱（可选）
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="用于接收反馈处理通知"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF4757] focus:border-transparent transition-all"
              />
            </div>

            {/* 错误提示 */}
            {submitStatus === 'error' && errorMessage && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF4757] to-[#FF6B81] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FF4757]/25 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>提交中...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>提交反馈</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
