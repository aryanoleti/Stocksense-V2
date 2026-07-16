import { MarketingNav } from "@/components/layout/MarketingNav";
import { LandingRedirect } from "@/components/landing/LandingRedirect";
import { DeviceShowcase } from "@/components/landing/showcase/DeviceShowcase";
import { MarketPulse } from "@/components/landing/MarketPulse";
import { FeatureJourney } from "@/components/landing/showcase/FeatureJourney";
import { ParticleCta } from "@/components/landing/showcase/ParticleCta";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="bg-(--color-brand-950)">
      <LandingRedirect />
      {/* One continuous dark canvas: the whole page plays like a product video */}
      <div className="gradient-brand-soft noise relative overflow-clip">
        <div className="absolute inset-x-0 top-0 h-[640px] grid-mask pointer-events-none" />
        <div className="relative">
          <MarketingNav />
          {/* HeroScene + InteractionScene: live dual-device demo */}
          <DeviceShowcase />
          {/* The ball: draggable market-breadth globe */}
          <div id="pulse">
            <MarketPulse />
          </div>
          {/* ScrollScene: staggered feature journey */}
          <FeatureJourney />
          {/* Finale: mouse-reactive particle CTA */}
          <ParticleCta />
        </div>
      </div>
      <Footer />
    </main>
  );
}
