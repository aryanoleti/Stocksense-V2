import { MarketingNav } from "@/components/layout/marketing-nav";
import { CinematicHero } from "@/components/landing/CinematicHero";
import { TickerTape } from "@/components/landing/TickerTape";
import { MarketPulse } from "@/components/landing/MarketPulse";
import { FeatureCinema } from "@/components/landing/FeatureCinema";
import { MarketPulse3D } from "@/components/landing/MarketPulse3D";
import { StatsBand } from "@/components/landing/StatsBand";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { Footer } from "@/components/landing/Footer";

// Public marketing landing page — top-level route, NOT inside the
// (dashboard) route group, so it renders without the Sidebar/Navbar/auth
// gate. Ported from SOURCE stocksense's src/app/page.tsx. Scoped under
// `.stocksense-marketing` so its Tailwind v4-style design tokens (see
// app/globals.css) don't leak into the rest of the (dark navy) dashboard.
export default function LandingPage() {
  return (
    <main className="stocksense-marketing bg-[var(--color-bg)]">
      {/* Dark cinematic region: nav, hero, live tape, horizontal market glide */}
      <div className="gradient-brand-soft noise relative overflow-clip">
        <div className="absolute inset-0 grid-mask pointer-events-none" />
        <div className="relative">
          <MarketingNav />
          <CinematicHero />
          <TickerTape />
          <MarketPulse />
        </div>
      </div>

      {/* Light editorial region */}
      <FeatureCinema />

      {/* Dark centrepiece: draggable market globe */}
      <MarketPulse3D />

      <StatsBand />
      <Testimonials />
      <FAQ />
      <CtaBanner />
      <Footer />
    </main>
  );
}
