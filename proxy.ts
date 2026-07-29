import { NextResponse, type NextRequest } from "next/server";
import {
  adminUnauthorizedResponse,
  isAdminRequest,
} from "@/app/lib/admin-auth";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isReportsAdminApi =
    (request.method === "GET" || request.method === "DELETE") &&
    (pathname === "/api/reports" || pathname.startsWith("/api/reports/"));

  // Report pages contain no server-rendered report data and display an
  // application login on every visit. Report API data remains protected here
  // and is verified again inside each report route handler.
  if (isReportsAdminApi && !isAdminRequest(request)) {
    return adminUnauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
