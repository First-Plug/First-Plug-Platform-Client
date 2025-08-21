import { getToken } from "next-auth/jwt";
import { NextMiddleware, NextResponse } from "next/server";

export const middleware: NextMiddleware = async (req) => {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (req.nextUrl.pathname === "/login") {
    if (session) {
      if (session.tenantName) {
        const url = req.nextUrl.clone();
        url.pathname = `/home/dashboard`;
        return NextResponse.redirect(url);
      } else {
        const url = req.nextUrl.clone();
        url.pathname = `/waiting`;
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

  if (req.nextUrl.pathname === "/waiting") {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = `/login`;
      return NextResponse.redirect(url);
    }
    if (session.tenantName) {
      const url = req.nextUrl.clone();
      url.pathname = `/home/dashboard`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = `/login`;
    return NextResponse.redirect(url);
  }

  const userEmail = (session as any)?.user?.email || session.email;
  const userRole = (session as any)?.user?.role || session.role;
  const adminEmails = ["hola@firstplug.com", "superadmin@mail.com"];
  const isLogisticUser = adminEmails.includes(userEmail);
  const isSuperAdmin = userRole === "superadmin";

  // Manejar usuarios admin (por email o por role)
  if (isLogisticUser || isSuperAdmin) {
    const allowedPaths = [
      "/home/logistics",
      "/home/unassigned-users",
      "/home/assigned-users",
      "/home/tenants",
    ];
    const currentPath = req.nextUrl.pathname;

    if (allowedPaths.includes(currentPath)) {
      return NextResponse.next();
    }

    if (currentPath === "/" || currentPath === "/login") {
      const url = req.nextUrl.clone();
      url.pathname = `/home/logistics`;
      return NextResponse.redirect(url);
    }

    if (currentPath.startsWith("/home/")) {
      const url = req.nextUrl.clone();
      url.pathname = `/home/logistics`;
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // Solo redirigir usuarios normales de logistics a dashboard
  if (
    req.nextUrl.pathname === "/home/logistics" &&
    !isLogisticUser &&
    !isSuperAdmin
  ) {
    const url = req.nextUrl.clone();
    url.pathname = `/home/dashboard`;
    return NextResponse.redirect(url);
  }

  if (req.nextUrl.pathname.startsWith("/home")) {
    // Solo validar tenant para usuarios normales (no admin)
    if (!session.tenantName && !isLogisticUser && !isSuperAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = `/waiting`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/home/:path*", "/login", "/waiting", "/"],
};
