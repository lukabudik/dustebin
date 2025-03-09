import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { nanoid } from 'nanoid';

/**
 * Combines class names with Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a short ID for pastes with appropriate file extension
 */
export function generatePasteId(language: string = 'plaintext'): string {
  const id = nanoid(8);
  const extension = getFileExtensionForLanguage(language);
  return extension ? `${id}.${extension}` : id;
}

/**
 * Returns the appropriate file extension for a given language
 */
export function getFileExtensionForLanguage(language: string): string {
  const extensionMap: Record<string, string> = {
    'javascript': 'js',
    'typescript': 'ts',
    'jsx': 'jsx',
    'tsx': 'tsx',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'markdown': 'md',
    'python': 'py',
    'rust': 'rs',
    'sql': 'sql',
    'xml': 'xml',
    'plaintext': 'txt',
  };
  
  return extensionMap[language] || 'txt';
}

/**
 * Formats a date to a human-readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculates the expiration date based on the selected option
 */
export function calculateExpirationDate(option: string): Date | null {
  if (option === 'never' || option === 'burn') return null;

  const now = new Date();
  
  switch (option) {
    case '1h':
      return new Date(now.getTime() + 60 * 60 * 1000);
    case '1d':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Copies text to clipboard and returns success status
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
}

/**
 * Formats bytes to a human-readable string (KB, MB, etc.)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
