import { headers } from 'next/headers';

/**
 * Gets the base URL for server-side API calls with multiple fallback options
 * @returns The base URL as a string
 */
export function getBaseUrl(): string {
  // Try to get origin from headers first
  const origin = headers().get('origin');
  if (origin) {
    return origin;
  }

  // Try x-forwarded-* headers (common in production deployments)
  const forwardedProto = headers().get('x-forwarded-proto');
  const forwardedHost = headers().get('x-forwarded-host');
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  // Try host header with protocol detection
  const host = headers().get('host');
  if (host) {
    // In development, assume http. In production, prefer https
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    return `${protocol}://${host}`;
  }

  // Environment variable fallback
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // Last resort - you should replace this with your actual domain
  console.warn('Could not determine base URL, using fallback. Please set NEXTAUTH_URL environment variable.');
  return 'https://projet-pfe-seven.vercel.app/';
}
