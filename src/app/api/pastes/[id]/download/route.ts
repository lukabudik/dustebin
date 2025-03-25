import { NextRequest, NextResponse } from 'next/server';
import { getPaste } from '@/lib/services/paste-service';
import sharp from 'sharp';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> & { id: string } }
): Promise<NextResponse> {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Paste ID is required' }, { status: 400 });
    }

    const format = request.nextUrl.searchParams.get('format') || 'original';
    const paste = await getPaste({ id });

    if (!paste.hasImage || !paste.imageUrl) {
      return NextResponse.json({ error: 'Not an image paste' }, { status: 400 });
    }

    const imageResponse = await fetch(paste.imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    let targetFormat = format === 'original' ? paste.originalFormat || 'jpeg' : format;
    let mimeType: string;
    let outputBuffer: Buffer;
    const sharpImage = sharp(Buffer.from(imageBuffer));

    switch (targetFormat.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        outputBuffer = await sharpImage.jpeg({ quality: 90, mozjpeg: true }).toBuffer();
        mimeType = 'image/jpeg';
        targetFormat = 'jpg';
        break;
      case 'png':
        outputBuffer = await sharpImage
          .png({
            compressionLevel: 9,
            adaptiveFiltering: true,
          })
          .toBuffer();
        mimeType = 'image/png';
        targetFormat = 'png';
        break;
      case 'webp':
        outputBuffer = await sharpImage.webp({ quality: 90 }).toBuffer();
        mimeType = 'image/webp';
        targetFormat = 'webp';
        break;
      case 'avif':
        outputBuffer = await sharpImage.avif({ quality: 80 }).toBuffer();
        mimeType = 'image/avif';
        targetFormat = 'avif';
        break;
      default:
        // Default to JPEG for unknown formats
        outputBuffer = await sharpImage.jpeg({ quality: 90, mozjpeg: true }).toBuffer();
        mimeType = 'image/jpeg';
        targetFormat = 'jpg';
    }

    const filename = `dustebin-${id.split('.')[0]}.${targetFormat}`;

    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download paste' },
      { status: 500 }
    );
  }
}
