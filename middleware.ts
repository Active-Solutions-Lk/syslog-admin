import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define which routes should be protected
const protectedRoutes = ['/dashboard', '/api/admin'];
const publicRoutes = ['/auth/login', '/api/login'];

// Check if the route should be protected
function isProtectedRoute(pathname: string) {
  // Skip public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return false;
  }
  
  // Check if it's a protected route
  return protectedRoutes.some(route => pathname.startsWith(route));
}

// Verify JWT token
async function verifyJWT(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Middleware - Pathname:', pathname);
  
  // If it's not a protected route, continue
  if (!isProtectedRoute(pathname)) {
    console.log('Middleware - Not a protected route, continuing');
    return NextResponse.next();
  }
  
  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value;
  console.log('Middleware - Token from cookie:', token);
  
  // If no token, redirect to login
  if (!token) {
    console.log('Middleware - No token found, redirecting to login');
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Verify token
  const payload = await verifyJWT(token);
  console.log('Middleware - Token Payload:', payload);
  if (!payload) {
    // Token invalid, redirect to login
    console.log('Middleware - Invalid token, redirecting to login');
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Token is valid, continue
  console.log('Middleware - Token is valid, allowing access');
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};