/**
 * Client-side analytics — lightweight event tracking for upsell + booking
 * attach-rate measurement.
 *
 * Events are:
 *   - Stored in localStorage for client-side persistence / host export
 *   - Beaconed to /api/analytics for server-side log capture (Vercel function logs)
 *
 * No external analytics SDK, no cookies, no PII. This is a minimal DIY layer
 * designed for a solo-host property with ~24 guest parties/month.
 *
 * Event types:
 *   upsell-impression   — upsell section scrolled into view
 *   upsell-request      — guest submitted an early/late request
 *   booking-impression   — a bookable place card scrolled into view
 *   booking-click        — guest clicked a "Book" CTA (also logged server-side by /go/[partner])
 *
 * Canonical import path: @/lib/analytics
 */

/** The shape of a tracked analytics event. */
export interface AnalyticsEvent {
  /** Event type identifier. */
  event: string;
  /** ISO 8601 timestamp. */
  timestamp: string;
  /** Optional metadata (e.g., partner key, upsell option ID, price). */
  meta?: Record<string, string | number | boolean>;
}

/** localStorage key for the event log. */
const STORAGE_KEY = "concierge.analytics";

/** Maximum events retained in localStorage (rolling window). */
const MAX_STORED_EVENTS = 500;

/**
 * Track an event: write to localStorage + fire-and-forget beacon to /api/analytics.
 *
 * Safe to call on the server (SSR) — silently no-ops when window is unavailable.
 */
export function trackEvent(
  event: string,
  meta?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;

  const entry: AnalyticsEvent = {
    event,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };

  // 1. Persist to localStorage
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const existing: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    existing.push(entry);
    // Keep only the most recent MAX_STORED_EVENTS entries.
    const trimmed =
      existing.length > MAX_STORED_EVENTS
        ? existing.slice(existing.length - MAX_STORED_EVENTS)
        : existing;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage unavailable — continue, beacon still fires.
  }

  // 2. Fire-and-forget beacon to server
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics",
        new Blob([JSON.stringify(entry)], { type: "application/json" })
      );
    } else {
      // Fallback for browsers without sendBeacon
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
        keepalive: true,
      });
    }
  } catch {
    // Beacon failed — analytics is best-effort, never block the UI.
  }
}

/**
 * Read all stored events from localStorage.
 * Returns an empty array on the server or if localStorage is unavailable.
 */
export function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Export stored events as a downloadable JSON string.
 * The host can copy/save this for analysis.
 */
export function exportEventsJSON(): string {
  return JSON.stringify(getStoredEvents(), null, 2);
}
