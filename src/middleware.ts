import { getToken } from "next-auth/jwt";
import { NextMiddleware, NextResponse } from "next/server";

export const middleware: NextMiddleware = async (req) => {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!session) {
    if (req.nextUrl.pathname !== "/login") {
      const url = req.nextUrl.clone();
      url.pathname = `/login`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const userEmail = (session as any)?.user?.email || session.email;
  const isLogisticUser = userEmail === "hola@firstplug.com";

  if (isLogisticUser) {
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

  if (req.nextUrl.pathname === "/home/logistics") {
    const url = req.nextUrl.clone();
    url.pathname = `/home/dashboard`;
    return NextResponse.redirect(url);
  }

  if (req.nextUrl.pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = `/home/dashboard`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/home/:path*", "/login", "/"],
};
