"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

/** Signed-in users skip the marketing page — the app is their home. */
export function LandingRedirect() {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (hydrated && user) router.replace("/dashboard");
  }, [hydrated, user, router]);
  return null;
}
