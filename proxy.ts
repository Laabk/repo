import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isReportsPage = pathname === "/reports" || pathname.startsWith("/reports/");
  const isReportsReadApi =
    request.method === "GET" &&
    (pathname === "/api/reports" || pathname.startsWith("/api/reports/"));

  // Forms, drafts, report creation, and shared signing links are intentionally
  // public. Only viewing submitted reports requires administrator credentials.
  if (!isReportsPage && !isReportsReadApi) {
    return NextResponse.next();
  }

  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD;
  const authorization = request.headers.get("authorization");

  if (password && authorization?.startsWith("Basic ")) {
    try {
      const [enteredUser, enteredPassword] = atob(authorization.slice(6)).split(":");
      if (enteredUser === username && enteredPassword === password) {
        return NextResponse.next();
      }
    } catch {
      // The challenge below handles malformed credentials.
    }
  }

  return new NextResponse("Administrator sign-in required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Field Activity Reports"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
