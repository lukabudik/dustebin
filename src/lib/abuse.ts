export type AbuseAction = 'block' | 'flag' | 'allow';

// Domains/phrases with zero legitimate use in a code paste — hard block.
const BLOCK_DOMAINS = [
  'sharecut.pro',
  'paycut.net',
  'cpmlink.net',
  'gplinks.co',
  'fc-lc.xyz',
  'justcut.io',
  'revlink.pro',
];

const BLOCK_PHRASES = ['magnet:?xt=', 'password is the video title'];

// Domains/patterns that are suspicious but could appear in legitimate code — soft flag.
const FLAG_DOMAINS = ['gofile.io', 'is.gd', 'urls.uz', 'arlinks.in'];

// Dustebin self-link followed by a "pw" password hint: chain-obfuscation pattern.
const CHAIN_PATTERN = /dustebin\.com\/\S+[\s\r\n]+pw\b/i;

export function checkContent(content: string): AbuseAction {
  const lower = content.toLowerCase();

  if (BLOCK_PHRASES.some(p => lower.includes(p.toLowerCase()))) return 'block';
  if (BLOCK_DOMAINS.some(d => lower.includes(d))) return 'block';

  if (FLAG_DOMAINS.some(d => lower.includes(d))) return 'flag';
  if (CHAIN_PATTERN.test(content)) return 'flag';

  return 'allow';
}
