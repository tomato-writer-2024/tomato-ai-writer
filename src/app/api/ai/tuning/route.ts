/**
 * AI模型微调 API
 * 实现用户写作风格分析、个性化提示词生成
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-server';
import { db } from '@/lib/db';

/**
 * POST /api/ai/tuning
 * 分析用户写作风格并生成个性化提示词
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token无效' }, { status: 401 });
    }

    const userId = payload.userId;
    const { content } = await request.json();

    // 分析写作风格
    const styleAnalysis = analyzeWritingStyle(content);

    // 生成个性化提示词
    const personalizedPrompt = generatePersonalizedPrompt(styleAnalysis);

    // 保存风格分析结果
    await db.query(
      `INSERT INTO user_writing_styles
       (user_id, avg_sentence_length, avg_word_length, vocabulary_richness,
        sentence_complexity, emotional_tone, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET
         avg_sentence_length = $2,
         avg_word_length = $3,
         vocabulary_richness = $4,
         sentence_complexity = $5,
         emotional_tone = $6,
         updated_at = NOW()`,
      [
        userId,
        styleAnalysis.avgSentenceLength,
        styleAnalysis.avgWordLength,
        styleAnalysis.vocabularyRichness,
        styleAnalysis.sentenceComplexity,
        styleAnalysis.emotionalTone,
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        styleAnalysis,
        personalizedPrompt,
      },
    });
  } catch (error) {
    console.error('AI微调失败:', error);
    return NextResponse.json({ error: 'AI微调失败' }, { status: 500 });
  }
}

/**
 * 分析写作风格
 */
function analyzeWritingStyle(content: string): {
  avgSentenceLength: number;
  avgWordLength: number;
  vocabularyRichness: number;
  sentenceComplexity: string;
  emotionalTone: string;
} {
  const sentences = content.split(/[。！？.!?]/).filter((s) => s.trim().length > 0);
  const words = content.split(/\s+/).filter((w) => w.trim().length > 0);

  // 平均句长
  const avgSentenceLength = sentences.length > 0
    ? words.length / sentences.length
    : 0;

  // 平均词长
  const avgWordLength = words.length > 0
    ? words.reduce((sum, word) => sum + word.length, 0) / words.length
    : 0;

  // 词汇丰富度（唯一词汇比例）
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  const vocabularyRichness = words.length > 0
    ? uniqueWords.size / words.length
    : 0;

  // 句子复杂度（基于句子长度和标点使用）
  const sentenceComplexity = avgSentenceLength > 20
    ? 'complex'
    : avgSentenceLength > 10
    ? 'medium'
    : 'simple';

  // 情感基调（简单判断）
  const positiveWords = ['开心', '快乐', '幸福', '美好', '爱', '喜欢'];
  const negativeWords = ['悲伤', '难过', '痛苦', '恨', '讨厌', '糟糕'];
  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach((word) => {
    const matches = content.match(new RegExp(word, 'g'));
    if (matches) positiveCount += matches.length;
  });

  negativeWords.forEach((word) => {
    const matches = content.match(new RegExp(word, 'g'));
    if (matches) negativeCount += matches.length;
  });

  const emotionalTone = positiveCount > negativeCount
    ? 'positive'
    : negativeCount > positiveCount
    ? 'negative'
    : 'neutral';

  return {
    avgSentenceLength: Math.round(avgSentenceLength * 100) / 100,
    avgWordLength: Math.round(avgWordLength * 100) / 100,
    vocabularyRichness: Math.round(vocabularyRichness * 100) / 100,
    sentenceComplexity,
    emotionalTone,
  };
}

/**
 * 生成个性化提示词
 */
function generatePersonalizedPrompt(styleAnalysis: any): string {
  const { avgSentenceLength, vocabularyRichness, sentenceComplexity, emotionalTone } = styleAnalysis;

  let prompt = '请按照以下风格要求进行创作：\n\n';

  // 句式风格
  if (sentenceComplexity === 'complex') {
    prompt += '- 使用长句和复杂句式，注重句子间的逻辑衔接\n';
  } else if (sentenceComplexity === 'medium') {
    prompt += '- 句式长短结合，节奏感适中\n';
  } else {
    prompt += '- 使用短句为主，简洁明快\n';
  }

  // 词汇风格
  if (vocabularyRichness > 0.6) {
    prompt += '- 词汇丰富多样，善用成语和高级表达\n';
  } else if (vocabularyRichness > 0.4) {
    prompt += '- 词汇表达准确，适当使用修辞\n';
  } else {
    prompt += '- 语言朴实自然，平易近人\n';
  }

  // 情感风格
  if (emotionalTone === 'positive') {
    prompt += '- 整体基调积极向上，充满正能量\n';
  } else if (emotionalTone === 'negative') {
    prompt += '- 情感表达深沉，可适当展现负面情绪\n';
  } else {
    prompt += '- 情感表达客观中立，理性克制\n';
  }

  prompt += '\n请确保内容符合番茄小说平台的创作风格，注重情节的戏剧性和读者的沉浸感。';

  return prompt;
}
