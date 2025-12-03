import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Role-based access control
  if (user) {
    // Fetch user role from public.users table
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = (userData?.role || 'pembeli').toLowerCase().trim()
    const path = request.nextUrl.pathname

    // Admin trying to access Petani pages
    if (role === 'admin' && path.startsWith('/petani')) {
      return NextResponse.redirect(new URL('/admin/beranda', request.url))
    }

    // Petani trying to access Admin pages
    if (role === 'petani' && path.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/petani/beranda', request.url))
    }

    // Pembeli trying to access Admin or Petani pages
    if (role === 'pembeli' && (path.startsWith('/admin') || path.startsWith('/petani'))) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } else {
    // Not logged in
    const path = request.nextUrl.pathname
    if (path.startsWith('/admin') || path.startsWith('/petani')) {
      return NextResponse.redirect(new URL('/masuk', request.url))
    }
  }

  return response
}
