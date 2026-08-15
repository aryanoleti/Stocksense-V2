import { LandingGate } from "@/components/landing/LandingGate";
import { ForgeLanding } from "@/components/landing/forge/ForgeLanding";

/* The landing is the front door again. Signed-in visitors are moved on by
   LandingGate: to the placement quiz if they have not taken it, otherwise
   into the app. */
export default function LandingPage() {
  return (
    <>
      <LandingGate />
      <ForgeLanding />
    </>
  );
}
