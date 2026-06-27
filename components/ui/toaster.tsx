"use client";

import { useState, useEffect } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let addToast: (toast: Omit<Toast, "id">) => void = () => {};

export function toast(message: string, type: Toast["type"] = "info") {
  addToast({ message, type });
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToast = (t) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3000);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg border ${
            t.type === "success" ? "bg-green-500/15 text-green-400 border-green-500/20"
            : t.type === "error" ? "bg-red-500/15 text-red-400 border-red-500/20"
            : "bg-card text-foreground border-border"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
