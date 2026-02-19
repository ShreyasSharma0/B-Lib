"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";

interface HeaderProps {
  user: User;
  avatarUrl?: string;
  displayName: string;
  realtimeStatus: "connecting" | "connected" | "disconnected";
}

export default function Header({
  user,
  avatarUrl,
  displayName,
  realtimeStatus,
}: HeaderProps) {
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
  };

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  const statusColors = {
    connecting: "bg-amber-400",
    connected: "bg-green-500",
    disconnected: "bg-red-400",
  };

  const statusLabels = {
    connecting: "Connecting…",
    connected: "Live sync active",
    disconnected: "Reconnecting…",
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-parchment/80 border-b border-ink-200/50">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #342a22 0%, #5d4c3e 100%)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 1h10a1 1 0 011 1v10l-2.5-2-2.5 2-2.5-2L3 13V2a1 1 0 011-1z" fill="#f5a623" fillOpacity="0.9"/>
            </svg>
          </div>
          <span className="font-display font-semibold text-ink-950 text-base tracking-tight">
            B-Lib
          </span>

          {/* Realtime indicator */}
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-ink-100"
            title={statusLabels[realtimeStatus]}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${statusColors[realtimeStatus]} ${
                realtimeStatus === "connected" ? "animate-pulse" : ""
              }`}
            />
            <span className="text-xs text-ink-500 hidden sm:inline">
              {realtimeStatus === "connected" ? "live" : realtimeStatus === "connecting" ? "syncing" : "offline"}
            </span>
          </div>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-ink-100 transition-colors group"
          >
            <div className="relative">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-ink-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-ink-800 flex items-center justify-center text-ink-50 text-xs font-medium">
                  {initials}
                </div>
              )}
            </div>
            <span className="text-sm text-ink-700 font-medium hidden sm:block max-w-[120px] truncate">
              {displayName.split(" ")[0]}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={`text-ink-500 transition-transform ${menuOpen ? "rotate-180" : ""}`}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1.5 w-56 card py-1 shadow-lg z-20 animate-slide-up">
                <div className="px-3 py-2.5 border-b border-ink-100">
                  <p className="text-sm font-medium text-ink-900 truncate">{displayName}</p>
                  <p className="text-xs text-ink-500 truncate mt-0.5">{user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-700 hover:bg-ink-50 hover:text-ink-900 transition-colors disabled:opacity-50"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M13 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
