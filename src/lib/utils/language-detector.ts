/**
 * Language detection utilities for code snippets using highlight.js
 */
import hljs from 'highlight.js';

// Maps highlight.js language names to our supported language options
const languageMap: Record<string, string> = {
  'javascript': 'javascript',
  'typescript': 'typescript',
  'jsx': 'javascript',
  'tsx': 'typescript',
  'html': 'html',
  'xml': 'xml',
  'css': 'css',
  'scss': 'css',
  'less': 'css',
  'json': 'json',
  'python': 'python',
  'ruby': 'plaintext',
  'rust': 'rust',
  'go': 'plaintext',
  'java': 'plaintext',
  'c': 'plaintext',
  'cpp': 'plaintext',
  'csharp': 'plaintext',
  'php': 'plaintext',
  'swift': 'plaintext',
  'kotlin': 'plaintext',
  'scala': 'plaintext',
  'objectivec': 'plaintext',
  'perl': 'plaintext',
  'sql': 'sql',
  'shell': 'plaintext',
  'bash': 'plaintext',
  'powershell': 'plaintext',
  'markdown': 'markdown',
  'yaml': 'plaintext',
  'dockerfile': 'plaintext',
  'plaintext': 'plaintext',
};

// Maps file extensions to supported language options
const extensionMap: Record<string, string> = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.html': 'html',
  '.htm': 'html',
  '.xml': 'xml',
  '.svg': 'xml',
  '.css': 'css',
  '.scss': 'css',
  '.less': 'css',
  '.json': 'json',
  '.py': 'python',
  '.rs': 'rust',
  '.sql': 'sql',
  '.md': 'markdown',
  '.markdown': 'markdown',
};

/**
 * Detects the programming language of a code snippet using highlight.js
 * @param code The code snippet to analyze
 * @returns The detected language or 'plaintext' if detection fails
 */
export function detectLanguage(code: string): string {
  if (!code || code.trim().length === 0) {
    return 'plaintext';
  }

  try {
    const result = hljs.highlightAuto(code, [
      'javascript', 'typescript', 'html', 'xml', 'css', 
      'json', 'python', 'rust', 'sql', 'markdown'
    ]);

    const detectedLang = result.language || 'plaintext';
    return languageMap[detectedLang] || 'plaintext';
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'plaintext';
  }
}

/**
 * Detects programming language based on file extension
 * @param filename The filename to analyze
 * @returns The detected language or 'plaintext' if detection fails
 */
export function detectLanguageFromFilename(filename: string): string {
  if (!filename) return 'plaintext';
  
  const extension = filename.includes('.') 
    ? filename.substring(filename.lastIndexOf('.')).toLowerCase() 
    : '';
  
  if (!extension) return 'plaintext';
  
  return extensionMap[extension] || 'plaintext';
}
