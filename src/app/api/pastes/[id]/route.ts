import { NextRequest, NextResponse } from 'next/server';
import { getPaste, deletePaste } from '@/lib/services/paste-service';
import { getPasteSchema, deletePasteSchema } from '@/lib/validations';

/**
 * GET /api/pastes/[id] - Retrieves a paste by ID with optional password authentication
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get password from headers or query params
    const password = request.headers.get('X-Password') || 
                     new URL(request.url).searchParams.get('password') || 
                     undefined;
                     
    const params = await context.params;
    const id = params.id;

    const result = getPasteSchema.safeParse({
      id,
      password,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.format() },
        { status: 400 }
      );
    }

    const paste = await getPaste(result.data);

    return NextResponse.json(paste, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Paste not found') {
        return NextResponse.json(
          { error: 'Paste not found' },
          { status: 404 }
        );
      }
      if (error.message === 'Paste has expired') {
        return NextResponse.json(
          { error: 'Paste has expired' },
          { status: 410 }
        );
      }
      if (error.message === 'Incorrect password') {
        return NextResponse.json(
          { error: 'Incorrect password' },
          { status: 401 }
        );
      }
    }

    console.error('Error getting paste:', error);
    return NextResponse.json(
      { error: 'Failed to get paste' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pastes/[id] - Permanently deletes a paste by ID
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const id = params.id;
    
    const result = deletePasteSchema.safeParse({
      id,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.format() },
        { status: 400 }
      );
    }

    await deletePaste(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Paste not found') {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }

    console.error('Error deleting paste:', error);
    return NextResponse.json(
      { error: 'Failed to delete paste' },
      { status: 500 }
    );
  }
}
