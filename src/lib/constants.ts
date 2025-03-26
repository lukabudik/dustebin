export const SITE_NAME = 'Dustebin';
export const SITE_DESCRIPTION = 'A modern, secure code sharing platform';

// Languages supported for syntax highlighting
export const LANGUAGES = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'xml', label: 'XML' },
];

// Available paste expiration options
export const EXPIRATION_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: '1h', label: '1 hour' },
  { value: '1d', label: '1 day' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'burn', label: 'Burn after reading' },
];

// Maximum paste size (1MB)
export const MAX_PASTE_SIZE = 1024 * 1024;

// Rate limiting configuration
export const RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 60, // Per IP address
  MAX_PASTES_PER_HOUR: 30, // Per IP address
};
