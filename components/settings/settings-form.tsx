"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  Moon, Sun, Bell, BellOff, Bot, Globe, BarChart2, Loader2, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Preferences {
  theme: string;
  currency: string;
  defaultExchange: string;
  notifications: boolean;
  aiSuggestions: boolean;
}

interface Props {
  preferences: Preferences;
}

export function SettingsForm({ preferences: initial }: Props) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [prefs, setPrefs] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
    if (key === "theme") setTheme(value as string);
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/user/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Appearance */}
      <SettingSection icon={Sun} title="Appearance">
        <div className="space-y-3">
          <Label>Theme</Label>
          <div className="grid grid-cols-2 gap-3">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                onClick={() => update("theme", t)}
                className={cn(
                  "flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all",
                  prefs.theme === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                )}
              >
                {t === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                {t === "dark" ? "Dark mode" : "Light mode"}
              </button>
            ))}
          </div>
        </div>
      </SettingSection>

      {/* Market preferences */}
      <SettingSection icon={BarChart2} title="Market Preferences">
        <div className="space-y-4">
          <div>
            <Label>Default exchange</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {(["NSE", "BSE"] as const).map((ex) => (
                <button
                  key={ex}
                  onClick={() => update("defaultExchange", ex)}
                  className={cn(
                    "p-3 rounded-xl border text-sm font-medium transition-all",
                    prefs.defaultExchange === ex
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                  )}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Currency</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {(["INR", "USD", "EUR"] as const).map((cur) => (
                <button
                  key={cur}
                  onClick={() => update("currency", cur)}
                  className={cn(
                    "p-2 rounded-lg border text-sm font-medium transition-all",
                    prefs.currency === cur
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                  )}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Notifications */}
      <SettingSection icon={Bell} title="Notifications & AI">
        <div className="space-y-3">
          <ToggleRow
            icon={prefs.notifications ? Bell : BellOff}
            label="Market notifications"
            description="Price alerts and market updates"
            enabled={prefs.notifications}
            onToggle={() => update("notifications", !prefs.notifications)}
          />
          <ToggleRow
            icon={Bot}
            label="AI suggestions"
            description="Show AI insights on stock pages"
            enabled={prefs.aiSuggestions}
            onToggle={() => update("aiSuggestions", !prefs.aiSuggestions)}
          />
        </div>
      </SettingSection>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || saved}
        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saved && <Check className="w-4 h-4" />}
        {saved ? "Saved!" : "Save preferences"}
      </button>
    </div>
  );
}

function SettingSection({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="card-glass p-5">
      <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

function ToggleRow({ icon: Icon, label, description, enabled, onToggle }: {
  icon: any; label: string; description: string; enabled: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <div>
          <div className="text-sm font-medium text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          "relative w-10 h-5 rounded-full transition-colors",
          enabled ? "bg-primary" : "bg-muted border border-border"
        )}
      >
        <motion.span
          animate={{ x: enabled ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}
