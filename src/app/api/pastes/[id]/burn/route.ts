import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { deletePaste } from '@/lib/services/paste-service'; // Used for burn-after-reading functionality

/**
 * POST /api/pastes/[id]/burn - Deletes a burn-after-reading paste
 * after user confirmation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> & { id: string } }
) {
  try {
    const id = params.id;

    const paste = await prisma.paste.findUnique({
      where: { id },
      select: {
        id: true,
        burnAfterRead: true,
      },
    });

    if (!paste) {
      return NextResponse.json({ error: 'Paste not found' }, { status: 404 });
    }

    if (!paste.burnAfterRead) {
      return NextResponse.json(
        { error: 'This paste is not configured for burn-after-reading' },
        { status: 400 }
      );
    }

    await deletePaste(id);

    return NextResponse.json({
      success: true,
      message: 'Paste has been burned',
    });
  } catch (error) {
    console.error('Error burning paste:', error);
    return NextResponse.json({ error: 'Failed to burn paste' }, { status: 500 });
  }
}
