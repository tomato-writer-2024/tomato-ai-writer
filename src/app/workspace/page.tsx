'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState('write');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chapterNum, setChapterNum] = useState(1);
  const [storyContext, setStoryContext] = useState('');
  const [characterInfo, setCharacterInfo] = useState('');
  const [plotOutline, setPlotOutline] = useState('');
  const [wordCount, setWordCount] = useState(2500);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('请输入创作提示');
      return;
    }

    setIsLoading(true);
    setGeneratedContent('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chapter',
          prompt,
          chapterNum,
          context: storyContext,
          characters: characterInfo,
          outline: plotOutline,
          wordCount,
        }),
      });

      if (!response.ok) {
        throw new Error('生成失败');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let fullContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setGeneratedContent(fullContent);
      }

    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePolish = async () => {
    if (!generatedContent.trim()) {
      alert('请先生成内容');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: generatedContent }),
      });

      if (!response.ok) {
        throw new Error('润色失败');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let fullContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setGeneratedContent(fullContent);
      }

    } catch (error) {
      console.error('润色失败:', error);
      alert('润色失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!generatedContent.trim()) {
      alert('请先生成内容');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: generatedContent,
          context: storyContext,
          characters: characterInfo,
        }),
      });

      if (!response.ok) {
        throw new Error('续写失败');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let fullContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setGeneratedContent(generatedContent + fullContent);
      }

    } catch (error) {
      console.error('续写失败:', error);
      alert('续写失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    alert('已复制到剪贴板');
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `第${chapterNum}章.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <span className="text-xl font-bold text-gray-900">番茄AI写作助手</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">剩余生成次数: 5/5</span>
              <Link href="/pricing" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                升级VIP
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 功能标签页 */}
        <div className="mb-8 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('write')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'write'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            章节撰写
          </button>
          <button
            onClick={() => setActiveTab('polish')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'polish'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            精修润色
          </button>
          <button
            onClick={() => setActiveTab('continue')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'continue'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            智能续写
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* 左侧：输入区 */}
          <div className="space-y-6">
            {/* 章节信息 */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">章节信息</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">章节号</label>
                  <input
                    type="number"
                    value={chapterNum}
                    onChange={(e) => setChapterNum(parseInt(e.target.value) || 1)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">目标字数</label>
                  <input
                    type="number"
                    value={wordCount}
                    onChange={(e) => setWordCount(parseInt(e.target.value) || 2500)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="2500"
                  />
                </div>
              </div>
            </div>

            {/* 故事背景 */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">故事背景</h3>
              <textarea
                value={storyContext}
                onChange={(e) => setStoryContext(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="输入故事世界观、背景设定等..."
              />
            </div>

            {/* 角色信息 */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">角色信息</h3>
              <textarea
                value={characterInfo}
                onChange={(e) => setCharacterInfo(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="输入主要角色的性格、能力、关系等..."
              />
            </div>

            {/* 大纲 */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">本章大纲</h3>
              <textarea
                value={plotOutline}
                onChange={(e) => setPlotOutline(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="输入本章的主要情节发展..."
              />
            </div>

            {/* 创作提示 */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">创作提示</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="输入本章的具体创作要求，如：主角发现金手指，系统激活，获得超强能力..."
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '生成中...' : 'AI生成章节'}
              </button>
              {activeTab === 'write' && (
                <button
                  onClick={handlePolish}
                  disabled={isLoading || !generatedContent}
                  className="flex-1 rounded-lg border-2 border-blue-600 px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '润色中...' : '精修润色'}
                </button>
              )}
              {activeTab === 'continue' && (
                <button
                  onClick={handleContinue}
                  disabled={isLoading || !generatedContent}
                  className="flex-1 rounded-lg border-2 border-purple-600 px-6 py-3 font-semibold text-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '续写中...' : '智能续写'}
                </button>
              )}
            </div>
          </div>

          {/* 右侧：输出区 */}
          <div className="rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900">生成结果</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!generatedContent}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  复制
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!generatedContent}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下载
                </button>
              </div>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="flex min-h-[600px] items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 text-4xl">✨</div>
                    <p className="text-gray-600">AI正在创作中，请稍候...</p>
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-gray-900 leading-relaxed">
                    {generatedContent}
                  </pre>
                </div>
              ) : (
                <div className="flex min-h-[600px] items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="mb-4 text-6xl">📝</div>
                    <p>输入创作信息，点击"AI生成章节"开始创作</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
