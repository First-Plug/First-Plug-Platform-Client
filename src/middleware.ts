import { getToken } from "next-auth/jwt";
import { NextMiddleware, NextResponse } from "next/server";

export const middleware: NextMiddleware = async (req) => {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (req.nextUrl.pathname !== "/login") {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = `/login`;

      return NextResponse.redirect(url);
    }
  } else {
    if (session) {
      const url = req.nextUrl.clone();
      url.pathname = `/home/my-team`;

      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/home/:path*", "/login", "/"],
};
