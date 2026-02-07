import type { Buffer } from 'node:buffer';

const MAX_PDF_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (buffer.length > MAX_PDF_SIZE_BYTES) {
    throw new Error(`PDF too large. Maximum size is ${MAX_PDF_SIZE_BYTES / 1024 / 1024} MB.`);
  }

  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  const text = (data?.text ?? '').trim();
  if (!text) {
    throw new Error('No text could be extracted from the PDF.');
  }
  return text;
}
