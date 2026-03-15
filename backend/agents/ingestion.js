import { readFileSync } from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Agent 0 — Ingestion
 * Reads a PDF or DOCX file from disk and returns raw extracted text + metadata.
 */
export async function ingest(filePath, originalName) {
  const ext = originalName.split('.').pop().toLowerCase();
  const buffer = readFileSync(filePath);

  let rawText = '';
  let metadata = { filename: originalName, format: ext, pages: null, wordCount: 0 };

  if (ext === 'pdf') {
    const result = await pdfParse(buffer);
    rawText = result.text;
    metadata.pages = result.numpages;

  } else if (ext === 'docx' || ext === 'doc') {
    const result = await mammoth.extractRawText({ buffer });
    rawText = result.value;
    metadata.format = 'docx';

  } else if (ext === 'md' || ext === 'txt') {
    rawText = buffer.toString('utf8');

  } else {
    throw new Error(`Unsupported file format: .${ext}`);
  }

  // Clean up whitespace noise
  rawText = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  metadata.wordCount = rawText.split(/\s+/).length;
  metadata.charCount = rawText.length;

  return { rawText, metadata };
}
