import { LandingRedirect } from "@/components/landing/LandingRedirect";
import { GlacierLanding } from "@/components/landing/glacier/GlacierLanding";
import { UNIVERSE } from "@/lib/universe";

/* Glacier landing: one persistent WebGL world behind DOM content — the
   visitor descends from an ice surface, past the four platform modules
   sealed in crystal shards, through the ring gates to the particle floor.

   The instrument count is counted here, on the server, from the same
   universe the app searches — so the headline figure can never drift from
   reality, and the instrument JSON never reaches the client bundle. */
export default function LandingPage() {
  return (
    <>
      <LandingRedirect />
      <GlacierLanding instrumentCount={UNIVERSE.length} />
    </>
  );
}
