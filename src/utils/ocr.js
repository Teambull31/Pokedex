import { createWorker } from 'tesseract.js';

/**
 * Parse raw OCR text from a Pokemon card image.
 * Returns the most likely card name and card number.
 */
export function parseCardOCR(rawText) {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 1);

  // Card number pattern: e.g. "001/165", "SV001/SV122", "SWSH001"
  const numberRegex = /([A-Z]*\d{1,4})\s*\/\s*([A-Z]*\d{1,4})/;
  let cardNumber = null;
  for (const line of lines) {
    const m = line.match(numberRegex);
    if (m) {
      cardNumber = m[1];
      break;
    }
  }

  // Skip known non-name tokens
  const skipPatterns = [
    /^HP$/i,
    /^\d+$/,
    /^\d+\s*HP$/i,
    /^(BASIC|STAGE|TRAINER|ENERGY|SUPPORTER|ITEM|TOOL|POKEMON)/i,
    /\//,
    /^[^a-zA-Z]/,
    /\bIllus\b/i,
    /^©/,
  ];

  const nameCandidates = lines.filter((line) => {
    if (line.length < 3 || line.length > 35) return false;
    return !skipPatterns.some((p) => p.test(line));
  });

  // The card name is usually the first meaningful line
  const cardName = nameCandidates[0]
    ? nameCandidates[0].replace(/[^a-zA-Z\s\-'éèêë]/g, '').trim()
    : '';

  return { cardName, cardNumber, rawText };
}

/**
 * Run OCR on an image file/URL using Tesseract.js.
 * Returns parsed card info.
 */
export async function runOCR(imageSource, onProgress) {
  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  try {
    const {
      data: { text },
    } = await worker.recognize(imageSource);
    return parseCardOCR(text);
  } finally {
    await worker.terminate();
  }
}
