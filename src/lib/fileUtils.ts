import mammoth from 'mammoth';
// @ts-ignore
import pdf from 'pdf-parse';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { jsPDF } from 'jspdf';

/**
 * 读取Word文档内容
 */
export async function readWordFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Word文件读取失败:', error);
    throw new Error('Word文件读取失败，请确保文件格式正确');
  }
}

/**
 * 读取PDF文档内容
 */
export async function readPdfFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF文件读取失败:', error);
    throw new Error('PDF文件读取失败，请确保文件格式正确且不是加密文件');
  }
}

/**
 * 读取TXT文档内容
 */
export async function readTxtFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        if (result === null) {
          throw new Error('文件读取失败：结果为空');
        }
        resolve(result);
      } catch (error) {
        reject(new Error('文件读取失败'));
      }
    };
    reader.onerror = () => {
      reject(new Error('文件读取出错'));
    };
    // 尝试用UTF-8读取，如果失败可以尝试其他编码
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * 根据文件类型读取文件内容
 */
export async function readFileContent(file: File): Promise<string> {
  // 检查文件大小（限制为10MB）
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('文件大小超过限制（最大10MB），请选择较小的文件');
  }

  // 检查文件是否为空
  if (file.size === 0) {
    throw new Error('文件为空，请选择有内容的文件');
  }

  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.docx') || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return readWordFile(file);
  } else if (fileName.endsWith('.pdf') || fileType === 'application/pdf') {
    return readPdfFile(file);
  } else if (fileName.endsWith('.txt') || fileType === 'text/plain') {
    return readTxtFile(file);
  } else {
    throw new Error('不支持的文件格式，请选择Word、PDF或TXT文件');
  }
}

/**
 * 导出为Word文档
 */
export async function exportAsWord(content: string, filename: string = 'export.docx'): Promise<void> {
  if (!content || content.trim().length === 0) {
    throw new Error('没有内容可导出');
  }

  // 处理内容：将连续换行符转换为段落
  const paragraphs = content
    .split('\n\n')
    .filter(text => text.trim().length > 0) // 过滤空段落
    .map(text => new Paragraph({
      children: [new TextRun(text)],
      spacing: {
        after: 200,
      },
    }));

  if (paragraphs.length === 0) {
    throw new Error('没有有效内容可导出');
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });

  const blob = await Packer.toBlob(doc);
  downloadFile(blob, filename);
}

/**
 * 导出为PDF文档
 */
export function exportAsPdf(content: string, filename: string = 'export.pdf'): void {
  if (!content || content.trim().length === 0) {
    throw new Error('没有内容可导出');
  }

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;
  const lineHeight = 6;
  let y = margin;

  // 设置字体（jsPDF支持中文需要自定义字体，这里使用默认字体，中文会显示乱码）
  // 实际生产中需要加载中文字体文件
  pdf.setFont('helvetica');
  pdf.setFontSize(12);

  const paragraphs = content.split('\n\n');

  paragraphs.forEach((paragraph) => {
    if (!paragraph.trim()) return; // 跳过空段落

    const lines = pdf.splitTextToSize(paragraph, maxWidth);

    lines.forEach((line: string) => {
      if (y + lineHeight > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += lineHeight;
    });

    y += lineHeight; // 段落间距
  });

  pdf.save(filename);
}

/**
 * 导出为TXT文档
 */
export function exportAsTxt(content: string, filename: string = 'export.txt'): void {
  if (!content || content.trim().length === 0) {
    throw new Error('没有内容可导出');
  }
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadFile(blob, filename);
}

/**
 * 下载文件
 */
function downloadFile(blob: Blob, filename: string): void {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('文件下载失败:', error);
    throw new Error('文件下载失败，请检查浏览器权限设置');
  }
}
