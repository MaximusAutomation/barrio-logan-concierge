/**
 * Lightweight host authentication for dashboard-related endpoints.
 *
 * Uses a shared secret (HOST_DASHBOARD_KEY env var) that the host includes
 * in requests via the Authorization header (Bearer token).
 *
 * Appropriate for a solo-host micro-property with no database/accounts.
 * The host sets HOST_DASHBOARD_KEY as a Vercel deployment secret and
 * accesses the dashboard at /host/dashboard?key=<secret>.
 */

/**
 * Validate a host dashboard key against the HOST_DASHBOARD_KEY env var.
 *
 * @returns true if the key matches the env var, false otherwise.
 *          If HOST_DASHBOARD_KEY is not set, always returns false (secure by default).
 */
export function validateHostKey(key: string | null | undefined): boolean {
  const expected = process.env.HOST_DASHBOARD_KEY;
  if (!expected || !key) return false;
  return key === expected;
}

/**
 * Extract the host key from an incoming request.
 * Checks the Authorization header (Bearer <key>) first, then the ?key= query param.
 */
export function extractHostKey(req: Request): string | null {
  // Check Authorization header first
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Fall back to query parameter
  const url = new URL(req.url);
  return url.searchParams.get("key");
}
