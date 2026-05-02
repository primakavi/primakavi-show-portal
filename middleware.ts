import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLogin = pathname === "/login";
  const isAdmin = pathname.startsWith("/admin");
  const isAdminMarkus = pathname.startsWith("/admin/markus");

  if (isAdmin && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLogin && !user) {
    return response;
  }

  if (isLogin && user) {
    const role = await getRole(supabase, user.id);

    if (role === "markus") {
      return NextResponse.redirect(new URL("/admin/markus", request.url));
    }

    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!isAdmin || !user) {
    return response;
  }

  const role = await getRole(supabase, user.id);

  if (!role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (role === "markus") {
    if (isAdminMarkus) {
      return response;
    }

    return NextResponse.redirect(new URL("/admin/markus", request.url));
  }

  if (role === "sonja") {
    return response;
  }

  if (role === "admin") {
    return response;
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

async function getRole(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Role lookup failed:", error.message);
    return null;
  }

  return data?.role || null;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};