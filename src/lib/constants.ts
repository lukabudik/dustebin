export const SITE_NAME = 'Dustebin';
export const SITE_DESCRIPTION = 'A modern, secure code sharing platform';

// Languages supported for syntax highlighting
export const LANGUAGES = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'toml', label: 'TOML' },
  { value: 'bash', label: 'Bash' },
  { value: 'powershell', label: 'PowerShell' },
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
  MAX_PASTES_PER_HOUR: 20, // Per IP address for paste creation
  MAX_IMAGE_UPLOADS_PER_HOUR: 10, // Per IP address for image uploads
};

// Abuse contact
export const ABUSE_EMAIL = 'abuse@dustebin.com';

// Application version
export const APP_VERSION = '2.1.0';

// Feature flags
export const FEATURES = {
  AI_METADATA_GENERATION: true,
  IMAGE_UPLOADS: true,
  BURN_AFTER_READ: true,
  PASSWORD_PROTECTION: true,
} as const;
