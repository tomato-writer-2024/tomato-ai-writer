import mammoth from 'mammoth';
// @ts-ignore
import pdf from 'pdf-parse';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { jsPDF } from 'jspdf';

/**
 * 读取Word文档内容
 */
export async function readWordFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * 读取PDF文档内容
 */
export async function readPdfFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const data = await pdf(buffer);
  return data.text;
}

/**
 * 读取TXT文档内容
 */
export async function readTxtFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * 根据文件类型读取文件内容
 */
export async function readFileContent(file: File): Promise<string> {
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
  const paragraphs = content.split('\n\n').map(text => new Paragraph({
    children: [new TextRun(text)],
    spacing: {
      after: 200,
    },
  }));

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
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadFile(blob, filename);
}

/**
 * 下载文件
 */
function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
