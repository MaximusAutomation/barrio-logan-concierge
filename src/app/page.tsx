/**
 * Home page — server component that renders:
 *   1. PropertyHeader (server-rendered, no client state needed)
 *   2. UpsellSection (client component, early check-in / late checkout requests)
 *   3. GuideSection (client component, category tab state)
 *   4. ChatSection (client component, useChat streaming)
 */
import type { Guide } from "@/lib/guide";
import guideData from "@/data/guide.json";
import { UPSELL_CONFIG } from "@/lib/upsell-config";
import PropertyHeader from "@/components/PropertyHeader";
import UpsellSection from "@/components/UpsellSection";
import GuideSection from "@/components/GuideSection";
import ChatSection from "@/components/ChatSection";

const guide = guideData as Guide;

export default function Home() {
  return (
    <div className="page-wrapper">
      {/* 1. Property info — name, WiFi, check-in/out, house rules */}
      <PropertyHeader property={guide.property} />

      {/* 2. Upsell — early check-in / late checkout request cards */}
      {UPSELL_CONFIG.enabled && (
        <UpsellSection
          options={UPSELL_CONFIG.options}
          heading={UPSELL_CONFIG.heading}
          subheading={UPSELL_CONFIG.subheading}
          propertyCheckIn={guide.property.checkin}
          propertyCheckOut={guide.property.checkout}
        />
      )}

      {/* 3. Local guide — category tabs + place cards */}
      <GuideSection categories={guide.categories} />

      {/* 4. AI concierge chat */}
      <ChatSection />
    </div>
  );
}
