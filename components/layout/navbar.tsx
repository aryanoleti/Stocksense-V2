"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, Moon, Sun, LogOut, User, Settings, ChevronDown,
  TrendingUp, Clock, X, Keyboard,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import type { User as NextAuthUser } from "next-auth";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchResult {
  ticker: string;
  name: string;
}

interface RecentSearch {
  query: string;
  ticker: string | null;
  searchedAt: string;
}

interface NavbarProps {
  user: NextAuthUser;
}

export function Navbar({ user }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [profileOpen, setProfileOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 280);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch recent searches when focused with empty query
  async function fetchRecent() {
    const res = await fetch("/api/search?recent=true");
    const data = await res.json();
    setRecentSearches(data.recent || []);
  }

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      setFocusedIndex(-1);
      return;
    }
    setSearching(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data.results || []);
        setOpen(true);
        setFocusedIndex(-1);
      })
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard shortcut: Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
        fetchRecent();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const activeList = results.length > 0 ? results : recentSearches.filter((r) => r.ticker).map((r) => ({ ticker: r.ticker!, name: r.query }));

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, activeList.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      handleSelect(activeList[focusedIndex].ticker, query || activeList[focusedIndex].name);
    }
  }

  function handleSelect(ticker: string, queryText?: string) {
    // Save to history
    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: queryText || ticker, ticker }),
    });
    setQuery("");
    setOpen(false);
    setFocusedIndex(-1);
    router.push(`/stock/${ticker}`);
  }

  function handleFocus() {
    setOpen(true);
    if (!query) fetchRecent();
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  const showRecent = !query && recentSearches.length > 0;
  const showResults = query.length >= 2 && results.length > 0;

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 gap-4 z-20">
      {/* Search */}
      <div ref={searchRef} className="relative flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder="Search stocks… ⌘K"
            aria-label="Search stocks"
            aria-expanded={open}
            aria-haspopup="listbox"
            role="combobox"
            className="w-full bg-muted border border-border rounded-lg pl-9 pr-8 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          {query ? (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : searching ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : null}
        </div>

        <AnimatePresence>
          {open && (showResults || showRecent) && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              role="listbox"
              className="absolute top-full mt-2 left-0 right-0 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden z-50"
            >
              {showRecent && (
                <div className="px-3 pt-2 pb-1">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Recent searches
                  </p>
                </div>
              )}

              {(showResults ? results : recentSearches.filter((r) => r.ticker).map((r) => ({ ticker: r.ticker!, name: r.query }))).map((item, idx) => (
                <button
                  key={`${item.ticker}-${idx}`}
                  role="option"
                  aria-selected={focusedIndex === idx}
                  onClick={() => handleSelect(item.ticker, query || item.name)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left",
                    focusedIndex === idx ? "bg-muted" : "hover:bg-muted/60"
                  )}
                >
                  {showRecent ? (
                    <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="font-mono text-xs text-primary font-semibold w-20 flex-shrink-0">
                    {item.ticker.replace(".NS", "")}
                  </span>
                  <span className="text-sm text-foreground truncate">{item.name}</span>
                </button>
              ))}

              <div className="px-4 py-2 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {showResults ? `${results.length} results` : "Recent searches"}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Keyboard className="w-3 h-3" />
                  <span>↑↓ navigate · Enter select · Esc close</span>
                </div>
              </div>
            </motion.div>
          )}

          {open && query.length >= 2 && !searching && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-full mt-2 left-0 right-0 bg-popover border border-border rounded-xl shadow-xl p-4 text-center z-50"
            >
              <p className="text-sm text-muted-foreground">No results for "{query}"</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            aria-label="User menu"
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
              {user.image ? (
                <Image src={user.image} alt={user.name || ""} width={28} height={28} className="rounded-full" />
              ) : (
                <span className="text-xs font-semibold text-primary">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-foreground hidden lg:block max-w-24 truncate">
              {user.name?.split(" ")[0]}
            </span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <ProfileMenuItem
                      icon={User}
                      label="Profile"
                      onClick={() => { router.push("/profile"); setProfileOpen(false); }}
                    />
                    <ProfileMenuItem
                      icon={Settings}
                      label="Settings"
                      onClick={() => { router.push("/settings"); setProfileOpen(false); }}
                    />
                    <div className="my-1 border-t border-border" />
                    <ProfileMenuItem
                      icon={LogOut}
                      label="Sign out"
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      danger
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function ProfileMenuItem({
  icon: Icon, label, onClick, danger,
}: {
  icon: React.ElementType; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
