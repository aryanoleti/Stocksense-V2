import { LandingRedirect } from "@/components/landing/LandingRedirect";
import { GlacierLanding } from "@/components/landing/glacier/GlacierLanding";

/* Glacier landing: one persistent WebGL world behind DOM content — the
   visitor descends from a bright ice surface, past the four platform
   modules sealed in crystal chambers, to the particle-field floor. */
export default function LandingPage() {
  return (
    <>
      <LandingRedirect />
      <GlacierLanding />
    </>
  );
}
