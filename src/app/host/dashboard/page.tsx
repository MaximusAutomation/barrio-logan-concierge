"use client";
/**
 * Host Dashboard — attach-rate measurement view for the property owner.
 *
 * Shows analytics event counts from two sources:
 *   1. Client-side localStorage events (durable, per-device)
 *   2. Server-side in-memory counters (best-effort, resets on cold start)
 *
 * This page is NOT gated behind auth — it is a simple, low-stakes metrics
 * view for a solo-host property with ~24 guest parties/month. If the host
 * wants to restrict access, they can add basic auth or IP-restrict via
 * Vercel/Cloudflare configuration.
 *
 * Reachable at: /host/dashboard
 */
import { useEffect, useState, useCallback } from "react";
import { getStoredEvents, exportEventsJSON } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/analytics";

/** Group events by type and count them. */
function countByType(events: AnalyticsEvent[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of events) {
    counts[e.event] = (counts[e.event] ?? 0) + 1;
  }
  return counts;
}

/** Group booking-click events by partner. */
function countBookingClicksByPartner(
  events: AnalyticsEvent[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of events) {
    if (e.event === "booking-click" && e.meta?.partner) {
      const partner = String(e.meta.partner);
      counts[partner] = (counts[partner] ?? 0) + 1;
    }
  }
  return counts;
}

/** Group upsell-request events by option. */
function countUpsellsByOption(
  events: AnalyticsEvent[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of events) {
    if (e.event === "upsell-request" && e.meta?.optionId) {
      const option = String(e.meta.optionId);
      counts[option] = (counts[option] ?? 0) + 1;
    }
  }
  return counts;
}

/** Events from the last N days. */
function filterLastDays(events: AnalyticsEvent[], days: number): AnalyticsEvent[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return events.filter((e) => new Date(e.timestamp) >= cutoff);
}

