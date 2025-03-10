import { prisma } from '../db';
import { calculateExpirationDate, generatePasteId } from '../utils/helpers';
import { formatCode, isFormattable } from '../utils/code-formatter';
import { hashPassword, comparePassword } from '../utils/password-utils';
import { shouldCompress, compressText, decompressText } from '../utils/compression';
import { CreatePasteInput, GetPasteInput } from '../validations';

// Define the Paste interface based on the Prisma schema
interface Paste {
  id: string;
  content: string;
  language: string;
  createdAt: Date;
  expiresAt: Date | null;
  isCompressed: boolean;
  passwordHash: string | null;
  views: number;
  burnAfterRead: boolean;
}

// In-memory cache to prevent duplicate view counts (paste ID -> timestamp)
const recentViews = new Map<string, number>();
const VIEW_DEBOUNCE_WINDOW = 2000; // 2 seconds

/**
 * Creates a new paste with the provided data
 */
export async function createPaste(data: CreatePasteInput) {
  try {
    const expiresAt = data.expiration ? calculateExpirationDate(data.expiration) : null;
    const burnAfterRead = data.expiration === 'burn';
    
    let content = data.content;
    if (isFormattable(data.language)) {
      content = await formatCode(data.content, data.language);
    }
    
    let passwordHash = null;
    if (data.password) {
      passwordHash = await hashPassword(data.password);
    }

    const shouldCompressContent = shouldCompress(content);
    let finalContent = content;
    
    if (shouldCompressContent) {
      const compressedBuffer = await compressText(content);
      finalContent = compressedBuffer.toString('base64');
    }

    const paste = await prisma.paste.create({
      data: {
        id: generatePasteId(data.language),
        content: finalContent,
        language: data.language,
        expiresAt,
        isCompressed: shouldCompressContent,
        passwordHash,
        burnAfterRead,
      },
    });

    return {
      id: paste.id,
      language: paste.language,
      createdAt: paste.createdAt,
      expiresAt: paste.expiresAt,
      hasPassword: !!paste.passwordHash,
    };
  } catch (error) {
    console.error('Error creating paste:', error);
    throw error;
  }
}

/**
 * Retrieves a paste by ID with optional password authentication
 */
export async function getPaste(data: GetPasteInput) {
  try {
    const paste = await prisma.paste.findUnique({
      where: { id: data.id },
    });

    if (!paste) {
      throw new Error('Paste not found');
    }

    if (paste.expiresAt && paste.expiresAt < new Date()) {
      await prisma.paste.delete({
        where: { id: data.id },
      });
      throw new Error('Paste has expired');
    }

    if (paste.passwordHash && !data.password) {
      return {
        id: paste.id,
        language: paste.language,
        createdAt: paste.createdAt,
        expiresAt: paste.expiresAt,
        hasPassword: true,
        requiresPassword: true,
      };
    }

    if (paste.passwordHash && data.password) {
      const passwordMatches = await comparePassword(data.password, paste.passwordHash);
      if (!passwordMatches) {
        throw new Error('Incorrect password');
      }
    }

    const now = Date.now();
    const lastViewTime = recentViews.get(data.id);
    let updatedPaste = paste;
    
    if (!lastViewTime || now - lastViewTime > VIEW_DEBOUNCE_WINDOW) {
      recentViews.set(data.id, now);
      
      updatedPaste = await prisma.paste.update({
        where: { id: data.id },
        data: { views: { increment: 1 } },
      });
      
      // Clean up cache if it grows too large
      if (recentViews.size > 1000) {
        for (const [entryId, timestamp] of recentViews.entries()) {
          if (now - timestamp > VIEW_DEBOUNCE_WINDOW * 10) {
            recentViews.delete(entryId);
          }
        }
      }
    }

    let finalContent = paste.content;
    if (paste.isCompressed) {
      const compressedBuffer = Buffer.from(paste.content, 'base64');
      finalContent = await decompressText(compressedBuffer);
    }

    // Cast to Paste to ensure TypeScript recognizes all fields
    const typedPaste = paste as Paste;
    const typedUpdatedPaste = updatedPaste as Paste;
    
    return {
      id: typedPaste.id,
      content: finalContent,
      language: typedPaste.language,
      createdAt: typedPaste.createdAt,
      expiresAt: typedPaste.expiresAt,
      hasPassword: !!typedPaste.passwordHash,
      views: typedUpdatedPaste.views,
      burnAfterRead: typedPaste.burnAfterRead,
    };
  } catch (error) {
    console.error('Error getting paste:', error);
    throw error;
  }
}

/**
 * Permanently deletes a paste by ID
 */
export async function deletePaste(id: string) {
  try {
    await prisma.paste.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      throw new Error('Paste not found');
    }
    console.error('Error deleting paste:', error);
    throw error;
  }
}
