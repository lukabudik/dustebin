import { NextRequest, NextResponse } from 'next/server';
import { getPaste } from '@/lib/services/paste-service';
import { formatBytes } from '@/lib/utils/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> & { id: string } }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: 'Paste ID is required' }, { status: 400 });
    }

    const paste = await getPaste({ id });

    if (!paste.hasImage || !paste.imageUrl) {
      return NextResponse.json({ error: 'Not an image paste' }, { status: 400 });
    }

    const originalFormat = paste.originalFormat || 'jpeg';
    const width = paste.imageWidth || 800;
    const height = paste.imageHeight || 600;
    const pixelCount = width * height;

    const compressionRatios = {
      jpeg: 0.25, // Medium quality JPEG
      jpg: 0.25, // Same as JPEG
      png: 0.8, // PNG is less compressed for photos
      webp: 0.15, // WebP is more efficient than JPEG
      avif: 0.1, // AVIF is very efficient
      gif: 0.3, // GIF for images
      default: 0.3, // Default fallback
    };

    const originalRatio =
      compressionRatios[originalFormat as keyof typeof compressionRatios] ||
      compressionRatios.default;

    const originalSize = paste.imageSize || Math.round(pixelCount * originalRatio);
    const jpgSize = Math.round(pixelCount * compressionRatios.jpg);
    const pngSize = Math.round(pixelCount * compressionRatios.png);
    const webpSize = Math.round(pixelCount * compressionRatios.webp);
    const avifSize = Math.round(pixelCount * compressionRatios.avif);

    const formats = [
      {
        id: 'original',
        name: `Original (${originalFormat.toUpperCase()})`,
        size: formatBytes(originalSize),
        extension: originalFormat,
      },
      {
        id: 'jpg',
        name: 'JPEG',
        size: formatBytes(jpgSize),
        extension: 'jpg',
      },
      {
        id: 'png',
        name: 'PNG',
        size: formatBytes(pngSize),
        extension: 'png',
      },
      {
        id: 'webp',
        name: 'WebP',
        size: formatBytes(webpSize),
        extension: 'webp',
      },
      {
        id: 'avif',
        name: 'AVIF',
        size: formatBytes(avifSize),
        extension: 'avif',
      },
    ];

    formats.sort((a, b) => {
      if (a.id === 'original') return -1;
      if (b.id === 'original') return 1;

      const aSize = parseFloat(a.size.split(' ')[0]);
      const bSize = parseFloat(b.size.split(' ')[0]);
      return aSize - bSize;
    });

    return NextResponse.json({ formats });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get image formats' },
      { status: 500 }
    );
  }
}
