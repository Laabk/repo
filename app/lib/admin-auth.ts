function readBasicCredentials(authorization: string | null) {
  if (!authorization?.startsWith("Basic ")) return null;

  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(":");
    if (separator < 0) return null;
    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

export function isAdminRequest(request: Request) {
  const expectedUsername = process.env.ADMIN_USERNAME?.trim() || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const entered = readBasicCredentials(request.headers.get("authorization"));

  return Boolean(
    expectedPassword &&
    entered?.username === expectedUsername &&
    entered.password === expectedPassword,
  );
}

export function adminUnauthorizedResponse() {
  return Response.json(
    { error: "Administrator username or password is incorrect." },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
