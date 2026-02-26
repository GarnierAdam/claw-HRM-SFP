import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // Routes publiques (accessible sans authentification)
  const publicRoutes = [
    '/login',
    '/signup',
    '/auth/callback',
    '/forgot-password',
  ]

  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // Si l'utilisateur n'est pas connecté
  if (!session) {
    // Rediriger vers /login si ce n'est pas une route publique
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Permettre l'accès aux routes publiques
    return NextResponse.next()
  }

  // Si l'utilisateur est connecté, rediriger de /login vers le dashboard
  if (session && path === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
