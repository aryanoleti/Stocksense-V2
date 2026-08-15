"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useProgress } from "@/lib/learn/progress";

/* Signed-in visitors do not need the landing page. They are sent to the
   placement quiz the first time, and to the app after that — the quiz marks
   itself seen whether it is completed or skipped, so it never repeats. */
export function LandingGate() {
  const { user, hydrated: authReady } = useAuth();
  const { progress, hydrated: progressReady } = useProgress();
  const router = useRouter();

  useEffect(() => {
    if (!authReady || !progressReady || !user) return;
    router.replace(progress.placementSeen ? "/dashboard" : "/learn/placement");
  }, [authReady, progressReady, user, progress.placementSeen, router]);

  return null;
}
