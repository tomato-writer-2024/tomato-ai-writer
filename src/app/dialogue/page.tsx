'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { BrandIcons } from '@/lib/brandIcons';
import Button from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea } from '@/components/Input';
import Navigation from '@/components/Navigation';
import VoiceInput from '@/components/VoiceInput';
import { Loader2, Send, MessageSquare, Sparkles, History, Trash2, Save, BookOpen, Wand2, User, Bot, Copy, Check } from 'lucide-react';

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
  const [selectedNovelId, setSelectedNovelId] = useState('');
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

  const handleSaveDialogue = async () => {
    const dialogueText = messages.map(m => `${m.role === 'user' ? '我' : 'AI'}：${m.content}`).join('\n\n');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('请先登录');
      }

      const response = await fetch('/api/versions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          novelId: selectedNovelId,
          contentType: 'dialogue',
          content: dialogueText,
          description: '对话式写作记录',
          tags: ['dialogue'],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '保存失败');
      }

      alert('对话记录已保存');
    } catch (error) {
      console.error('保存失败:', error);
      alert(error instanceof Error ? error.message : '保存失败，请稍后重试');
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50/30 to-pink-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-red-500" />
            AI对话式写作
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            与AI助手协作创作，实时获得专业建议和创作方案
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧设置面板 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardBody>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  写作设置
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      题材类型
                    </label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                    >
                      <option value="">请选择题材</option>
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      上下文信息
                    </label>
                    <Textarea
                      placeholder="输入前文剧情、人物设定等上下文..."
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearMessages}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      清空
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveDialogue}
                      disabled={!selectedNovelId}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      保存
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 右侧对话区域 */}
          <div className="lg:col-span-3">
            <Card className="min-h-[600px] flex flex-col">
              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[calc(100vh-300px)]">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-6">
                      <Wand2 className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      开始对话式创作
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md">
                      与AI助手协作创作，输入您的创作需求，AI会提供专业建议和创作方案
                    </p>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                      <button
                        onClick={() => setInput('帮我设计一个都市爽文的开头')}
                        className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-left hover:border-red-300 dark:hover:border-red-700 transition-colors"
                      >
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          设计爽文开头
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          快速生成黄金开篇
                        </div>
                      </button>
                      <button
                        onClick={() => setInput('我的主角叫林逸，想要一个装逼爽点')}
                        className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-left hover:border-red-300 dark:hover:border-red-700 transition-colors"
                      >
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          设计装逼爽点
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          主角林逸的爆点设计
                        </div>
                      </button>
                      <button
                        onClick={() => setInput('帮我设计一个反转剧情')}
                        className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-left hover:border-red-300 dark:hover:border-red-700 transition-colors"
                      >
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          设计反转剧情
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          制造意外和惊喜
                        </div>
                      </button>
                      <button
                        onClick={() => setInput('帮我润色这段文字：这里要填入需要润色的文字')}
                        className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-left hover:border-red-300 dark:hover:border-red-700 transition-colors"
                      >
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          润色文字
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
                            ? 'bg-gradient-to-br from-red-500 to-orange-500'
                            : 'bg-gradient-to-br from-blue-500 to-purple-500'
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
                            ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                        }
                      `}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>

                      {message.role === 'assistant' && message.content && (
                        <button
                          onClick={() => handleCopyContent(message.content)}
                          className="mt-2 text-xs flex items-center gap-1 opacity-60 hover:opacity-100"
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
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 rounded-2xl px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">AI正在思考...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                <div className="flex gap-3">
                  <VoiceInput onTranscript={handleVoiceInput} disabled={isLoading} />
                  <div className="flex-1 relative">
                    <Textarea
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
                      className="resize-none"
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="h-full"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  按 Enter 发送，Shift + Enter 换行
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
