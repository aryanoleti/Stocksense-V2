import { LandingRedirect } from "@/components/landing/LandingRedirect";
import { ForgeLanding } from "@/components/landing/forge/ForgeLanding";

/* Landing sequence: one persistent R3F canvas carrying three scenes — the
   fog-lit hero monolith, the portfolio shard carousel, and the portal that
   dissolves into a particle sculpture on its pedestal. */
export default function LandingPage() {
  return (
    <>
      <LandingRedirect />
      <ForgeLanding />
    </>
  );
}
