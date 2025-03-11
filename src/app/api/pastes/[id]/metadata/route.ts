import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { metadataEventEmitter } from '@/lib/services/paste-service';

// Define types for metadata events
interface MetadataEvent {
  status: 'pending' | 'completed' | 'failed' | 'timeout' | 'error';
  title?: string;
  description?: string;
  message?: string;
}

// Define a type for paste with the new fields
interface PasteWithMetadata {
  id: string;
  content: string;
  language: string;
  title?: string;
  description?: string;
  createdAt: Date;
  expiresAt: Date | null;
  isCompressed: boolean;
  passwordHash: string | null;
  views: number;
  burnAfterRead: boolean;
  aiGenerationStatus?: string;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const pasteId = params.id;

  // Set headers for SSE
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  };

  // Create a TransformStream for sending events
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Function to send events to the client
  const sendEvent = async (data: MetadataEvent) => {
    try {
      await writer.write(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
      // Use console.warn instead of console.log to comply with ESLint rules
      console.warn('SSE event sent:', data.status);
    } catch (error) {
      console.error('Error sending SSE event:', error);
    }
  };

  try {
    // Check initial status
    const paste = await prisma.paste.findUnique({
      where: { id: pasteId },
    });

    if (!paste) {
      await sendEvent({ status: 'error', message: 'Paste not found' });
      writer.close();
      return new Response(stream.readable, { headers });
    }

    // Cast to PasteWithMetadata to work around TypeScript issues with the new fields
    const typedPaste = paste as PasteWithMetadata;

    // If generation is already complete, send the data immediately
    if (typedPaste.aiGenerationStatus === 'COMPLETED') {
      await sendEvent({
        status: 'completed',
        title: typedPaste.title,
        description: typedPaste.description,
      });
      writer.close();
    } else if (typedPaste.aiGenerationStatus === 'FAILED') {
      await sendEvent({ status: 'failed' });
      writer.close();
    } else {
      // If still pending, send initial status and keep connection open
      await sendEvent({ status: 'pending' });

      // Set up event listener for this paste ID
      const eventHandler = async (data: MetadataEvent) => {
        await sendEvent(data);
        // Close the connection after sending the event
        metadataEventEmitter.removeListener(pasteId, eventHandler);
        writer.close();
      };

      // Listen for metadata updates for this paste
      metadataEventEmitter.once(pasteId, eventHandler);

      // Set up a timeout to close the connection if no event is received
      // This prevents hanging connections
      const timeout = setTimeout(() => {
        metadataEventEmitter.removeListener(pasteId, eventHandler);
        sendEvent({ status: 'timeout' }).then(() => writer.close());
      }, 30000); // 30 second timeout

      // Clean up if the client disconnects
      request.signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        metadataEventEmitter.removeListener(pasteId, eventHandler);
        writer.close();
      });
    }
  } catch (error) {
    console.error('Error in metadata SSE:', error);
    await sendEvent({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    writer.close();
  }

  return new Response(stream.readable, { headers });
}
