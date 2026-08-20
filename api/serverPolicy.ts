export function shouldAllowUnauthenticatedLocalFallback(
  env: { NODE_ENV?: string; VERCEL_ENV?: string },
  hasAuthClient: boolean,
): boolean {
  if (hasAuthClient) return false;
  return env.NODE_ENV === "test" || (env.NODE_ENV === "development" && env.VERCEL_ENV !== "preview");
}

export interface ReadinessChecks {
  authentication: boolean;
  database: boolean;
  ai: boolean;
}

export function getReadinessStatus(checks: ReadinessChecks): { ready: boolean; checks: ReadinessChecks } {
  return {
    ready: checks.authentication && checks.database && checks.ai,
    checks,
  };
}
