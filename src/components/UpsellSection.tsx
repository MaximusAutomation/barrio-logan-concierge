"use client";
/**
 * UpsellSection — guest-facing early check-in / late checkout request UI.
 *
 * Displays configurable upsell options (from src/lib/upsell-config.ts) with
 * a simple request form. The host manually approves or declines each request
 * because there is no calendar/PMS integration to gate availability.
 *
 * Analytics: tracks impressions (IntersectionObserver) and request submissions.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { UpsellOption } from "@/lib/upsell-config";
import { trackEvent } from "@/lib/analytics";

interface UpsellSectionProps {
  options: UpsellOption[];
  heading: string;
  subheading: string;
  propertyCheckIn: string;
  propertyCheckOut: string;
}

type RequestState = "idle" | "submitting" | "success" | "error";

export default function UpsellSection({
  options,
  heading,
  subheading,
  propertyCheckIn,
  propertyCheckOut,
}: UpsellSectionProps) {
  // Only show enabled options
  const enabledOptions = options.filter((o) => o.enabled);

  // Track which option the guest has selected for the request form
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [roomRef, setRoomRef] = useState("");
  const [note, setNote] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [successMessage, setSuccessMessage] = useState("");

  // Impression tracking via IntersectionObserver
  const sectionRef = useRef<HTMLElement>(null);
  const impressionTracked = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || impressionTracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          impressionTracked.current = true;
          trackEvent("upsell-impression", {
            options: enabledOptions.map((o) => o.id).join(","),
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabledOptions]);

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
    setRequestState("idle");
    setSuccessMessage("");
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedId || !guestName.trim()) return;

      setRequestState("submitting");

      const selectedOption = enabledOptions.find((o) => o.id === selectedId);

      try {
        const res = await fetch("/api/upsell-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            optionId: selectedId,
            guestName: guestName.trim(),
            roomRef: roomRef.trim() || undefined,
            note: note.trim() || undefined,
          }),
        });

        if (!res.ok) throw new Error("Request failed");

        const data = await res.json();
        setRequestState("success");
        setSuccessMessage(data.message ?? "Request sent!");

        // Track the conversion
        trackEvent("upsell-request", {
          optionId: selectedId,
          price: selectedOption?.price ?? 0,
          title: selectedOption?.title ?? "",
        });

        // Reset form after success
        setGuestName("");
        setRoomRef("");
        setNote("");
      } catch {
        setRequestState("error");
      }
    },
    [selectedId, guestName, roomRef, note, enabledOptions]
  );

  if (enabledOptions.length === 0) return null;

  return (
    <section ref={sectionRef} className="upsell-section" aria-label="Flexible check-in and checkout">
      <div className="upsell-section__inner">
        <h2 className="upsell-section__heading">{heading}</h2>
        <p className="upsell-section__subheading">{subheading}</p>

        <div className="upsell-options">
          {enabledOptions.map((option) => {
            const isSelected = selectedId === option.id;
            const standardTime =
              option.id === "early-checkin" ? propertyCheckIn : propertyCheckOut;

            return (
              <button
                key={option.id}
                type="button"
                className={`upsell-card${isSelected ? " upsell-card--selected" : ""}`}
                onClick={() => handleSelect(option.id)}
                aria-pressed={isSelected}
                aria-label={`${option.title} for $${option.price}`}
              >
                <div className="upsell-card__header">
                  <span className="upsell-card__title">{option.title}</span>
                  <span className="upsell-card__price">${option.price}</span>
                </div>
                <p className="upsell-card__desc">{option.description}</p>
                <div className="upsell-card__time-change">
                  <span className="upsell-card__time-old">{standardTime}</span>
                  <span className="upsell-card__time-arrow" aria-hidden="true">
                    &rarr;
                  </span>
                  <span className="upsell-card__time-new">
                    {option.adjustedTime}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Request form — shown when an option is selected */}
        {selectedId && requestState !== "success" && (
          <form className="upsell-form" onSubmit={handleSubmit}>
            <p className="upsell-form__note">
              Requests are subject to availability. The host will confirm
              via your Airbnb message thread.
            </p>
            <div className="upsell-form__field">
              <label htmlFor="upsell-name" className="upsell-form__label">
                Your first name
              </label>
              <input
                id="upsell-name"
                type="text"
                className="upsell-form__input"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Sarah"
                required
                maxLength={50}
                autoComplete="given-name"
              />
            </div>
            <div className="upsell-form__field">
              <label htmlFor="upsell-room" className="upsell-form__label">
                Room or booking reference (optional)
              </label>
              <input
                id="upsell-room"
                type="text"
                className="upsell-form__input"
                value={roomRef}
                onChange={(e) => setRoomRef(e.target.value)}
                placeholder="e.g. Room 2, or your Airbnb confirmation code"
                maxLength={100}
              />
            </div>
            <div className="upsell-form__field">
              <label htmlFor="upsell-note" className="upsell-form__label">
                Any details? (optional)
              </label>
              <input
                id="upsell-note"
                type="text"
                className="upsell-form__input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Arriving on a 6am flight"
                maxLength={200}
              />
            </div>
            <button
              type="submit"
              className="upsell-form__submit"
              disabled={requestState === "submitting" || !guestName.trim()}
            >
              {requestState === "submitting"
                ? "Sending..."
                : `Request ${enabledOptions.find((o) => o.id === selectedId)?.title?.toLowerCase() ?? "option"}`}
            </button>
            {requestState === "error" && (
              <p className="upsell-form__error" role="alert">
                Something went wrong. Please try again or message the host directly.
              </p>
            )}
          </form>
        )}

        {/* Success confirmation */}
        {requestState === "success" && (
          <div className="upsell-success" role="status">
            <span className="upsell-success__icon" aria-hidden="true">
              &#10003;
            </span>
            <p className="upsell-success__text">{successMessage}</p>
          </div>
        )}
      </div>
    </section>
  );
}
