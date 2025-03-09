import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to protect admin routes by verifying the Authorization header
 * against the CLEANUP_API_KEY environment variable
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const apiKey = process.env.CLEANUP_API_KEY;
    
    if (!apiKey) {
      return NextResponse.next();
    }
    
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  return NextResponse.next();
}

/**
 * Configure middleware to only process admin routes
 */
export const config = {
  matcher: ['/api/admin/:path*'],
};
