import { NextApiRequest } from 'next';
import { IncomingMessage } from 'http';
import { environment } from '@/config/environment';

/**
 * Gets the client IP address from various request headers
 * @param req Next.js API request object
 * @returns Client IP address
 */
export function getClientIp(req: NextApiRequest | any): string {
  // Check for Cloudflare or similar proxy headers
  const cfConnectingIp = req.headers['cf-connecting-ip'];
  if (cfConnectingIp) {
    return Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp;
  }

  // Check for x-forwarded-for header (used by most proxies)
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    // Get the first IP in the chain which is the client's IP
    const forwardedIps = Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor;
    return forwardedIps.split(',')[0].trim();
  }

  // Check for real IP header (used by some proxies like Nginx)
  const xRealIp = req.headers['x-real-ip'];
  if (xRealIp) {
    return Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
  }

  // Check for socket address (direct connection)
  const remoteAddress = req.socket?.remoteAddress;
  if (remoteAddress) {
    return remoteAddress;
  }

  // If everything fails, return null
  return '';
}

/**
 * Gets the origin of a request
 * @param req Next.js API request object
 * @returns The origin (protocol + hostname)
 */
export function getOrigin(req: NextApiRequest | any): string {
  // Try to get it from the request headers
  const origin = req.headers.origin || req.headers.referer;
  if (origin) {
    return origin;
  }

  // Fallback to host header
  const host = req.headers.host;
  if (host) {
    const protocol =
      req.headers['x-forwarded-proto'] ||
      (environment.isProduction ? 'https' : 'http');
    return `${protocol}://${host}`;
  }

  // If everything fails, return empty string
  return '';
}

export function getProtocol(req?: IncomingMessage): string {
  if (req) {
    const forwarded = req.headers['x-forwarded-proto'];
    if (forwarded) {
      return Array.isArray(forwarded) ? forwarded[0] : forwarded;
    }

    const host = req.headers.host;
    if (host && host.includes('localhost')) {
      return 'http';
    }
  }

  return environment.isProduction ? 'https' : 'http';
}
