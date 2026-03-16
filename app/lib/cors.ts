import { NextResponse } from 'next/server';

/**
 * CORS utility for API routes
 * Reads allowed origins from CORS_ALLOWED_ORIGINS environment variable
 */

export function getCorsHeaders(origin: string | null): HeadersInit {
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
  
  // If no origins configured, allow all (for development)
  const isAllowed = allowedOrigins.length === 0 || (origin && allowedOrigins.includes(origin));
  
  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : allowedOrigins[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleCors(request: Request): Response | undefined {
  const origin = request.headers.get('origin');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }
  
  return undefined;
}

export function corsResponse(data: any, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(data, init);
  const origin = typeof window !== 'undefined' ? window.location.origin : null;
  
  const corsHeaders = getCorsHeaders(origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value as string);
  });
  
  return response;
}
