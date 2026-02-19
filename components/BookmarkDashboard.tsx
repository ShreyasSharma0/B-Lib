"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Bookmark } from "@/types";
import AddBookmarkForm from "./AddBookmarkForm";
import BookmarkCard from "./BookmarkCard";
import Header from "./Header";

interface BookmarkDashboardProps {
  user: User;
  initialBookmarks: Bookmark[];
}

function getDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function getFaviconUrl(url: string): string {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return "";
  }
}

export default function BookmarkDashboard({
  user,
  initialBookmarks,
}: BookmarkDashboardProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  const supabase = createClient();

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newBookmark = payload.new as Bookmark;
          setBookmarks((prev) => {
            // Avoid duplicates
            if (prev.find((b) => b.id === newBookmark.id)) return prev;
            return [newBookmark, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setBookmarks((prev) =>
            prev.filter((b) => b.id !== payload.old.id)
          );
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setRealtimeStatus("connected");
        else if (status === "CLOSED") setRealtimeStatus("disconnected");
        else setRealtimeStatus("connecting");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, supabase]);

  const handleAddBookmark = useCallback(
    async (url: string, title: string): Promise<{ error?: string }> => {
      const { data, error } = await supabase
        .from("bookmarks")
        .insert({
          url,
          title,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // Optimistically add (realtime will also fire, handled with dedup)
      if (data) {
        setBookmarks((prev) => {
          if (prev.find((b) => b.id === data.id)) return prev;
          return [data, ...prev];
        });
      }

      return {};
    },
    [supabase, user.id]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      // Optimistic delete
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      setDeleteConfirm(null);

      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        // Rollback on error - refetch
        const { data } = await supabase
          .from("bookmarks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data) setBookmarks(data);
      }
    },
    [supabase, user.id]
  );

  const filteredBookmarks = bookmarks.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.url.toLowerCase().includes(q) ||
      getDomain(b.url).toLowerCase().includes(q)
    );
  });

  const avatarUrl = user.user_metadata?.avatar_url;
  const displayName = user.user_metadata?.full_name || user.email || "Reader";

  return (
    <div className="min-h-screen">
      <Header
        user={user}
        avatarUrl={avatarUrl}
        displayName={displayName}
        realtimeStatus={realtimeStatus}
      />

      <main className="max-w-2xl mx-auto px-4 pb-16">
        {/* Welcome + stats bar */}
        <div className="flex items-center justify-between py-6 animate-fade-in">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink-950">
              Your Library
            </h2>
            <p className="text-sm text-ink-500 mt-0.5">
              {bookmarks.length === 0
                ? "No bookmarks yet"
                : `${bookmarks.length} bookmark${bookmarks.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>

          {bookmarks.length > 0 && (
            <div className="tag-domain">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 3v2.5L6.5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              live
            </div>
          )}
        </div>

        {/* Add bookmark form */}
        <div className="animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <AddBookmarkForm onAdd={handleAddBookmark} />
        </div>

        {/* Search */}
        {bookmarks.length > 2 && (
          <div className="mt-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 6.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM13 13l-3-3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Search bookmarks…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bookmarks list */}
        <div className="mt-5 space-y-2 animate-stagger">
          {filteredBookmarks.length === 0 && searchQuery ? (
            <div className="text-center py-12 animate-fade-in">
              <p className="text-ink-500 text-sm">
                No bookmarks match &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-ink-700 text-sm underline underline-offset-2 mt-2 hover:text-ink-900"
              >
                Clear search
              </button>
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <EmptyState />
          ) : (
            filteredBookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                faviconUrl={getFaviconUrl(bookmark.url)}
                domain={getDomain(bookmark.url)}
                isConfirmingDelete={deleteConfirm === bookmark.id}
                onDeleteClick={() => setDeleteConfirm(bookmark.id)}
                onDeleteConfirm={() => handleDelete(bookmark.id)}
                onDeleteCancel={() => setDeleteConfirm(null)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ink-100 mb-4">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M7 3h14a2 2 0 012 2v18l-5-3.75L13 23l-5-3.75L3 23V5a2 2 0 012-2z"
            stroke="#8f7860"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M10 9.5h8M10 13h5" stroke="#8f7860" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 className="font-display text-lg font-semibold text-ink-800 mb-1">
        Your library is empty
      </h3>
      <p className="text-sm text-ink-500 max-w-xs mx-auto">
        Start saving URLs above. Your bookmarks are private
        and sync across all your tabs in real-time.
      </p>
    </div>
  );
}
