import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { comparePassword } from '@/lib/utils/password-utils';
import { decompressText } from '@/lib/utils/compression';

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
  hasImage: boolean;
  imageUrl?: string;
  imageMimeType?: string;
  pasteType?: string;
  originalFormat?: string;
}

const recentViews = new Map<string, number>();
const VIEW_DEBOUNCE_WINDOW = 2000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> & { id: string } }
) {
  try {
    const id = params.id;

    const password = request.nextUrl.searchParams.get('password');

    const paste = (await prisma.paste.findUnique({
      where: { id },
    })) as Paste;

    if (!paste) {
      return new NextResponse('Paste not found', { status: 404 });
    }

    if (paste.expiresAt && new Date(paste.expiresAt) < new Date()) {
      await prisma.paste.delete({ where: { id } });
      return new NextResponse('Paste has expired', { status: 404 });
    }

    if (paste.passwordHash) {
      if (!password) {
        return new NextResponse('Password required', { status: 401 });
      }

      const isPasswordValid = await comparePassword(password, paste.passwordHash);
      if (!isPasswordValid) {
        return new NextResponse('Invalid password', { status: 401 });
      }
    }

    const now = Date.now();
    const lastViewTime = recentViews.get(id);

    if (!lastViewTime || now - lastViewTime > VIEW_DEBOUNCE_WINDOW) {
      recentViews.set(id, now);

      await prisma.paste.update({
        where: { id },
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

    const confirmBurn = request.nextUrl.searchParams.get('confirm') === 'true';
    const isBurnAfterRead = paste.burnAfterRead;

    if (isBurnAfterRead && !confirmBurn) {
      return new NextResponse(
        'This paste is configured for burn-after-reading. ' +
          'To view it, you must confirm that you understand it will be permanently deleted after viewing. ' +
          'Add ?confirm=true to the URL to proceed.',
        {
          status: 403,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Burn-After-Reading': 'true',
          },
        }
      );
    }

    if (paste.burnAfterRead && confirmBurn) {
      prisma.paste
        .delete({
          where: { id },
        })
        .catch(() => {
          // Silently fail - paste will be deleted on next access
        });
    }

    if (paste.hasImage && paste.imageUrl) {
      const downloadUrl = `/api/pastes/${id}/download`;
      return NextResponse.redirect(new URL(downloadUrl, request.url));
    }

    const filename = paste.originalFormat
      ? `${id}.${paste.originalFormat}`
      : `${id}.${paste.language === 'plaintext' ? 'txt' : paste.language}`;

    return new NextResponse(finalContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        'X-Burn-After-Reading': paste.burnAfterRead ? 'true' : 'false',
      },
    });
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
