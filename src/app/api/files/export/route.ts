import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { jsPDF } from 'jspdf';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, format, filename } = body;

    if (!content) {
      return NextResponse.json(
        { error: '内容不能为空' },
        { status: 400 }
      );
    }

    if (!format || !['txt', 'docx', 'pdf'].includes(format)) {
      return NextResponse.json(
        { error: '不支持的导出格式' },
        { status: 400 }
      );
    }

    const safeFilename = (filename || 'export').replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_');

    // 根据格式生成文件
    switch (format) {
      case 'docx': {
        // 将文本内容分割成段落
        const paragraphs = content.split('\n').map((line: string) => {
          return new Paragraph({
            children: [
              new TextRun({
                text: line || ' ',  // 空行也要保留
                size: 24,  // 12pt
                font: '宋体',
              }),
            ],
            spacing: {
              after: 200,  // 段后间距
            },
          });
        });

        const doc = new Document({
          sections: [
            {
              properties: {},
              children: paragraphs,
            },
          ],
        });

        const buffer = await Packer.toBuffer(doc);

        return new NextResponse(new Uint8Array(buffer), {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${safeFilename}.docx"`,
            'Content-Length': buffer.length.toString(),
          },
        });
      }

      case 'pdf': {
        // 创建PDF文档
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        const maxWidth = pageWidth - 2 * margin;
        const lineHeight = 7;
        const fontSize = 12;

        pdf.setFontSize(fontSize);
        pdf.setFont('courier');  // 使用等宽字体

        // 分割文本成行
        const lines: string[] = [];
        const paragraphs = content.split('\n');

        for (const paragraph of paragraphs) {
          const words = paragraph.split('');
          let currentLine = '';

          for (const word of words) {
            const testLine = currentLine + word;
            const testWidth = pdf.getTextWidth(testLine);

            if (testWidth > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }

          if (currentLine) {
            lines.push(currentLine);
          }

          // 段落之间添加空行
          if (paragraph !== paragraphs[paragraphs.length - 1]) {
            lines.push('');
          }
        }

        // 添加文本到PDF，处理分页
        let yPosition = margin;

        for (const line of lines) {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }

          if (line === '') {
            yPosition += lineHeight / 2;  // 空行间距减半
          } else {
            pdf.text(line, margin, yPosition, {
              maxWidth: maxWidth,
              lineHeightFactor: 1.2,
            });
            yPosition += lineHeight;
          }
        }

        const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

        return new NextResponse(new Blob([pdfBuffer]), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${safeFilename}.pdf"`,
            'Content-Length': pdfBuffer.length.toString(),
          },
        });
      }

      case 'txt': {
        const buffer = Buffer.from(content, 'utf-8');

        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="${safeFilename}.txt"`,
            'Content-Length': buffer.length.toString(),
          },
        });
      }

      default:
        return NextResponse.json(
          { error: '不支持的导出格式' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('File export error:', error);
    return NextResponse.json(
      { error: '文件导出失败，请重试' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'File export API - Use POST with JSON body',
    supportedFormats: ['txt', 'docx', 'pdf'],
  });
}
