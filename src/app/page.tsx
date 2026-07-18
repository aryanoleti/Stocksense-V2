import { Playfair_Display } from "next/font/google";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { LandingRedirect } from "@/components/landing/LandingRedirect";
import { SlideDeck, type Slide } from "@/components/landing/cirform/SlideDeck";
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

/* Every section is a full-screen slide; the visitor clicks (or uses the
   keyboard) to move between them — the page itself never scrolls. */
const SLIDES: Slide[] = [
  {
    hash: "home",
    label: "Home",
    tone: "dark",
    content: <SpeedHero />,
  },
  {
    hash: "about",
    label: "About",
    tone: "light",
    content: (
      <div className="flex min-h-full flex-col justify-center bg-[#E8EEFA] dark:bg-[#0B1220]">
        <AboutReveal />
      </div>
    ),
  },
  {
    hash: "numbers",
    label: "Numbers",
    tone: "light",
    content: (
      <div className="flex min-h-full flex-col justify-center bg-white dark:bg-[#0A0F1E]">
        <NumbersSpeak />
      </div>
    ),
  },
  {
    hash: "performance",
    label: "Performance",
    tone: "light",
    content: (
      <div className="min-h-full bg-white dark:bg-[#0A0F1E]">
        <PerformanceCta />
      </div>
    ),
  },
  {
    hash: "features",
    label: "Features",
    tone: "light",
    content: (
      <div className="flex min-h-full flex-col justify-center bg-[#DBEAFE] dark:bg-[#0B1428]">
        <BentoFeatures />
      </div>
    ),
  },
  {
    hash: "platform",
    label: "Platform",
    tone: "dark",
    content: (
      <div className="min-h-full bg-[#0A0C14]">
        <MarqueeStrip />
        <DarkFeatures />
      </div>
    ),
  },
  {
    hash: "analytics",
    label: "Analytics",
    tone: "light",
    content: (
      <div className="flex min-h-full flex-col justify-center bg-white dark:bg-[#0A0F1E]">
        <AnalyticsChart />
      </div>
    ),
  },
  {
    hash: "more",
    label: "Get started",
    tone: "dark",
    content: (
      <div className="flex min-h-full flex-col justify-end bg-[#050A1A]">
        <Footer />
      </div>
    ),
  },
];

export default function LandingPage() {
  return (
    <main className={`${playfair.variable} relative h-dvh overflow-hidden`}>
      <LandingRedirect />
      <SlideDeck slides={SLIDES} />
      {/* Nav floats above every slide; links drive the deck via hash */}
      <div className="absolute inset-x-0 top-0 z-40">
        <MarketingNav />
      </div>
    </main>
  );
}
