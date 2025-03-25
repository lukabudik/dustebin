import { NextRequest, NextResponse } from 'next/server';
import { getPaste } from '@/lib/services/paste-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> & { id: string } }
): Promise<NextResponse> {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json({ error: 'Paste ID is required' }, { status: 400 });
    }

    const paste = await getPaste({ id });

    if (!paste.hasImage || !paste.imageUrl) {
      return NextResponse.json({ error: 'Not an image paste' }, { status: 400 });
    }

    const imageResponse = await fetch(paste.imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': paste.originalMimeType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get image' },
      { status: 500 }
    );
  }
}
