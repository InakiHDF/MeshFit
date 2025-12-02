import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  // We need to check if the user is authenticated.
  // Since we are using manual cookie management in our actions for simplicity,
  // we check for the 'sb-access-token' cookie.

  const accessToken = request.cookies.get('sb-access-token')?.value;
  const refreshToken = request.cookies.get('sb-refresh-token')?.value;

  // If no token and trying to access protected routes
  if (!accessToken && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If has token and trying to access login, redirect to home
  if (accessToken && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svgs etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)',
  ],
};
