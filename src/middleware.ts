import { getToken } from "next-auth/jwt";
import { NextMiddleware, NextResponse } from "next/server";

export const middleware: NextMiddleware = async (req) => {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Si está en login
  if (req.nextUrl.pathname === "/login") {
    if (session) {
      // Si tiene sesión, verificar tenant
      if (session.tenantName) {
        // Tiene tenant, ir al dashboard
        const url = req.nextUrl.clone();
        url.pathname = `/home/dashboard`;
        return NextResponse.redirect(url);
      } else {
        // No tiene tenant, ir a waiting
        const url = req.nextUrl.clone();
        url.pathname = `/waiting`;
        return NextResponse.redirect(url);
      }
    }
    // No tiene sesión, quedarse en login
    return NextResponse.next();
  }

  // Si está en waiting
  if (req.nextUrl.pathname === "/waiting") {
    if (!session) {
      // No tiene sesión, ir a login
      const url = req.nextUrl.clone();
      url.pathname = `/login`;
      return NextResponse.redirect(url);
    }
    if (session.tenantName) {
      // Ya tiene tenant, ir al dashboard
      const url = req.nextUrl.clone();
      url.pathname = `/home/dashboard`;
      return NextResponse.redirect(url);
    }
    // Tiene sesión pero no tenant, quedarse en waiting
    return NextResponse.next();
  }

  // Si está en /home/*
  if (req.nextUrl.pathname.startsWith("/home")) {
    if (!session) {
      // No tiene sesión, ir a login
      const url = req.nextUrl.clone();
      url.pathname = `/login`;
      return NextResponse.redirect(url);
    }
    if (!session.tenantName) {
      // No tiene tenant, ir a waiting
      const url = req.nextUrl.clone();
      url.pathname = `/waiting`;
      return NextResponse.redirect(url);
    }
    // Tiene sesión y tenant, continuar
    return NextResponse.next();
  }

  // Para otras rutas
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = `/login`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/home/:path*", "/login", "/waiting", "/"],
};
