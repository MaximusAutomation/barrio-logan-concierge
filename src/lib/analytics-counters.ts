/**
 * Server-side in-memory analytics counters.
 *
 * Shared between /api/analytics (writes) and /api/analytics/counters (reads).
 * Resets on cold start — this is a best-effort serverless-compatible counter.
 * The durable analytics record is in Vercel function logs (stdout) and
 * client-side localStorage.
 *
 * Server-only module — do not import in client components.
 */

/** In-memory event counters keyed by event type. */
const counters: Record<string, number> = {};

/** Increment the counter for an event type. */
export function incrementCounter(event: string): void {
  counters[event] = (counters[event] ?? 0) + 1;
}

/** Get a snapshot of all counters. */
export function getCounters(): Record<string, number> {
  return { ...counters };
}
