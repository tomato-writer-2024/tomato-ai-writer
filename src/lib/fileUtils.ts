import mammoth from 'mammoth';
// @ts-ignore - Use dynamic import for pdf-parse to avoid default export issues
const pdfParse = () => import('pdf-parse');
import { Document, Packer, Paragraph, TextRun } from 'docx';

// 暂时禁用PDF导出功能（jspdf依赖问题）
// import { jsPDF } from 'jspdf';

/**
 * 读取Word文档内容
 */
export async function readWordFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    // 检查读取结果是否为空
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('Word文件内容为空或无法提取文本');
    }

    return result.value;
  } catch (error) {
    console.error('Word文件读取失败:', error);
    throw new Error(
      'Word文件读取失败，请确保：\n1. 文件格式正确（.docx格式）\n2. 文件未损坏\n3. 文件未加密'
    );
  }
}

/**
 * 读取PDF文档内容
 */
export async function readPdfFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdf = await pdfParse();
    // @ts-ignore
    const data = await pdf(buffer);

    // 检查读取结果是否为空
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('PDF文件内容为空或无法提取文本');
    }

    return data.text;
  } catch (error) {
    console.error('PDF文件读取失败:', error);
    throw new Error(
      'PDF文件读取失败，请确保：\n1. 文件格式正确\n2. 文件未损坏\n3. 文件未加密\n4. 文件包含可提取的文本（非扫描图片）'
    );
  }
}

/**
 * 读取TXT文档内容
 * 支持UTF-8编码，如果读取失败会尝试其他编码
 */
export async function readTxtFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        if (result === null || result === undefined) {
          throw new Error('文件读取失败：结果为空');
        }

        // 检查读取结果是否为空
        if (result.trim().length === 0) {
          throw new Error('文件内容为空');
        }

        // 检测是否包含乱码字符（简单检测）
        if (/\ufffd/.test(result)) {
          console.warn('检测到可能的编码问题，建议使用UTF-8编码的文件');
        }

        resolve(result);
      } catch (error) {
        reject(new Error('TXT文件解析失败，请确保文件编码为UTF-8'));
      }
    };

    reader.onerror = () => {
      reject(new Error('TXT文件读取出错，请重试或检查文件是否损坏'));
    };

    // 使用UTF-8编码读取
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * 根据文件类型读取文件内容
 */
export async function readFileContent(file: File): Promise<string> {
  // 验证文件是否存在
  if (!file) {
    throw new Error('未选择文件');
  }

  // 检查文件大小（限制为10MB）
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    throw new Error(`文件大小超过限制（当前：${sizeMB}MB，最大：10MB），请选择较小的文件`);
  }

  // 检查文件是否为空
  if (file.size === 0) {
    throw new Error('文件为空，请选择有内容的文件');
  }

  const fileName = file.name.toLowerCase();
  const fileType = file.type;

  // 根据文件扩展名和MIME类型判断
  if (fileName.endsWith('.docx') ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return readWordFile(file);
  } else if (fileName.endsWith('.pdf') ||
             fileType === 'application/pdf') {
    return readPdfFile(file);
  } else if (fileName.endsWith('.txt') ||
             fileType === 'text/plain') {
    return readTxtFile(file);
  } else {
    throw new Error(
      '不支持的文件格式。\n\n支持的格式：\n• Word文档（.docx）\n• PDF文档（.pdf）\n• 文本文件（.txt）'
    );
  }
}

/**
 * 导出为Word文档
 */
export async function exportAsWord(content: string, filename: string = 'export.docx'): Promise<void> {
  if (!content || content.trim().length === 0) {
    throw new Error('没有内容可导出，请先创作或导入内容');
  }

  try {
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
      throw new Error('内容为空，无法生成Word文档');
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });

    const blob = await Packer.toBlob(doc);
    downloadFile(blob, filename);
  } catch (error) {
    console.error('Word文档生成失败:', error);
    throw new Error('Word文档生成失败，请重试');
  }
}

/**
 * 导出为PDF文档
 * 注意：PDF导出功能暂时禁用（jspdf依赖问题）
 * 建议使用Word或TXT格式导出内容
 */
export function exportAsPdf(content: string, filename: string = 'export.pdf'): void {
  throw new Error('PDF导出功能暂时禁用，建议使用Word或TXT格式导出');

  // 原导出逻辑已注释，待jspdf依赖修复后恢复
  /*
  if (!content || content.trim().length === 0) {
    throw new Error('没有内容可导出，请先创作或导入内容');
  }

  try {
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

    // 注意：jsPDF默认不支持中文字体，中文会显示为方块
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
  } catch (error) {
    console.error('PDF文档生成失败:', error);
    throw new Error('PDF文档生成失败，请重试');
  }
  */
}

/**
 * 导出为TXT文档
 */
export function exportAsTxt(content: string, filename: string = 'export.txt'): void {
  if (!content || content.trim().length === 0) {
    throw new Error('没有内容可导出，请先创作或导入内容');
  }

  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    downloadFile(blob, filename);
  } catch (error) {
    console.error('TXT文档生成失败:', error);
    throw new Error('TXT文档生成失败，请重试');
  }
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
    throw new Error('文件下载失败，请检查浏览器权限设置或重试');
  }
}
