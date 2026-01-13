import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

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

    // 验证文件大小（10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小不能超过10MB' },
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
        // PDF功能暂时禁用，返回503错误
        return NextResponse.json(
          {
            error: 'PDF文件解析功能暂时不可用',
            message: '请将PDF文件转换为Word（.docx）或TXT格式后再上传',
            status: 'service_unavailable'
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
          { error: '不支持的文件格式，仅支持Word（.doc/.docx）和TXT' },
          { status: 400 }
        );
    }

    // 清理文本内容
    content = content
      .replace(/\r\n/g, '\n')  // 统一换行符
      .replace(/\r/g, '\n')
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
    maxSize: '10MB',
    note: 'PDF格式暂时不支持，请使用Word或TXT格式',
  });
}
