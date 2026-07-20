"use client";
/**
 * Host Dashboard — attach-rate measurement view for the property owner.
 *
 * Displays server-side in-memory event counters as the primary data source.
 * Counters reset on cold start (serverless limitation); durable analytics
 * live in Vercel function logs (stdout).
 *
 * Gated behind HOST_DASHBOARD_KEY — the host accesses this page at
 * /host/dashboard?key=<secret>. The key is passed to /api/analytics/counters.
 *
 * Reachable at: /host/dashboard?key=<HOST_DASHBOARD_KEY>
 */
import { useEffect, useState, useCallback } from "react";
import { exportEventsJSON } from "@/lib/analytics";

/**
 * Extract breakdown entries from server counters using compound keys.
 * e.g., prefix "booking-click" extracts { "airport-transfer": 3 } from
 * the counter key "booking-click:airport-transfer".
 */
function extractBreakdown(
  counters: Record<string, number>,
  prefix: string
): Record<string, number> {
  const result: Record<string, number> = {};
  const pfx = `${prefix}:`;
  for (const [key, count] of Object.entries(counters)) {
    if (key.startsWith(pfx)) {
      result[key.slice(pfx.length)] = count;
    }
  }
  return result;
}

/**
 * Fetch result: null = not yet fetched, "auth-error" = invalid key,
 * Record = successfully loaded counters. This avoids synchronous setState
 * inside useEffect (which triggers the set-state-in-effect lint rule).
 */
type FetchResult = Record<string, number> | "auth-error" | null;

