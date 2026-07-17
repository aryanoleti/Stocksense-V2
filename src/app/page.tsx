import { Playfair_Display } from "next/font/google";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { LandingRedirect } from "@/components/landing/LandingRedirect";
import { SpeedHero } from "@/components/landing/cirform/SpeedHero";
import { AboutReveal } from "@/components/landing/cirform/AboutReveal";
import { NumbersSpeak } from "@/components/landing/cirform/NumbersSpeak";
import { PerformanceCta } from "@/components/landing/cirform/PerformanceCta";
import { BentoFeatures } from "@/components/landing/cirform/BentoFeatures";
import { MarqueeStrip } from "@/components/landing/cirform/MarqueeStrip";
import { DarkFeatures } from "@/components/landing/cirform/DarkFeatures";
import { AnalyticsChart } from "@/components/landing/cirform/AnalyticsChart";
import { Footer } from "@/components/landing/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic", "normal"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
});

export default function LandingPage() {
  return (
    <main className={playfair.variable}>
      <LandingRedirect />
      {/* Navy hero region with the marketing nav floating on top */}
      <div className="relative bg-[#050A1A]">
        <MarketingNav />
        <SpeedHero />
      </div>

      <AboutReveal />
      <NumbersSpeak />
      <PerformanceCta />
      <BentoFeatures />
      <MarqueeStrip />
      <DarkFeatures />
      <AnalyticsChart />
      <Footer />
    </main>
  );
}
