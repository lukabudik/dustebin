import { z } from 'zod';
import { LANGUAGES, MAX_PASTE_SIZE } from './constants';

// Schema for paste creation validation
export const createPasteSchema = z
  .object({
    content: z
      .string()
      .max(MAX_PASTE_SIZE, `Content must be less than ${MAX_PASTE_SIZE} bytes`)
      .optional(),
    language: z
      .string()
      .refine(lang => LANGUAGES.some(l => l.value === lang), 'Invalid language')
      .default('plaintext'),
    expiration: z.enum(['never', '1h', '1d', '7d', '30d', 'burn']).default('never'),
    password: z.string().optional().nullable(),
    image: z.string().optional(), // Base64 encoded image data
    originalFormat: z.string().optional().nullable(), // Original image format (e.g., 'png', 'jpeg')
    pasteType: z.enum(['text', 'image']).default('text'), // Type of paste
  })
  .refine(
    data => {
      if (data.pasteType === 'text') {
        return !!data.content;
      } else {
        return !!data.image;
      }
    },
    {
      message: 'Content is required for text pastes, image is required for image pastes',
      path: ['content'],
    }
  )
  .refine(
    data => {
      // Ensure we don't have both content and image
      if (data.pasteType === 'text') {
        return !data.image;
      } else {
        return !data.content || data.content.trim() === '';
      }
    },
    {
      message: 'Cannot have both content and image in the same paste',
      path: ['content'],
    }
  );

// Schema for paste retrieval validation
export const getPasteSchema = z.object({
  id: z.string().min(1, 'Paste ID is required'),
  password: z.string().optional(),
});

// Paste deletion functionality removed for security reasons

// TypeScript types derived from Zod schemas
export type CreatePasteInput = z.infer<typeof createPasteSchema>;
export type GetPasteInput = z.infer<typeof getPasteSchema>;
