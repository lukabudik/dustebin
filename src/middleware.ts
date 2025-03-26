import { NextRequest, NextResponse } from 'next/server';
import { rateLimitService } from './lib/services/rate-limit-service';

/**
 * Middleware to handle rate limiting and admin route protection
 */
export function middleware(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const apiKey = process.env.CLEANUP_API_KEY;

    if (!apiKey) {
      return NextResponse.next();
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith('/api')) {
    const { limited, headers, resetTime } = rateLimitService.checkRequestLimit(ip);

    if (limited) {
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          resetTime: resetTime ? new Date(resetTime).toISOString() : undefined,
        },
        {
          status: 429,
          headers,
        }
      );
    }

    if (request.nextUrl.pathname === '/api/pastes' && request.method === 'POST') {
      const { limited, headers, resetTime } = rateLimitService.checkPasteCreationLimit(ip);

      if (limited) {
        return NextResponse.json(
          {
            error: 'Too Many Requests',
            message: 'Paste creation rate limit exceeded. Please try again later.',
            resetTime: resetTime ? new Date(resetTime).toISOString() : undefined,
          },
          {
            status: 429,
            headers,
          }
        );
      }

      const response = NextResponse.next();
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Expose rate limit headers to the client
      response.headers.set(
        'Access-Control-Expose-Headers',
        'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset'
      );

      return response;
    }

    const response = NextResponse.next();
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Expose rate limit headers to the client
    response.headers.set(
      'Access-Control-Expose-Headers',
      'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset'
    );

    return response;
  }

  return NextResponse.next();
}

/**
 * Configure middleware to process API routes and admin routes
 */
export const config = {
  matcher: ['/api/:path*'],
};
