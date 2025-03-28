import sharp from 'sharp';

// Increased quality for better fidelity
const DEFAULT_QUALITY = 90;

export async function compressImage(
  buffer: Buffer,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: string; // Can be original format or specific format
  } = {}
): Promise<{
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
  format: string;
  mimeType: string;
  originalFormat: string;
  originalMimeType: string;
}> {
  try {
    const { quality = DEFAULT_QUALITY } = options;

    const metadata = await sharp(buffer).metadata();
    const originalFormat = metadata.format || 'jpeg';

    const format = options.format || originalFormat;

    let pipeline = sharp(buffer, {
      failOnError: false,
    }).withMetadata();

    // No automatic resizing - preserve original dimensions

    let mimeType: string;

    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({ quality });
        mimeType = 'image/webp';
        break;
      case 'jpeg':
      case 'jpg':
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        mimeType = 'image/jpeg';
        break;
      case 'png':
        pipeline = pipeline.png({
          quality,
          compressionLevel: 9,
          adaptiveFiltering: true,
        });
        mimeType = 'image/png';
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality });
        mimeType = 'image/avif';
        break;
      case 'gif':
        pipeline = pipeline.gif();
        mimeType = 'image/gif';
        break;
      case 'tiff':
        pipeline = pipeline.tiff({ quality });
        mimeType = 'image/tiff';
        break;
      default:
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        mimeType = 'image/jpeg';
    }

    const result = await pipeline.toBuffer({ resolveWithObject: true });

    const mimeTypeMap: Record<string, string> = {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      avif: 'image/avif',
      heic: 'image/heic',
      heif: 'image/heic',
      tiff: 'image/tiff',
      tif: 'image/tiff',
      bmp: 'image/bmp',
    };

    const originalMimeType = mimeTypeMap[originalFormat] || 'application/octet-stream';

    return {
      buffer: result.data,
      width: result.info.width,
      height: result.info.height,
      size: result.data.length,
      format,
      mimeType,
      originalFormat,
      originalMimeType,
    };
  } catch {
    throw new Error('Failed to process image');
  }
}

export async function generateThumbnail(
  buffer: Buffer,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): Promise<Buffer> {
  try {
    const { width = 200, height = 200, quality = 70 } = options;

    return await sharp(buffer)
      .resize(width, height, { fit: 'inside' })
      .webp({ quality })
      .toBuffer();
  } catch {
    throw new Error('Failed to generate thumbnail');
  }
}

export async function validateImage(
  buffer: Buffer,
  maxSizeBytes: number = 50 * 1024 * 1024
): Promise<{
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
  format?: string;
}> {
  try {
    if (buffer.length > maxSizeBytes) {
      return {
        valid: false,
        error: `Image exceeds maximum size of ${Math.round(maxSizeBytes / (1024 * 1024))}MB`,
      };
    }

    const metadata = await sharp(buffer).metadata();

    const supportedFormats = [
      'jpeg',
      'jpg',
      'png',
      'webp',
      'gif',
      'heic',
      'heif',
      'avif',
      'tiff',
      'tif',
      'bmp',
    ];
    if (metadata.format && !supportedFormats.includes(metadata.format)) {
      return {
        valid: false,
        error: `Unsupported image format: ${metadata.format}. Supported formats: ${supportedFormats.join(', ')}`,
      };
    }

    return {
      valid: true,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
    };
  } catch {
    return {
      valid: false,
      error: 'Invalid image file',
    };
  }
}
