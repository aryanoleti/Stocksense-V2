import { LandingRedirect } from "@/components/landing/LandingRedirect";
import { ForgeLanding } from "@/components/landing/forge/ForgeLanding";

/* The landing is the front door; signed-in visitors are sent to the app.
   The course now lives in its own site: https://aryanoleti.github.io/learning-page/ */
export default function LandingPage() {
  return (
    <>
      <LandingRedirect />
      <ForgeLanding />
    </>
  );
}
