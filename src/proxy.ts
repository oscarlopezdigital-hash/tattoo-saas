import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const superAdminEmail = process.env.SUPERADMIN_EMAIL;
  const isSuperAdmin = !!user && user.email === superAdminEmail;

  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/registro");

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  const isDashboardRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/calendario") ||
    request.nextUrl.pathname.startsWith("/clientes") ||
    request.nextUrl.pathname.startsWith("/ingresos") ||
    request.nextUrl.pathname.startsWith("/configuracion");

  const isRootRoute = request.nextUrl.pathname === "/";

  // Usuario logueado en landing → su panel
  if (user && isRootRoute) {
    return NextResponse.redirect(new URL(isSuperAdmin ? "/admin" : "/dashboard", request.url));
  }

  // Superadmin: login → /admin
  if (user && isSuperAdmin && isAuthRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Superadmin intenta entrar al dashboard de estudio → /admin
  if (user && isSuperAdmin && isDashboardRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Proteger /admin: solo superadmin
  if (isAdminRoute && !isSuperAdmin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Usuario normal: login → /dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Proteger dashboard: requiere login
  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|reservar|consentimiento|api).*)",
  ],
};
