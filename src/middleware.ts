import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/verify-email',
  '/auth/reset-password'
];

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/transactions',
  '/dashboard/transactions/add',
  '/dashboard/reports',
  '/dashboard/settings'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Always allow access in development mode for easier testing
  if (isDevelopment) {
    // Log for informational purposes
    console.log(`Development mode: allowing access to ${pathname}`);
    return NextResponse.next();
  }
  
  // Production mode - check for auth
  // This is a simplified check, as you'd normally use supabase-js to verify the token
  const hasSession = request.cookies.has('sb-access-token') || 
                     request.cookies.has('sb-refresh-token');
  
  // If user is not logged in and trying to access a protected route
  if (!hasSession && protectedRoutes.some(route => pathname.startsWith(route))) {
    // Redirect to login page
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirect', encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }
  
  // If user is logged in and trying to access auth pages
  if (hasSession && pathname.startsWith('/auth') && pathname !== '/auth/verify-email') {
    // Redirect to dashboard
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }
  
  // Continue for all other cases
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 