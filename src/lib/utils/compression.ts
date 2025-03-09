import { brotliCompress, brotliDecompress } from 'zlib';
import { promisify } from 'util';

// Convert callback-based brotli functions to Promise-based
const compressAsync = promisify(brotliCompress);
const decompressAsync = promisify(brotliDecompress);

// Minimum size threshold for compression (1KB)
// Compression is only applied to texts larger than this threshold
// as compression of very small texts provides minimal benefit
export const COMPRESSION_THRESHOLD = 1024;

/**
 * Compress text using Brotli algorithm
 * @param text The text to compress
 * @returns A Buffer containing the compressed data
 */
export async function compressText(text: string): Promise<Buffer> {
  try {
    const buffer = Buffer.from(text, 'utf-8');
    return await compressAsync(buffer);
  } catch (error) {
    console.error('Error compressing text:', error);
    throw new Error('Failed to compress text');
  }
}

/**
 * Decompress a Buffer using Brotli algorithm
 * @param compressedData The compressed data as a Buffer
 * @returns The original text
 */
export async function decompressText(compressedData: Buffer): Promise<string> {
  try {
    const decompressedBuffer = await decompressAsync(compressedData);
    return decompressedBuffer.toString('utf-8');
  } catch (error) {
    console.error('Error decompressing text:', error);
    throw new Error('Failed to decompress text');
  }
}

/**
 * Determine if text should be compressed based on size
 * @param text The text to check
 * @returns True if the text should be compressed
 */
export function shouldCompress(text: string): boolean {
  return Buffer.byteLength(text, 'utf-8') > COMPRESSION_THRESHOLD;
}

/**
 * Convert a string to a Buffer for storage
 * @param text The text to convert
 * @param compress Whether to compress the text
 * @returns A Buffer containing the text (compressed if specified)
 */
export async function textToBuffer(text: string, compress: boolean = false): Promise<Buffer> {
  if (compress) {
    return await compressText(text);
  }
  return Buffer.from(text, 'utf-8');
}

/**
 * Convert a Buffer to a string
 * @param buffer The buffer to convert
 * @param isCompressed Whether the buffer contains compressed data
 * @returns The original text
 */
export async function bufferToText(buffer: Buffer, isCompressed: boolean = false): Promise<string> {
  if (isCompressed) {
    return await decompressText(buffer);
  }
  return buffer.toString('utf-8');
}
