/**
 * PropertyHeader — shows property name, WiFi, check-in/out, and house rules.
 * When property.imageUrl is set, it is shown as a hero behind the green gradient
 * with a dark overlay to preserve WCAG-AA contrast on white text.
 * Token values (e.g. {{PROPERTY_NAME}}) are detected and hidden gracefully.
 */
import Image from "next/image";
import type { Property } from "@/lib/guide";

/** Returns true when a value is still an unfilled {{TOKEN}} placeholder. */
function isToken(value: string): boolean {
  return /^\{\{[^}]+\}\}$/.test(value.trim());
}

interface PropertyHeaderProps {
  property: Property;
}

export default function PropertyHeader({ property }: PropertyHeaderProps) {
  const displayName =
    !isToken(property.name) ? property.name : "Barrio Logan Guest Concierge";

  // Render address from data with token guard — falls back to a generic placeholder.
  const displayAddress =
    property.address && !isToken(property.address)
      ? property.address
      : "Address not configured";

  // Show WiFi card only when BOTH ssid and password are present non-token values.
  // Blank ("") or unfilled {{TOKEN}} values both suppress the card so guests
  // never see a half-broken WiFi display. Owner adds WiFi by filling both
  // fields in src/data/guide.json.
  const showWifi =
    property.wifi.ssid.trim() !== "" &&
    !isToken(property.wifi.ssid) &&
    property.wifi.password.trim() !== "" &&
    !isToken(property.wifi.password);
  const showCheckin = !isToken(property.checkin);
  const showCheckout = !isToken(property.checkout);

  // Filter house rules that are not placeholder tokens
  const houseRules = property.houseRules.filter(
    (r) => r && !isToken(r)
  );

  const hasHero = Boolean(property.imageUrl);

  return (
    <>
      <header className={`property-header${hasHero ? " property-header--has-hero" : ""}`}>
        {/* Hero image sits behind the gradient overlay */}
        {hasHero && property.imageUrl && (
          <div className="property-header__hero-bg" aria-hidden="true">
            <Image
              src={property.imageUrl}
              alt=""
              fill
              className="property-header__hero-img"
              priority
              sizes="100vw"
            />
            {/* Dark overlay ensures WCAG-AA contrast on white text */}
            <div className="property-header__hero-overlay" />
          </div>
        )}
        <div className="property-header__inner">
          <h1 className="property-header__name">{displayName}</h1>
          {/* Street address rendered from data with token guard */}
          <p className="property-header__address">{displayAddress}</p>
          {/* Neighborhood — rendered from guide.json property.neighborhood */}
          {!isToken(property.neighborhood) && (
            <p className="property-header__neighborhood">
              {property.neighborhood}
            </p>
          )}
          <div className="property-header__details">
            {showWifi && (
              <span className="detail-chip">
                <span className="detail-chip__label">WiFi</span>
                {!isToken(property.wifi.ssid) ? property.wifi.ssid : ""}
                {!isToken(property.wifi.ssid) && !isToken(property.wifi.password) && " · "}
                {!isToken(property.wifi.password) ? property.wifi.password : ""}
              </span>
            )}
            {showCheckin && (
              <span className="detail-chip">
                <span className="detail-chip__label">Check-in</span>
                {property.checkin}
              </span>
            )}
            {showCheckout && (
              <span className="detail-chip">
                <span className="detail-chip__label">Check-out</span>
                {property.checkout}
              </span>
            )}
          </div>
        </div>
      </header>
      {houseRules.length > 0 && (
        <div className="house-rules">
          <div className="container">
            <p className="house-rules__title">House Rules</p>
            <ul className="house-rules__list">
              {houseRules.map((rule, i) => (
                <li key={i} className="house-rules__item">
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
