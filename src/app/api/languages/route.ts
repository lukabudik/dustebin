import { NextResponse } from 'next/server';
import { LANGUAGES } from '@/lib/constants';

/**
 * GET /api/languages - Returns list of supported languages for syntax highlighting
 */
export async function GET() {
  try {
    return NextResponse.json({ languages: LANGUAGES });
  } catch (error) {
    console.error('Error getting languages:', error);
    return NextResponse.json(
      { error: 'Failed to get languages' },
      { status: 500 }
    );
  }
}
