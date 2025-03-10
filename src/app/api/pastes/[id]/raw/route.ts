import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { comparePassword } from '@/lib/utils/password-utils';
import { decompressText } from '@/lib/utils/compression';
import { Paste } from '@prisma/client';

// Extended Paste type to ensure TypeScript recognizes all fields
interface PasteWithBurnAfterRead extends Paste {
  burnAfterRead: boolean;
}

// In-memory cache to prevent duplicate view counts (paste ID -> timestamp)
const recentViews = new Map<string, number>();
const VIEW_DEBOUNCE_WINDOW = 2000; // 2 seconds

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const password = request.nextUrl.searchParams.get('password');
    
    const paste = await prisma.paste.findUnique({
      where: { id },
    });
    
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
    
    // Check for burn-after-reading confirmation
    const confirmBurn = request.nextUrl.searchParams.get('confirm') === 'true';
    
    // Access burnAfterRead field with proper typing
    const isBurnAfterRead = (paste as PasteWithBurnAfterRead).burnAfterRead;
    
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
          }
        }
      );
    }
    
    // Delete burn-after-reading paste asynchronously if confirmed
    if ((paste as PasteWithBurnAfterRead).burnAfterRead && confirmBurn) {
      prisma.paste.delete({
        where: { id },
      }).catch(err => console.error('Error deleting burn-after-read paste:', err));
    }
    
    return new NextResponse(finalContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `inline; filename="${id}.txt"`,
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Burn-After-Reading': (paste as PasteWithBurnAfterRead).burnAfterRead ? 'true' : 'false',
      },
    });
  } catch (error) {
    console.error('Error fetching raw paste:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
