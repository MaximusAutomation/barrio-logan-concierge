"use client";
/**
 * GuideSection — category tabs + place cards for the local guide.
 * Rendered client-side so tab state lives in React state.
 *
 * Tracks booking-impression events when the services/bookable tab is viewed,
 * so the host can measure how many guests see the booking cards.
 */
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { Category } from "@/lib/guide";
import PlaceCard from "./PlaceCard";
import { trackEvent } from "@/lib/analytics";

interface GuideSectionProps {
  categories: Category[];
}

const CATEGORY_EMOJI: Record<string, string> = {
  grocery: "🛒",
  food: "🍽",
  coffee: "☕",
  bars: "🍺",
  beaches: "🏖",
  activities: "🎨",
  transit: "🚇",
  services: "🎟",
};

export default function GuideSection({ categories }: GuideSectionProps) {
  const [activeId, setActiveId] = useState<string>(
    categories[0]?.id ?? "grocery"
  );

  const activeCategory = categories.find((c) => c.id === activeId) ?? categories[0];

  // Track booking-impression when the services tab is viewed
  const servicesImpressionTracked = useRef(false);
  useEffect(() => {
    if (activeId === "services" && !servicesImpressionTracked.current) {
      servicesImpressionTracked.current = true;
      trackEvent("booking-impression", { category: "services" });
    }
  }, [activeId]);

  return (
    <section aria-label="Local guide">
      {/* Visually-hidden h2 preserves h1→h2→h3 heading order for screen readers */}
      <h2 className="visually-hidden">Local guide</h2>

      {/* Category tabs */}
      <nav className="category-tabs" aria-label="Guide categories">
        <div className="category-tabs__inner" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={cat.id === activeId}
              aria-controls={`panel-${cat.id}`}
              id={`tab-${cat.id}`}
              className={`category-tab${cat.id === activeId ? " category-tab--active" : ""}`}
              onClick={() => setActiveId(cat.id)}
            >
              <span className="category-tab__emoji" aria-hidden="true">
                {CATEGORY_EMOJI[cat.id] ?? "📍"}
              </span>
              {cat.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Places panel */}
      {activeCategory && (
        <div
          role="tabpanel"
          id={`panel-${activeCategory.id}`}
          aria-labelledby={`tab-${activeCategory.id}`}
          className="places-section"
        >
          {/* Category banner image — decorative; alt="" since the tab label already
              names the category. Declared 680×213 matches CSS aspect-ratio 16:5. */}
          {activeCategory.imageUrl && (
            <div className="category-banner">
              <Image
                src={activeCategory.imageUrl}
                alt=""
                width={680}
                height={213}
                className="category-banner__img"
                priority={false}
              />
            </div>
          )}

          <p className="places-section__title">
            {activeCategory.places.length}{" "}
            {activeCategory.places.length === 1 ? "spot" : "spots"}
          </p>
          <div className="places-list">
            {activeCategory.places.map((place) => (
              <PlaceCard key={place.name} place={place} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
