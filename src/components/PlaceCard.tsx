/**
 * PlaceCard — displays a single place entry with tier badge, meta, tags,
 * host tip, and a map link. Renders an optional photo thumbnail when
 * place.imageUrl is set; layout is unchanged when absent.
 *
 * When place.booking is present a "Book" CTA is rendered that routes through
 * /go/<partner> — a server-side click-tracked redirect (see src/app/go/[partner]/route.ts).
 * The raw affiliate URL is never emitted into the markup; it lives server-side in
 * src/lib/partners.ts.
 *
 * Booking clicks are also tracked client-side via the analytics module so the
 * host can measure click-through attach rates alongside impression data.
 */
import Image from "next/image";
import type { Place } from "@/lib/guide";
import { trackEvent } from "@/lib/analytics";

interface PlaceCardProps {
  place: Place;
}

const TIER_LABELS: Record<Place["tier"], string> = {
  walk: "Walk",
  "short-hop": "Short hop",
  "day-trip": "Day trip",
};

const TIER_EMOJI: Record<Place["tier"], string> = {
  walk: "🚶",
  "short-hop": "🚗",
  "day-trip": "🗺",
};

export default function PlaceCard({ place }: PlaceCardProps) {
  return (
    <article className="place-card">
      {/* Optional place thumbnail — rendered lazy when imageUrl is present */}
      {place.imageUrl && (
        <div className="place-card__thumb">
          <Image
            src={place.imageUrl}
            alt={place.name}
            width={640}
            height={360}
            className="place-card__thumb-img"
            loading="lazy"
          />
        </div>
      )}

      <div className="place-card__header">
        <h3 className="place-card__name">{place.name}</h3>
        <div className="place-card__badges">
          <span className={`tier-badge tier-badge--${place.tier}`}>
            <span aria-hidden="true">{TIER_EMOJI[place.tier]}</span>
            {TIER_LABELS[place.tier]}
          </span>
        </div>
      </div>

      <p className="place-card__blurb">{place.blurb}</p>

      <div className="place-card__meta">
        <span className="place-card__meta-item">
          <span className="place-card__meta-icon" aria-hidden="true">
            {TIER_EMOJI[place.tier]}
          </span>
          {place.distanceText}
        </span>
        {place.hours && (
          <span className="place-card__meta-item">
            <span className="place-card__meta-icon" aria-hidden="true">
              🕐
            </span>
            {place.hours}
          </span>
        )}
      </div>

      {place.tags.length > 0 && (
        <div className="place-card__tags" aria-label="Tags">
          {place.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {place.hostTip && (
        <div className="place-card__host-tip">
          <span className="place-card__host-tip-label">Host tip:</span>
          {place.hostTip}
        </div>
      )}

      <div className="place-card__footer">
        <span className="price-level" aria-label={`Price level: ${place.priceLevel}`}>
          {place.priceLevel}
        </span>

        <div className="place-card__footer-actions">
          {/* Book CTA — only rendered when place.booking is present.
              Routes through /go/<partner> for click-tracked affiliate redirect.
              Raw affiliate URL is never exposed in the markup. */}
          {place.booking && (
            <a
              href={`/go/${place.booking.partner}`}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="book-link"
              aria-label={`Book ${place.booking.label ?? place.name}`}
              onClick={() =>
                trackEvent("booking-click", {
                  partner: place.booking!.partner,
                  placeName: place.name,
                })
              }
            >
              {place.booking.label ?? "Book"}
            </a>
          )}

          <a
            href={place.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="map-link"
            aria-label={`Open ${place.name} in Google Maps`}
          >
            <span aria-hidden="true">📍</span> Map
          </a>
        </div>
      </div>
    </article>
  );
}
