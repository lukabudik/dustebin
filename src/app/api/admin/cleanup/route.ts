import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * POST /api/admin/cleanup - Deletes all expired pastes
 * 
 * Protected by middleware in src/middleware.ts
 * Can be called by scheduled jobs (cron, Vercel Cron Jobs, etc.)
 */
export async function POST() {
  try {
    const result = await prisma.paste.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      deleted: result.count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error cleaning up expired pastes:', error);
    return NextResponse.json({ error: 'Failed to clean up expired pastes' }, { status: 500 });
  }
}
