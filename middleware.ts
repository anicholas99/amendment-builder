import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/security/rateLimit.edge'; // Use Edge-compatible version
import { environment } from '@/config/environment';

const CSRF_COOKIE_NAME = 'csrfToken';
const CSRF_HEADER_NAME = 'x-csrf-token';
const ONE_HOUR = 60 * 60;

/**
 * SECURE-BY-DEFAULT Global Middleware
 *
 * This middleware enforces:
 * 1. Rate limiting on all requests
 * 2. CSRF protection on mutations
 * 3. Security headers on all API responses
 *
 * Note: Authentication is handled in API routes, not in middleware.
 * This keeps the middleware lightweight and allows for more flexible auth handling.
 */
export async function middleware(req: NextRequest) {
  // 1️⃣ Global rate limiting
  const rateLimitResponse = rateLimit(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Only process API routes
  if (!req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // 2️⃣ CSRF PROTECTION
  const method = req.method.toUpperCase();
  const tokenFromCookie = req.cookies.get(CSRF_COOKIE_NAME)?.value;

  // Safe methods: ensure token exists
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    if (!tokenFromCookie) {
      const token = crypto.randomUUID();
      response.cookies.set({
        name: CSRF_COOKIE_NAME,
        value: token,
        httpOnly: true,
        sameSite: 'lax',
        secure: environment.isProduction,
        path: '/',
        maxAge: ONE_HOUR,
      });
      response.headers.set(CSRF_HEADER_NAME, token);
    } else {
      response.headers.set(CSRF_HEADER_NAME, tokenFromCookie);
    }
  } else {
    // Unsafe methods: validate token (skip for auth routes)
    const isAuthRoute = req.nextUrl.pathname.startsWith('/api/auth/');
    if (!isAuthRoute) {
      const tokenFromHeader = req.headers.get(CSRF_HEADER_NAME);
      if (
        !tokenFromCookie ||
        !tokenFromHeader ||
        tokenFromCookie !== tokenFromHeader
      ) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid CSRF token' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }
  }

  // 3️⃣ SECURITY HEADERS
  addSecurityHeaders(response);

  // 4️⃣ DEVELOPMENT WARNING for missing tenant validation
  if (environment.isDevelopment) {
    // Add a warning header for routes that might need tenant validation
    const isAuthRoute = req.nextUrl.pathname.startsWith('/api/auth/');
    const isCsrfRoute = req.nextUrl.pathname === '/api/csrf-token';
    const isHealthRoute = req.nextUrl.pathname.includes('/health');
    
    if (
      !isAuthRoute &&
      !isCsrfRoute &&
      !isHealthRoute &&
      (method === 'POST' ||
        method === 'PUT' ||
        method === 'PATCH' ||
        method === 'DELETE')
    ) {
      response.headers.set(
        'X-Dev-Warning',
        'Ensure this route has proper auth validation via withAuth and tenant validation via withTenantGuard'
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  // CSP is already set in next.config.js with proper configuration
  // Don't override it here

  if (environment.isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=15768000; includeSubDomains'
    );
  }

  return response;
}
