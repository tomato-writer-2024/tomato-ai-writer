'use client';

import { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import VoiceInput from '@/components/VoiceInput';
import { Loader2, Send, MessageSquare, Sparkles, Trash2, Save, Wand2, User, Bot, Copy, Check } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function DialogueWritingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [context, setContext] = useState('');
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const genres = [
    '都市爽文',
    '玄幻修仙',
    '历史架空',
    '武侠江湖',
    '科幻未来',
    '灵异悬疑',
    '总裁豪门',
    '重生穿越',
    '系统流',
    '其他',
  ];

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('请先登录');
      }

      const response = await fetch('/api/ai/dialogue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context,
          genre: selectedGenre,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '发送失败');
      }

      // 流式读取响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantContent += chunk;

          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessage.id
                ? { ...msg, content: assistantContent }
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      alert(error instanceof Error ? error.message : '发送失败，请稍后重试');

      // 移除失败的助手消息
      setMessages(prev => prev.filter(msg => msg.id !== (Date.now() + 1).toString()));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearMessages = () => {
    if (confirm('确定要清空所有对话吗？')) {
      setMessages([]);
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVoiceInput = (text: string) => {
    setInput(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="ml-0 md:ml-72 transition-all duration-300">
        {/* 顶部导航 */}
        <TopNav />

        {/* 内容区域 */}
        <main className="px-6 py-8">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-[#FF4757]" />
              AI对话式写作
            </h1>
            <p className="text-slate-600">
              与AI助手协作创作，实时获得专业建议和创作方案
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 左侧设置面板 */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF4757]" />
                  写作设置
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      题材类型
                    </label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-[#FF4757] focus:ring-2 focus:ring-red-200 outline-none transition-all"
                    >
                      <option value="">请选择题材</option>
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      上下文信息
                    </label>
                    <textarea
                      placeholder="输入前文剧情、人物设定等上下文..."
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-[#FF4757] focus:ring-2 focus:ring-red-200 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleClearMessages}
                      className="flex-1 px-4 py-2 rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      清空
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧对话区域 */}
            <div className="lg:col-span-3">
              <div className="min-h-[600px] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-sm">
                {/* 消息列表 */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[calc(100vh-300px)]">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-[#FF4757] to-[#FF6B81] rounded-full flex items-center justify-center mb-6">
                        <Wand2 className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        开始对话式创作
                      </h3>
                      <p className="text-slate-600 max-w-md">
                        与AI助手协作创作，输入您的创作需求，AI会提供专业建议和创作方案
                      </p>
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                        <button
                          onClick={() => setInput('帮我设计一个都市爽文的开头')}
                          className="p-3 bg-white rounded-lg border border-slate-200 text-left hover:border-[#FF4757] transition-colors"
                        >
                          <div className="text-sm font-medium text-slate-900">
                            设计爽文开头
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            快速生成黄金开篇
                          </div>
                        </button>
                        <button
                          onClick={() => setInput('我的主角叫林逸，想要一个装逼爽点')}
                          className="p-3 bg-white rounded-lg border border-slate-200 text-left hover:border-[#FF4757] transition-colors"
                        >
                          <div className="text-sm font-medium text-slate-900">
                            设计装逼爽点
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            主角林逸的爆点设计
                          </div>
                        </button>
                        <button
                          onClick={() => setInput('帮我设计一个反转剧情')}
                          className="p-3 bg-white rounded-lg border border-slate-200 text-left hover:border-[#FF4757] transition-colors"
                        >
                          <div className="text-sm font-medium text-slate-900">
                            设计反转剧情
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            制造意外和惊喜
                          </div>
                        </button>
                        <button
                          onClick={() => setInput('帮我润色这段文字：这里要填入需要润色的文字')}
                          className="p-3 bg-white rounded-lg border border-slate-200 text-left hover:border-[#FF4757] transition-colors"
                        >
                          <div className="text-sm font-medium text-slate-900">
                            润色文字
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            优化文笔和表达
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`
                          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                          ${
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-[#FF4757] to-[#FF6B81]'
                              : 'bg-gradient-to-br from-[#5F27CD] to-[#9B59B6]'
                          }
                        `}
                      >
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>

                      <div
                        className={`
                          flex-1 rounded-2xl px-4 py-3 max-w-[80%]
                          ${
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-[#FF4757] to-[#FF6B81] text-white'
                              : 'bg-white text-slate-900 border border-slate-200'
                          }
                        `}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>

                        {message.role === 'assistant' && message.content && (
                          <button
                            onClick={() => handleCopyContent(message.content)}
                            className="mt-2 text-xs flex items-center gap-1 opacity-60 hover:opacity-100 text-slate-600"
                          >
                            {copied ? (
                              <>
                                <Check className="w-3 h-3" />
                                已复制
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                复制
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#5F27CD] to-[#9B59B6] flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 rounded-2xl px-4 py-3 bg-white border border-slate-200">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#FF4757]" />
                          <span className="text-sm text-slate-600">AI正在思考...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* 输入区域 */}
                <div className="border-t border-slate-200 p-4">
                  <div className="flex gap-3">
                    <VoiceInput onTranscript={handleVoiceInput} disabled={isLoading} />
                    <div className="flex-1 relative">
                      <textarea
                        placeholder="输入您的创作需求..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-[#FF4757] focus:ring-2 focus:ring-red-200 outline-none transition-all resize-none"
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading}
                      className="h-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF4757] to-[#5F27CD] text-white font-semibold hover:shadow-lg hover:shadow-[#FF4757]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    按 Enter 发送，Shift + Enter 换行
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
