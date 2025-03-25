import { prisma } from '../db';
import { calculateExpirationDate, generatePasteId } from '../utils/helpers';
import { formatCode, isFormattable } from '../utils/code-formatter';
import { hashPassword, comparePassword } from '../utils/password-utils';
import { shouldCompress, compressText, decompressText } from '../utils/compression';
import { compressImage, validateImage } from '../utils/image-compression';
import { extractExifData } from '../utils/exif-extractor';
import { generateImageKey, uploadToR2, deleteFromR2 } from './storage-service';
import { CreatePasteInput, GetPasteInput } from '../validations';
import { generateTitleAndDescription } from './gemini-service';

import { EventEmitter } from 'events';
export const metadataEventEmitter = new EventEmitter();

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
  hasImage: boolean;
  imageKey?: string;
  imageUrl?: string;
  imageMimeType?: string;
  imageSize?: number;
  imageWidth?: number;
  imageHeight?: number;
  originalFormat?: string;
  originalMimeType?: string;
  pasteType: string;
  exifData?: Record<string, unknown> | null;
}

const recentViews = new Map<string, number>();
const VIEW_DEBOUNCE_WINDOW = 2000;

async function generateMetadataAsync(pasteId: string, content: string, language: string) {
  try {
    const { title, description } = await generateTitleAndDescription(content, language);

    await prisma.paste.update({
      where: { id: pasteId },
      data: {
        title,
        description,
        aiGenerationStatus: 'COMPLETED',
      },
    });

    metadataEventEmitter.emit(pasteId, {
      status: 'completed',
      title,
      description,
    });
  } catch {
    await prisma.paste.update({
      where: { id: pasteId },
      data: { aiGenerationStatus: 'FAILED' },
    });

    metadataEventEmitter.emit(pasteId, {
      status: 'failed',
    });
  }
}

export async function createPaste(data: CreatePasteInput) {
  try {
    const expiresAt = data.expiration ? calculateExpirationDate(data.expiration) : null;
    const burnAfterRead = data.expiration === 'burn';

    let content = data.content || '';
    let finalContent = content;
    let shouldCompressContent = false;

    if (content) {
      if (isFormattable(data.language)) {
        content = await formatCode(content, data.language);
        finalContent = content;
      }

      shouldCompressContent = shouldCompress(content);
      if (shouldCompressContent) {
        const compressedBuffer = await compressText(content);
        finalContent = compressedBuffer.toString('base64');
      }
    }

    let passwordHash = null;
    if (data.password) {
      passwordHash = await hashPassword(data.password);
    }

    const defaultTitle = `${data.language.charAt(0).toUpperCase() + data.language.slice(1)} Paste`;
    const defaultDescription = 'Generating description...';

    let imageData: {
      hasImage?: boolean;
      imageKey?: string;
      imageUrl?: string;
      imageMimeType?: string;
      imageSize?: number;
      imageWidth?: number;
      imageHeight?: number;
      originalFormat?: string;
      originalMimeType?: string;
      pasteType?: string;
      exifData?: Record<string, unknown> | null;
    } = {};
    if (data.image) {
      const matches = data.image.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid image data format');
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const imageBuffer = Buffer.from(base64Data, 'base64');

      const originalMimeType = mimeType;
      const originalFormat = data.originalFormat || mimeType.split('/')[1] || 'jpeg';

      const validation = await validateImage(imageBuffer);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid image');
      }

      const exifData = await extractExifData(imageBuffer);

      const compressed = await compressImage(imageBuffer, {
        quality: 80,
        format: originalFormat,
      });

      const imageKey = generateImageKey(compressed.format);

      const imageUrl = await uploadToR2(compressed.buffer, imageKey, compressed.mimeType);

      imageData = {
        hasImage: true,
        imageKey,
        imageUrl,
        imageMimeType: compressed.mimeType,
        imageSize: compressed.size,
        imageWidth: compressed.width,
        imageHeight: compressed.height,
        originalFormat,
        originalMimeType,
      };

      if (exifData) {
        imageData.exifData = exifData;
      }
    }

    const pasteType = data.pasteType || (data.image ? 'image' : 'text');
    const originalFormat = data.image ? data.originalFormat || imageData.originalFormat : undefined;

    const paste = await prisma.paste.create({
      data: {
        id: generatePasteId(data.language, { pasteType, originalFormat }),
        content: finalContent,
        language: pasteType === 'image' ? 'image' : data.language,
        title: defaultTitle,
        description: defaultDescription,
        expiresAt,
        isCompressed: shouldCompressContent,
        passwordHash,
        burnAfterRead,
        aiGenerationStatus: 'PENDING',
        pasteType,
        hasImage: imageData.hasImage || false,
        imageKey: imageData.imageKey,
        imageUrl: imageData.imageUrl,
        imageMimeType: imageData.imageMimeType,
        imageSize: imageData.imageSize,
        imageWidth: imageData.imageWidth,
        imageHeight: imageData.imageHeight,
        originalFormat: imageData.originalFormat,
        originalMimeType: imageData.originalMimeType,
        exifData: imageData.exifData ? JSON.parse(JSON.stringify(imageData.exifData)) : null,
      },
    });

    if (content && !data.image) {
      generateMetadataAsync(paste.id, content, data.language);
    } else if (data.image) {
      await prisma.paste.update({
        where: { id: paste.id },
        data: {
          title: 'Image Paste',
          description: 'An image shared via Dustebin',
          aiGenerationStatus: 'COMPLETED',
        },
      });
    }

    return {
      id: paste.id,
      language: paste.language,
      title: paste.title,
      description: paste.description,
      createdAt: paste.createdAt,
      expiresAt: paste.expiresAt,
      hasPassword: !!paste.passwordHash,
      hasImage: !!imageData.hasImage,
      imageUrl: imageData.imageUrl as string | undefined,
      aiGenerationStatus: paste.aiGenerationStatus,
      pasteType: data.pasteType || 'text',
      originalFormat: imageData.originalFormat,
      originalMimeType: imageData.originalMimeType,
      imageWidth: imageData.imageWidth,
      imageHeight: imageData.imageHeight,
      imageSize: imageData.imageSize,
      exifData: imageData.exifData,
    };
  } catch (error) {
    throw error;
  }
}

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

      if (recentViews.size > 1000) {
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
      pasteType: typedPaste.pasteType,
      hasImage: typedPaste.hasImage,
      imageUrl: typedPaste.imageUrl,
      imageWidth: typedPaste.imageWidth,
      imageHeight: typedPaste.imageHeight,
      imageSize: typedPaste.imageSize,
      originalFormat: typedPaste.originalFormat,
      originalMimeType: typedPaste.originalMimeType,
      exifData: typedPaste.exifData || null,
    };
  } catch (error) {
    throw error;
  }
}

export async function deletePaste(id: string) {
  try {
    const paste = await prisma.paste.findUnique({
      where: { id },
    });

    if (!paste) {
      throw new Error('Paste not found');
    }

    const typedPaste = paste as Paste;

    if (typedPaste.hasImage && typedPaste.imageKey) {
      try {
        await deleteFromR2(typedPaste.imageKey);
      } catch {}
    }

    await prisma.paste.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      throw new Error('Paste not found');
    }
    throw error;
  }
}
