"use client";

import { useState, useRef, useEffect } from "react";

interface AddBookmarkFormProps {
  onAdd: (url: string, title: string) => Promise<{ error?: string }>;
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function extractTitle(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "");
    const domain = u.hostname.replace("www.", "");

    if (path && path !== "/") {
      const lastSegment = path.split("/").pop() || "";
      return lastSegment
        .replace(/[-_]/g, " ")
        .replace(/\.[^.]+$/, "")
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .trim() || domain;
    }

    return domain
      .split(".")
      .slice(0, -1)
      .join(" ")
      .replace(/\b\w/g, (l) => l.toUpperCase()) || domain;
  } catch {
    return url;
  }
}

export default function AddBookmarkForm({ onAdd }: AddBookmarkFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded) {
      urlInputRef.current?.focus();
    }
  }, [expanded]);

  // Auto-fill title from URL only if user hasn't manually edited it
  useEffect(() => {
    if (url && !titleTouched) {
      const normalized = normalizeUrl(url);
      if (normalized) {
        setTitle(extractTitle(normalized));
      }
    }
  }, [url, titleTouched]);

  // Click-outside to collapse
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        if (!url && !title) {
          setExpanded(false);
          setTitleTouched(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [url, title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");

    const normalizedUrl = normalizeUrl(url);
    const finalTitle = title.trim() || extractTitle(normalizedUrl);

    const result = await onAdd(normalizedUrl, finalTitle);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setUrl("");
      setTitle("");
      setTitleTouched(false);
      setTimeout(() => {
        setSuccess(false);
        setExpanded(false);
      }, 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setExpanded(false);
      setUrl("");
      setTitle("");
      setTitleTouched(false);
      setError("");
    }
  };

  return (
    <div ref={formRef} className="card overflow-hidden">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-ink-50 transition-colors group"
        >
          <div className="w-7 h-7 rounded-lg bg-ink-950 flex items-center justify-center flex-shrink-0 group-hover:bg-ink-800 transition-colors">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.5 2v9M2 6.5h9" stroke="#faf8f4" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-sm text-ink-500 group-hover:text-ink-700 transition-colors">
            Add a bookmark…
          </span>
          <span className="ml-auto text-xs text-ink-300 hidden sm:block">
            <kbd className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-500 font-mono text-[11px]">⌘K</kbd>
          </span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded bg-ink-950 flex items-center justify-center flex-shrink-0">
              <svg width="11" height="11" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.5 2v9M2 6.5h9" stroke="#faf8f4" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-ink-800">New bookmark</span>
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                setUrl("");
                setTitle("");
                setTitleTouched(false);
                setError("");
              }}
              className="ml-auto text-ink-400 hover:text-ink-700 transition-colors p-0.5"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="label" htmlFor="bookmark-url">
                URL
              </label>
              <input
                ref={urlInputRef}
                id="bookmark-url"
                type="text"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                className="input-field font-mono text-xs"
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="bookmark-title">
                Title
              </label>
              <input
                id="bookmark-title"
                type="text"
                placeholder="My bookmark title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleTouched(true);
                }}
                className="input-field"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M6 4v2.5M6 8h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {error}
            </p>
          )}

          <div className="flex items-center gap-2 mt-3.5">
            <button
              type="submit"
              disabled={loading || success || !url.trim()}
              className={`btn-primary flex-1 justify-center transition-all ${
                success
                  ? "bg-green-700 hover:bg-green-700"
                  : ""
              }`}
            >
              {success ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3.5 3.5L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Saved!
                </>
              ) : loading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  Save bookmark
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                setUrl("");
                setTitle("");
                setTitleTouched(false);
                setError("");
              }}
              className="btn-ghost"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}