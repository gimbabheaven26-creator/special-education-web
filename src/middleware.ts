import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const IEUMJIN_ALLOWED_PATHS = new Set([
  '/',
  '/terms',
  '/manifest.webmanifest',
  '/manifest.json',
]);

const IEUMJIN_ALLOWED_PREFIXES = [
  '/api/',
  '/auth/',
  '/_next/',
  '/icons/',
  '/images/',
];

function isIeumjinRequest(request: NextRequest) {
  return Boolean(process.env.NEXT_PUBLIC_IEUMJIN_SITE_URL)
    || request.nextUrl.hostname.includes('ieumjin')
    || request.nextUrl.port === '3104';
}

function isIeumjinAllowedPath(pathname: string) {
  if (IEUMJIN_ALLOWED_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/terms/')) return true;
  if (IEUMJIN_ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  return /\.[a-z0-9]+$/i.test(pathname);
}

export async function middleware(request: NextRequest) {
  if (isIeumjinRequest(request) && !isIeumjinAllowedPath(request.nextUrl.pathname)) {
    const entryUrl = request.nextUrl.clone();
    entryUrl.pathname = '/';
    entryUrl.search = '?from=legacy';
    return NextResponse.redirect(entryUrl);
  }

  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return supabaseResponse;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // 세션 토큰 갱신 (로그인 유지)
  const { data: { user } } = await supabase.auth.getUser();

  // /my/* 보호: 미로그인 시 /login으로 리다이렉트
  if (!user && request.nextUrl.pathname.startsWith('/my')) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // /admin/* 보호: 미로그인 시 /login으로 리다이렉트
  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
