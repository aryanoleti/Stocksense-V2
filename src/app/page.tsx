import { MarketingNav } from "@/components/layout/MarketingNav";
import { LandingRedirect } from "@/components/landing/LandingRedirect";
import { DecisionHero } from "@/components/landing/DecisionHero";
import { ProductHighlights } from "@/components/landing/ProductHighlights";
import { Personas } from "@/components/landing/Personas";
import { DarkStatsBand } from "@/components/landing/DarkStatsBand";
import { LearnTeaser } from "@/components/landing/LearnTeaser";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="bg-(--color-brand-950)">
      <LandingRedirect />
      {/* One continuous dark emerald canvas, Cirform-style */}
      <div className="gradient-brand-soft noise relative overflow-clip">
        <div className="absolute inset-x-0 top-0 h-[620px] grid-mask pointer-events-none" />
        <div className="relative">
          <MarketingNav />
          <DecisionHero />
          <ProductHighlights />
          <Personas />
          <DarkStatsBand />
          <LearnTeaser />
          <CtaBanner />
        </div>
      </div>
      <Footer />
    </main>
  );
}
