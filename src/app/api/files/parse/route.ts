import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

// PDF解析功能暂时禁用，因为pdfjs-dist在服务器端需要DOM环境支持
// 如果需要PDF解析，可以考虑：
// 1. 使用专门的PDF解析服务
// 2. 使用pdf-parse等Node.js原生支持的库
// 3. 在客户端解析PDF后提交到服务器

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
        // PDF解析功能暂时禁用
        return NextResponse.json(
          {
            error: 'PDF解析功能暂时不可用',
            message: 'PDF解析需要DOM环境支持，请将PDF转换为Word（.docx）或TXT格式后上传',
          },
          { status: 503 }
        );
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
    supportedFormats: ['txt', 'doc', 'docx'],
    maxSize: '20MB',
    features: {
      docx: '支持Word文档',
      doc: '支持旧版Word文档（建议转为.docx）',
      txt: '支持纯文本文件',
      note: 'PDF解析功能暂时不可用，请转换为Word或TXT格式',
    },
  });
}
