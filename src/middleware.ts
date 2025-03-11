import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/auth/sign-in', '/auth/sign-up', '/auth/sign-out', '/privacy-policy', '/terms']

export async function middleware(request: NextRequest) {
  const session = await auth()

  // Check if the path is in public routes
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname === route)

  if (!session && !isPublicRoute) {
    // Redirect to sign-in page if not authenticated and trying to access protected route
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