export default function HostDashboard() {
  // Read key from URL on mount (lazy initializer — no effect needed)
  const [hostKey, setHostKey] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("key") ?? "";
  });
  const [keyInput, setKeyInput] = useState<string>("");
  const [fetchResult, setFetchResult] = useState<FetchResult>(null);
  const [copied, setCopied] = useState(false);

  // Fetch server counters when hostKey changes — all setState calls are
  // inside async .then()/.catch() callbacks, never synchronous in the body.
  useEffect(() => {
    if (!hostKey) return;

    void fetch("/api/analytics/counters", {
      headers: { Authorization: `Bearer ${hostKey}` },
    })
      .then((r) => {
        if (r.status === 401) {
          setFetchResult("auth-error");
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then((data: Record<string, number> | null) => {
        if (data !== null) setFetchResult(data ?? {});
      })
      .catch(() => setFetchResult({}));
  }, [hostKey]);

  const handleKeySubmit = useCallback(() => {
    const trimmed = keyInput.trim();
    if (trimmed) {
      setHostKey(trimmed);
      setFetchResult(null); // reset to trigger loading state
      // Update URL without reload so the host can bookmark it
      const url = new URL(window.location.href);
      url.searchParams.set("key", trimmed);
      window.history.replaceState({}, "", url.toString());
    }
  }, [keyInput]);

  const handleExport = useCallback(() => {
    const json = exportEventsJSON();
    void navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  // Derive display states from fetchResult (no separate loading/error state)
  const loading = hostKey !== "" && fetchResult === null;
  const authError = fetchResult === "auth-error";
  const serverCounters: Record<string, number> =
    typeof fetchResult === "object" && fetchResult !== null ? fetchResult : {};

  // Derive metrics from server counters (primary data source)
  const upsellImpressions = serverCounters["upsell-impression"] ?? 0;
  const totalUpsellRequests = serverCounters["upsell-request"] ?? 0;
  const bookingImpressions = serverCounters["booking-impression"] ?? 0;
  const totalBookingClicks = serverCounters["booking-click"] ?? 0;

  const partnerClicks = extractBreakdown(serverCounters, "booking-click");
  const upsellRequests = extractBreakdown(serverCounters, "upsell-request");

  // Attach rates — capped at 100% for display since multiple actions per
  // impression are possible (e.g., a guest clicks 3 Book buttons after one
  // services-tab view). The raw counts are shown alongside for transparency.
  const upsellAttachRate =
    upsellImpressions > 0
      ? Math.min((totalUpsellRequests / upsellImpressions) * 100, 100).toFixed(
          1
        )
      : "--";
  const bookingAttachRate =
    bookingImpressions > 0
      ? Math.min(
          (totalBookingClicks / bookingImpressions) * 100,
          100
        ).toFixed(1)
      : "--";

  // If no key yet, show the key-entry form
  if (!hostKey) {
    return (
      <div className="dashboard">
        <header className="dashboard__header">
          <h1 className="dashboard__title">325 Barrio Host Dashboard</h1>
          <p className="dashboard__subtitle">
            Enter your dashboard key to view metrics.
          </p>
        </header>

        <div className="dashboard__key-form">
          <input
            type="password"
            className="dashboard__key-input"
            placeholder="Dashboard key"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleKeySubmit()}
          />
          <button
            type="button"
            className="dashboard__key-btn"
            onClick={handleKeySubmit}
          >
            View Dashboard
          </button>
          <p className="dashboard__caveat">
            Set HOST_DASHBOARD_KEY in your Vercel environment variables, then
            access this page at /host/dashboard?key=your-secret.
          </p>
        </div>
        <style>{dashboardStyles}</style>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="dashboard">
        <header className="dashboard__header">
          <h1 className="dashboard__title">325 Barrio Host Dashboard</h1>
          <p className="dashboard__subtitle" style={{ color: "#c0392b" }}>
            Invalid dashboard key. Check your HOST_DASHBOARD_KEY environment
            variable.
          </p>
        </header>
        <button
          type="button"
          className="dashboard__key-btn"
          onClick={() => {
            setHostKey("");
            setFetchResult(null);
          }}
        >
          Try a different key
        </button>
        <style>{dashboardStyles}</style>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">325 Barrio Host Dashboard</h1>
        <p className="dashboard__subtitle">
          Attach-rate metrics for upsells and affiliate bookings
        </p>
      </header>

      {loading && (
        <p className="dashboard__text">Loading server counters...</p>
      )}

      {/* Summary cards (from server counters) */}
      <div className="dashboard__grid">
        <div className="metric-card">
          <span className="metric-card__label">Upsell impressions</span>
          <span className="metric-card__value">{upsellImpressions}</span>
          <span className="metric-card__note">
            Guests who saw early/late checkout
          </span>
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
          <span className="metric-card__note">
            Guests who viewed services tab
          </span>
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
          <h2 className="dashboard__section-title">
            Upsell requests by option
          </h2>
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

      <p className="dashboard__caveat">
        Server counters are in-memory and reset on serverless cold starts. For
        durable data, filter Vercel function logs by &quot;analytics-event&quot;
        or &quot;upsell-request&quot;.
      </p>

      {/* Client-side export (this device only — debug/secondary) */}
      <section className="dashboard__section">
        <h2 className="dashboard__section-title">
          Export raw data (this device)
        </h2>
        <p className="dashboard__text">
          Copy client-side events stored in this browser&apos;s localStorage as
          JSON. This is device-specific data, not aggregated guest metrics.
        </p>
        <button
          type="button"
          className="dashboard__export-btn"
          onClick={handleExport}
        >
          {copied ? "Copied!" : "Copy JSON to clipboard"}
        </button>
      </section>

      <style>{dashboardStyles}</style>
    </div>
  );
}

const dashboardStyles = `
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
  .dashboard__key-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 360px;
  }
  .dashboard__key-input {
    padding: 0.5rem 0.75rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 0.9rem;
  }
  .dashboard__key-btn {
    padding: 0.5rem 1rem;
    background: #2d6a4f;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
    width: fit-content;
  }
  .dashboard__key-btn:hover {
    background: #1e4a36;
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
    margin-bottom: 1.5rem;
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
`;
