import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth'
      return NextResponse.redirect(redirectUrl)
    }

    const { data: user } = await supabase
      .from('users')
      .select('subscription_status, subscription_end_date')
      .eq('id', session.user.id)
      .single()

    if (user) {
      const now = new Date()
      const endDate = user.subscription_end_date ? new Date(user.subscription_end_date) : null

      if (
        user.subscription_status === 'expired' || 
        user.subscription_status === 'cancelled' ||
        (endDate && endDate < now)
      ) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/subscription-expired'
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  if (req.nextUrl.pathname === '/auth' && session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth'],
}
