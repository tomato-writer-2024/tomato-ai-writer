import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

// 初始化PDF.js worker（使用CDN）
const pdfjsWorker = typeof window === 'undefined'
  ? `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`
  : undefined;

if (typeof window === 'undefined' && pdfjsWorker) {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '未找到文件' },
        { status: 400 }
      );
    }

    // 验证文件大小（20MB）
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小不能超过20MB' },
        { status: 400 }
      );
    }

    // 获取文件扩展名
    const filename = file.name;
    const extension = filename.split('.').pop()?.toLowerCase();

    let content: string = '';

    // 根据文件类型解析
    switch (extension) {
      case 'pdf': {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const pdf = await pdfjs.getDocument({
            data: buffer,
            // 使用CMapReaderFactory确保中文字符正常显示
            cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
            cMapPacked: true,
          }).promise;

          let fullText = '';

          // 逐页提取文本
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // 提取文本并保持基本格式
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(' ');

            fullText += pageText + '\n\n';
          }

          content = fullText.trim();
        } catch (error) {
          console.error('PDF parsing error:', error);
          return NextResponse.json(
            {
              error: 'PDF解析失败',
              message: '请确保PDF文件不是扫描件，且使用标准编码',
            },
            { status: 400 }
          );
        }
        break;
      }

      case 'doc': {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const result = await mammoth.extractRawText({ buffer });
          content = result.value;
        } catch (error) {
          console.error('DOC parsing error:', error);
          return NextResponse.json(
            { error: '无法解析旧版Word文档（.doc），建议保存为.docx格式' },
            { status: 400 }
          );
        }
        break;
      }

      case 'docx': {
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await mammoth.extractRawText({ buffer });
        content = result.value;
        break;
      }

      case 'txt': {
        content = await file.text();
        break;
      }

      default:
        return NextResponse.json(
          { error: '不支持的文件格式，仅支持PDF、Word（.doc/.docx）和TXT' },
          { status: 400 }
        );
    }

    // 清理文本内容
    content = content
      .replace(/\r\n/g, '\n')  // 统一换行符
      .replace(/\r/g, '\n')
      .replace(/\n\s*\n\s*\n/g, '\n\n')  // 合并多余空行
      .trim();

    if (!content) {
      return NextResponse.json(
        { error: '文件内容为空或无法解析' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      content,
      filename,
      size: file.size,
      type: extension,
      charCount: content.length,
    });

  } catch (error) {
    console.error('File parse error:', error);
    return NextResponse.json(
      { error: '文件解析失败，请检查文件格式是否正确' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'File parsing API - Use POST with multipart/form-data',
    supportedFormats: ['pdf', 'txt', 'doc', 'docx'],
    maxSize: '20MB',
    features: {
      pdf: '支持标准PDF文件（非扫描件）',
      docx: '支持Word文档',
      doc: '支持旧版Word文档（建议转为.docx）',
      txt: '支持纯文本文件',
    },
  });
}
