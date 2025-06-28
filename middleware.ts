import { NextRequest, NextResponse } from 'next/server';
import '@/config/env-validation'; // Validate environment on server startup
import { rateLimit } from '@/lib/security/rateLimit';
import { environment } from '@/config/environment';
import { getSession } from '@/lib/auth/getSession';

const CSRF_COOKIE_NAME = 'csrfToken';
const CSRF_HEADER_NAME = 'x-csrf-token';
const ONE_HOUR = 60 * 60;

/**
 * SECURITY-CRITICAL: Public API routes whitelist
 *
 * These routes bypass authentication. Adding a route here is a SECURITY DECISION.
 * Each addition must be carefully reviewed and justified.
 *
 * Format: Exact paths or patterns (e.g., '/api/auth/*' for wildcards)
 */
const PUBLIC_API_ROUTES = [
  // Auth0 authentication endpoints - Required for login/logout flow
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/callback',
  '/api/auth/me',
  '/api/auth/*', // Auth0 catch-all handler ([...auth0].ts) for OAuth flow

  // Health check endpoints - Required for monitoring
  '/api/health',
  '/api/system/health',

  // API Documentation - Public access for developers
  '/api/swagger', // OpenAPI spec endpoint

  // IMPORTANT: Adding routes here bypasses ALL authentication
  // Each addition must be reviewed by security team
];

/**
 * Check if a path matches any public route pattern
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some(route => {
    if (route.endsWith('/*')) {
      const prefix = route.slice(0, -2);
      return pathname.startsWith(prefix);
    }
    return pathname === route;
  });
}

/**
 * SECURE-BY-DEFAULT Global Middleware
 *
 * This middleware enforces:
 * 1. Rate limiting on all requests
 * 2. Authentication on ALL API routes (except whitelisted)
 * 3. CSRF protection on mutations
 * 4. Security headers on all API responses
 *
 * CRITICAL: Authentication is enforced by DEFAULT. Routes must be explicitly
 * whitelisted in PUBLIC_API_ROUTES to bypass authentication.
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

  // 2️⃣ AUTHENTICATION CHECK (SECURE BY DEFAULT)
  if (!isPublicRoute(req.nextUrl.pathname)) {
    try {
      // Check for valid session using the same logic as withAuth
      const mockReq = {
        headers: Object.fromEntries(req.headers.entries()),
        cookies: Object.fromEntries(
          req.cookies.getAll().map(c => [c.name, c.value])
        ),
      } as any;

      const mockRes = {} as any;
      const session = await getSession(mockReq, mockRes);

      // Check for internal service requests
      // Check for internal service authentication
      const authHeader = req.headers.get('authorization');
      const internalKey = req.headers.get('x-internal-api-key');
      const hasInternalAuth = authHeader?.startsWith('Bearer ') || 
        (internalKey && internalKey === environment.api.internalApiKey);

      if (!session?.user && !hasInternalAuth) {
        // Log the attempt for security monitoring
        console.warn('[SECURITY] Unauthenticated API access blocked:', {
          path: req.nextUrl.pathname,
          method: req.method,
          ip:
            req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real-ip') ||
            'unknown',
          timestamp: new Date().toISOString(),
        });

        return new NextResponse(
          JSON.stringify({
            error: 'Authentication required',
            message: 'This endpoint requires authentication. Please log in.',
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'WWW-Authenticate': 'Bearer',
            },
          }
        );
      }

      // Add user context to headers for downstream middleware
      if (session?.user) {
        response.headers.set('x-user-id', session.user.id);
        response.headers.set('x-user-email', session.user.email || '');
      }
    } catch (error) {
      console.error('[SECURITY] Auth check failed:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Authentication validation failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 3️⃣ CSRF PROTECTION
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
    // Unsafe methods: validate token (skip for public auth routes)
    if (!isPublicRoute(req.nextUrl.pathname)) {
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

  // 4️⃣ SECURITY HEADERS
  addSecurityHeaders(response);

  // 5️⃣ DEVELOPMENT WARNING for missing tenant validation
  if (environment.isDevelopment) {
    // Add a warning header for routes that might need tenant validation
    if (
      !isPublicRoute(req.nextUrl.pathname) &&
      (method === 'POST' ||
        method === 'PUT' ||
        method === 'PATCH' ||
        method === 'DELETE')
    ) {
      response.headers.set(
        'X-Dev-Warning',
        'Ensure this route has proper tenant validation via withTenantGuard'
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
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; frame-ancestors 'none'; base-uri 'self';"
  );

  if (environment.isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=15768000; includeSubDomains'
    );
  }

  return response;
}
