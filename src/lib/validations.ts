import { z } from 'zod';
import { LANGUAGES, MAX_PASTE_SIZE } from './constants';

// Schema for paste creation validation
export const createPasteSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(MAX_PASTE_SIZE, `Content must be less than ${MAX_PASTE_SIZE} bytes`),
  language: z
    .string()
    .refine(
      (lang) => LANGUAGES.some((l) => l.value === lang),
      'Invalid language'
    )
    .default('plaintext'),
  expiration: z
    .enum(['never', '1h', '1d', '7d', '30d', 'burn'])
    .default('never'),
  password: z.string().optional(),
});

// Schema for paste retrieval validation
export const getPasteSchema = z.object({
  id: z.string().min(1, 'Paste ID is required'),
  password: z.string().optional(),
});

// Paste deletion functionality removed for security reasons

// TypeScript types derived from Zod schemas
export type CreatePasteInput = z.infer<typeof createPasteSchema>;
export type GetPasteInput = z.infer<typeof getPasteSchema>;