export default function HostDashboard() {
  // Lazy initializer: reads localStorage once on mount (client-side only).
  const [events] = useState<AnalyticsEvent[]>(() => getStoredEvents());
  const [serverCounters, setServerCounters] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState(false);
  const [timeWindow, setTimeWindow] = useState<number>(7); // days

  useEffect(() => {
    // Fetch server-side counters (async, updates state in the fetch callback)
    void fetch("/api/analytics/counters")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: Record<string, number>) => setServerCounters(data ?? {}))
      .catch(() => setServerCounters({}));
  }, []);

  const filteredEvents = filterLastDays(events, timeWindow);
  const typeCounts = countByType(filteredEvents);
  const partnerClicks = countBookingClicksByPartner(filteredEvents);
  const upsellRequests = countUpsellsByOption(filteredEvents);

  const handleExport = useCallback(() => {
    const json = exportEventsJSON();
    void navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  // Key metrics for the summary
  const upsellImpressions = typeCounts["upsell-impression"] ?? 0;
  const totalUpsellRequests = typeCounts["upsell-request"] ?? 0;
  const bookingImpressions = typeCounts["booking-impression"] ?? 0;
  const totalBookingClicks = typeCounts["booking-click"] ?? 0;

  const upsellAttachRate =
    upsellImpressions > 0
      ? ((totalUpsellRequests / upsellImpressions) * 100).toFixed(1)
      : "--";
  const bookingAttachRate =
    bookingImpressions > 0
      ? ((totalBookingClicks / bookingImpressions) * 100).toFixed(1)
      : "--";

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">325 Barrio Host Dashboard</h1>
        <p className="dashboard__subtitle">
          Attach-rate metrics for upsells and affiliate bookings
        </p>
      </header>

      {/* Time window selector */}
      <div className="dashboard__controls">
        <label htmlFor="time-window" className="dashboard__label">
          Showing last:
        </label>
        <select
          id="time-window"
          className="dashboard__select"
          value={timeWindow}
          onChange={(e) => setTimeWindow(Number(e.target.value))}
        >
          <option value={1}>24 hours</option>
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>

      {/* Summary cards */}
      <div className="dashboard__grid">
        <div className="metric-card">
          <span className="metric-card__label">Upsell impressions</span>
          <span className="metric-card__value">{upsellImpressions}</span>
          <span className="metric-card__note">Guests who saw early/late checkout</span>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Upsell requests</span>
          <span className="metric-card__value">{totalUpsellRequests}</span>
          <span className="metric-card__note">
            Attach rate: {upsellAttachRate}%
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Booking impressions</span>
          <span className="metric-card__value">{bookingImpressions}</span>
          <span className="metric-card__note">Guests who viewed services tab</span>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Booking clicks</span>
          <span className="metric-card__value">{totalBookingClicks}</span>
          <span className="metric-card__note">
            Click-through rate: {bookingAttachRate}%
          </span>
        </div>
      </div>

      {/* Booking clicks by partner */}
      {Object.keys(partnerClicks).length > 0 && (
        <section className="dashboard__section">
          <h2 className="dashboard__section-title">Clicks by partner</h2>
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>Partner</th>
                <th>Clicks</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(partnerClicks)
                .sort(([, a], [, b]) => b - a)
                .map(([partner, count]) => (
                  <tr key={partner}>
                    <td>{partner}</td>
                    <td>{count}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Upsell requests by option */}
      {Object.keys(upsellRequests).length > 0 && (
        <section className="dashboard__section">
          <h2 className="dashboard__section-title">Upsell requests by option</h2>
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>Option</th>
                <th>Requests</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(upsellRequests)
                .sort(([, a], [, b]) => b - a)
                .map(([option, count]) => (
                  <tr key={option}>
                    <td>{option}</td>
                    <td>{count}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Server-side counters (best effort) */}
      {Object.keys(serverCounters).length > 0 && (
        <section className="dashboard__section">
          <h2 className="dashboard__section-title">
            Server-side counters (since last cold start)
          </h2>
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(serverCounters)
                .sort(([, a], [, b]) => b - a)
                .map(([event, count]) => (
                  <tr key={event}>
                    <td>{event}</td>
                    <td>{count}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <p className="dashboard__caveat">
            Server counters reset on cold start (serverless). For durable data,
            use the JSON export below or check Vercel function logs.
          </p>
        </section>
      )}

      {/* Export */}
      <section className="dashboard__section">
        <h2 className="dashboard__section-title">Export raw data</h2>
        <p className="dashboard__text">
          Copy all {events.length} client-side events as JSON for spreadsheet
          analysis. This data is stored in your browser&apos;s localStorage.
        </p>
        <button
          type="button"
          className="dashboard__export-btn"
          onClick={handleExport}
        >
          {copied ? "Copied!" : "Copy JSON to clipboard"}
        </button>
      </section>

      <style>{`
        .dashboard {
          max-width: 720px;
          margin: 0 auto;
          padding: 1.5rem 1rem 3rem;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1a1a1a;
        }
        .dashboard__header {
          margin-bottom: 1.5rem;
        }
        .dashboard__title {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .dashboard__subtitle {
          font-size: 0.85rem;
          color: #666;
        }
        .dashboard__controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }
        .dashboard__label {
          font-size: 0.85rem;
          font-weight: 500;
        }
        .dashboard__select {
          padding: 0.35rem 0.6rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 0.85rem;
        }
        .dashboard__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .metric-card {
          background: #f8f8f6;
          border: 1px solid #e8e8e4;
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .metric-card__label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #888;
        }
        .metric-card__value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #2d6a4f;
          line-height: 1;
        }
        .metric-card__note {
          font-size: 0.75rem;
          color: #999;
        }
        .dashboard__section {
          margin-bottom: 1.5rem;
        }
        .dashboard__section-title {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .dashboard__table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .dashboard__table th,
        .dashboard__table td {
          padding: 0.5rem 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e8e8e4;
        }
        .dashboard__table th {
          font-weight: 600;
          color: #666;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .dashboard__caveat {
          font-size: 0.75rem;
          color: #999;
          margin-top: 0.5rem;
          font-style: italic;
        }
        .dashboard__text {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 0.5rem;
        }
        .dashboard__export-btn {
          padding: 0.5rem 1rem;
          background: #2d6a4f;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .dashboard__export-btn:hover {
          background: #1e4a36;
        }
      `}</style>
    </div>
  );
}
