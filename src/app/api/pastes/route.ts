import { NextRequest, NextResponse } from 'next/server';
import { createPaste } from '@/lib/services/paste-service';
import { createPasteSchema } from '@/lib/validations';

/**
 * POST /api/pastes - Creates a new paste with the provided content and options
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = createPasteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.format() },
        { status: 400 }
      );
    }

    const paste = await createPaste(result.data);

    return NextResponse.json(paste, { status: 201 });
  } catch (error) {
    console.error('Error creating paste:', error);
    return NextResponse.json(
      { error: 'Failed to create paste' },
      { status: 500 }
    );
  }
}
