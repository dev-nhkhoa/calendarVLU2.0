import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = [
  '/',
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/sign-out',
  '/privacy-policy',
  '/terms',
  '/robots.txt',
  '/sitemap.xml',
  '/api/auth',
  '/api/extension',
]

export async function middleware(request: NextRequest) {
  const session = await auth()

  const pathname = request.nextUrl.pathname

  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))

  if (!session && !isPublicRoute) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
