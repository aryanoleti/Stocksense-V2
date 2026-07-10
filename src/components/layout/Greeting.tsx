"use client";

import { useAuth } from "@/lib/auth/AuthContext";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function Greeting({ fallbackName }: { fallbackName?: string }) {
  const { user } = useAuth();
  const name = user?.givenName || user?.name?.split(" ")[0] || fallbackName || "there";
  return <>{greeting()}, {name}.</>;
}
