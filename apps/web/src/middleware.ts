import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PROTECTED_PREFIX = '/dashboard'

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const isProtected = pathname.startsWith(PROTECTED_PREFIX)

  if (!isProtected) return

  const token = await getToken({ req })

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname + (search || ''))
    return NextResponse.redirect(loginUrl)
  }

  // authenticated → allow
  return
}

export const config = {
  matcher: ['/dashboard/:path*'],
}