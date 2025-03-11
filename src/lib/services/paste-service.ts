import { prisma } from '../db';
import { calculateExpirationDate, generatePasteId } from '../utils/helpers';
import { formatCode, isFormattable } from '../utils/code-formatter';
import { hashPassword, comparePassword } from '../utils/password-utils';
import { shouldCompress, compressText, decompressText } from '../utils/compression';
import { CreatePasteInput, GetPasteInput } from '../validations';
import { generateTitleAndDescription } from './gemini-service';

// Event emitter for SSE notifications
import { EventEmitter } from 'events';
export const metadataEventEmitter = new EventEmitter();

// Define the Paste interface based on the Prisma schema
interface Paste {
  id: string;
  content: string;
  language: string;
  title?: string;
  description?: string;
  createdAt: Date;
  expiresAt: Date | null;
  isCompressed: boolean;
  passwordHash: string | null;
  views: number;
  burnAfterRead: boolean;
  aiGenerationStatus?: string;
}

// In-memory cache to prevent duplicate view counts (paste ID -> timestamp)
const recentViews = new Map<string, number>();
const VIEW_DEBOUNCE_WINDOW = 2000; // 2 seconds

/**
 * Asynchronously generates title and description for a paste
 * and updates the database when complete
 */
async function generateMetadataAsync(pasteId: string, content: string, language: string) {
  try {
    // Generate title and description using Gemini
    const { title, description } = await generateTitleAndDescription(content, language);

    // Update the paste with generated metadata
    await prisma.paste.update({
      where: { id: pasteId },
      data: {
        title,
        description,
        aiGenerationStatus: 'COMPLETED',
      },
    });

    // Emit event for SSE
    metadataEventEmitter.emit(pasteId, {
      status: 'completed',
      title,
      description,
    });
  } catch (error) {
    console.error(`Error generating metadata for paste ${pasteId}:`, error);

    // Update status to failed but keep the default title/description
    await prisma.paste.update({
      where: { id: pasteId },
      data: { aiGenerationStatus: 'FAILED' },
    });

    // Emit error event for SSE
    metadataEventEmitter.emit(pasteId, {
      status: 'failed',
    });
  }
}

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

    // Create default title and description
    const defaultTitle = `${data.language.charAt(0).toUpperCase() + data.language.slice(1)} Paste`;
    const defaultDescription = 'Generating description...';

    const paste = await prisma.paste.create({
      data: {
        id: generatePasteId(data.language),
        content: finalContent,
        language: data.language,
        title: defaultTitle,
        description: defaultDescription,
        expiresAt,
        isCompressed: shouldCompressContent,
        passwordHash,
        burnAfterRead,
        aiGenerationStatus: 'PENDING',
      },
    });

    // Start async generation process
    // We don't await this - it runs in the background
    generateMetadataAsync(paste.id, content, data.language);

    return {
      id: paste.id,
      language: paste.language,
      title: paste.title,
      description: paste.description,
      createdAt: paste.createdAt,
      expiresAt: paste.expiresAt,
      hasPassword: !!paste.passwordHash,
      aiGenerationStatus: paste.aiGenerationStatus,
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
        // Convert entries to array before iterating to avoid TypeScript issues
        Array.from(recentViews.entries()).forEach(([entryId, timestamp]) => {
          if (now - timestamp > VIEW_DEBOUNCE_WINDOW * 10) {
            recentViews.delete(entryId);
          }
        });
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
      title: typedPaste.title,
      description: typedPaste.description,
      createdAt: typedPaste.createdAt,
      expiresAt: typedPaste.expiresAt,
      hasPassword: !!typedPaste.passwordHash,
      views: typedUpdatedPaste.views,
      burnAfterRead: typedPaste.burnAfterRead,
      aiGenerationStatus: typedPaste.aiGenerationStatus,
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
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      throw new Error('Paste not found');
    }
    console.error('Error deleting paste:', error);
    throw error;
  }
}
