'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { Loader2, Book, Sparkles, Crown, Star, Copy, RefreshCw, Zap, Target, TrendingUp, Lightbulb, Heart } from 'lucide-react';

interface TitleSuggestion {
  title: string;
  subtitle?: string;
  explanation: string;
  advantages: string[];
  marketFit: number;
  uniqueness: number;
  memorability: number;
}

export default function TitleGeneratorPage() {
  const [storySynopsis, setStorySynopsis] = useState('');
  const [genre, setGenre] = useState('');
  const [titleStyle, setTitleStyle] = useState('');
  const [titleCount, setTitleCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<TitleSuggestion[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<TitleSuggestion | null>(null);

  const genres = [
    { value: 'xuanhuan', label: '玄幻' },
    { value: 'wuxia', label: '武侠' },
    { value: 'xianxia', label: '仙侠' },
    { value: 'dushi', label: '都市' },
    { value: 'lishi', label: '历史' },
    { value: 'junshi', label: '军事' },
    { value: 'kehuan', label: '科幻' },
    { value: 'lingyi', label: '灵异' },
  ];

  const titleStyles = [
    { value: 'classic', label: '经典风格', desc: '传统经典，稳重大气' },
    { value: 'trending', label: '网红爆款', desc: '紧贴热点，吸睛引流' },
    { value: 'mysterious', label: '神秘悬疑', desc: '引人好奇，制造悬念' },
    { value: 'poetic', label: '诗意唯美', desc: '文艺优雅，意境深远' },
    { value: 'humorous', label: '幽默诙谐', desc: '轻松有趣，别出心裁' },
    { value: 'domineering', label: '霸气侧漏', desc: '气势磅礴，震撼人心' },
  ];

  const handleGenerate = async () => {
    if (!storySynopsis.trim()) {
      alert('请输入故事梗概');
      return;
    }

    setIsGenerating(true);
    setSuggestions([]);
    setSelectedTitle(null);

    try {
      const response = await fetch('/api/title-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storySynopsis,
          genre,
          titleStyle,
          titleCount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '生成失败');
      }

      const result = await response.json();
      if (result.success) {
        setSuggestions(result.data);
        if (result.data.length > 0) {
          setSelectedTitle(result.data[0]);
        }
      } else {
        throw new Error(result.error || '生成失败');
      }
    } catch (error) {
      console.error('生成失败:', error);
      alert(error instanceof Error ? error.message : '生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (title: string) => {
    navigator.clipboard.writeText(title);
    alert('已复制到剪贴板');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getOverallScore = (title: TitleSuggestion) => {
    return Math.round((title.marketFit + title.uniqueness + title.memorability) / 3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <Book className="w-8 h-8" />
            书名生成器
          </h1>
          <p className="mt-2 text-gray-600">
            智能生成吸睛书名，提升作品关注度和点击率
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：输入配置区 */}
          <div className="space-y-6">
            <Card>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      故事梗概
                    </label>
                    <Textarea
                      value={storySynopsis}
                      onChange={(e) => setStorySynopsis(e.target.value)}
                      placeholder="请输入故事梗概，包括核心冲突、主角设定、故事亮点..."
                      className="min-h-[150px] w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        小说题材
                      </label>
                      <Select
                        value={genre}
                        onChange={(value) => setGenre(value as any)}
                        placeholder="请选择题材"
                        options={genres.map(g => ({ value: g.value, label: g.label }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        书名风格
                      </label>
                      <Select
                        value={titleStyle}
                        onChange={(value) => setTitleStyle(value as any)}
                        placeholder="请选择风格"
                        options={titleStyles.map(t => ({ value: t.value, label: t.label }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      生成数量
                    </label>
                    <Input
                      type="number"
                      value={titleCount}
                      onChange={(e) => setTitleCount(Number(e.target.value))}
                      placeholder="10"
                      min={5}
                      max={20}
                    />
                  </div>

                  <GradientButton
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    icon={isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  >
                    {isGenerating ? '生成中...' : '生成书名'}
                  </GradientButton>
                </div>
              </CardBody>
            </Card>

            {/* 书名风格说明 */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-600" />
                  书名风格说明
                </h3>
                <div className="space-y-3">
                  {titleStyles.map((style) => (
                    <div
                      key={style.value}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        titleStyle === style.value
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-cyan-300'
                      }`}
                      onClick={() => setTitleStyle(style.value)}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{style.label}</div>
                      <div className="text-sm text-gray-600">{style.desc}</div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 右侧：结果展示区 */}
          <div className="space-y-6">
            {suggestions.length > 0 && (
              <>
                {/* 书名列表 */}
                <Card>
                  <CardBody>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-cyan-600" />
                      书名建议 ({suggestions.length})
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedTitle?.title === suggestion.title
                              ? 'border-cyan-500 bg-cyan-50 shadow-md'
                              : 'border-gray-200 hover:border-cyan-300'
                          }`}
                          onClick={() => setSelectedTitle(suggestion)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 mb-1">
                                {suggestion.title}
                              </div>
                              {suggestion.subtitle && (
                                <div className="text-sm text-gray-600 italic">
                                  {suggestion.subtitle}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <Badge variant="outline" className="text-xs">
                                {getOverallScore(suggestion)}分
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Copy size={14} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(suggestion.title);
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <div className={`w-12 h-2 rounded-full ${getScoreColor(suggestion.marketFit)}`} />
                              <span className="text-xs text-gray-600">市场</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className={`w-12 h-2 rounded-full ${getScoreColor(suggestion.uniqueness)}`} />
                              <span className="text-xs text-gray-600">独特</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className={`w-12 h-2 rounded-full ${getScoreColor(suggestion.memorability)}`} />
                              <span className="text-xs text-gray-600">记忆</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* 选中书名详情 */}
                {selectedTitle && (
                  <>
                    <Card>
                      <CardBody>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Heart className="w-5 h-5 text-cyan-600" />
                          书名详情
                        </h4>
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {selectedTitle.title}
                            </div>
                            {selectedTitle.subtitle && (
                              <div className="text-lg text-gray-600 italic">
                                {selectedTitle.subtitle}
                              </div>
                            )}
                          </div>

                          <div>
                            <h5 className="font-semibold text-gray-900 mb-2">推荐理由</h5>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {selectedTitle.explanation}
                            </p>
                          </div>

                          <div>
                            <h5 className="font-semibold text-gray-900 mb-2">核心优势</h5>
                            <div className="space-y-2">
                              {selectedTitle.advantages.map((advantage, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <Zap size={16} className="text-cyan-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{advantage}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-gray-50 rounded">
                              <div className="text-xs text-gray-600 mb-1">市场契合度</div>
                              <div className="text-xl font-bold text-cyan-600">
                                {selectedTitle.marketFit}
                              </div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded">
                              <div className="text-xs text-gray-600 mb-1">独特性</div>
                              <div className="text-xl font-bold text-cyan-600">
                                {selectedTitle.uniqueness}
                              </div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded">
                              <div className="text-xs text-gray-600 mb-1">记忆度</div>
                              <div className="text-xl font-bold text-cyan-600">
                                {selectedTitle.memorability}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </>
                )}
              </>
            )}

            {suggestions.length === 0 && !isGenerating && (
              <Card>
                <CardBody className="py-16 text-center">
                  <Book size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    等待生成书名
                  </h3>
                  <p className="text-gray-600">
                    输入故事梗概，AI将为你生成多个吸睛书名
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
