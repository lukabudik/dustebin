import { NextRequest, NextResponse } from 'next/server';
import { createPaste } from '@/lib/services/paste-service';
import { createPasteSchema } from '@/lib/validations';
import { checkContent } from '@/lib/abuse';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let body: {
      content?: string;
      language?: string;
      expiration?: string;
      password?: string;
      image?: string;
      pasteType?: string;
      originalFormat?: string;
    } = {};
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      body = {
        content: (formData.get('content') as string) || '',
        language: formData.get('language') as string,
        expiration: formData.get('expiration') as string,
        password: (formData.get('password') as string) || '',
        pasteType: (formData.get('pasteType') as string) || 'text',
        originalFormat: formData.get('originalFormat') as string,
      };

      const imageFile = formData.get('image') as File;
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        body.image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
      }
    } else {
      body = await request.json();
    }

    const result = createPasteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.format() },
        { status: 400 }
      );
    }

    const content = result.data.content ?? '';
    const abuseAction = checkContent(content);

    if (abuseAction === 'block') {
      return NextResponse.json(
        {
          error: 'Content contains prohibited material. Contact abuse@dustebin.com with questions.',
        },
        { status: 422 }
      );
    }

    const paste = await createPaste(result.data);

    if (abuseAction === 'flag') {
      await prisma.$executeRaw`UPDATE pastes SET is_risky = true WHERE id = ${paste.id}`;
    }

    return NextResponse.json(paste, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create paste' },
      { status: 500 }
    );
  }
}
