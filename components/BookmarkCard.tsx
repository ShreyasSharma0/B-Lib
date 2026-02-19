"use client";

import { useState } from "react";
import type { Bookmark } from "@/types";

interface BookmarkCardProps {
  bookmark: Bookmark;
  faviconUrl: string;
  domain: string;
  isConfirmingDelete: boolean;
  onDeleteClick: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function BookmarkCard({
  bookmark,
  faviconUrl,
  domain,
  isConfirmingDelete,
  onDeleteClick,
  onDeleteConfirm,
  onDeleteCancel,
}: BookmarkCardProps) {
  const [faviconError, setFaviconError] = useState(false);

  return (
    <div
      className={`card group flex items-start gap-3 p-3.5 transition-all duration-200 hover:border-ink-300/70 hover:shadow-md ${
        isConfirmingDelete ? "border-red-300 bg-red-50/30" : ""
      }`}
    >
      {/* Favicon */}
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-8 h-8 rounded-lg border border-ink-200/50 bg-ink-50 flex items-center justify-center overflow-hidden">
          {!faviconError && faviconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={faviconUrl}
              alt=""
              className="w-5 h-5 object-contain"
              onError={() => setFaviconError(true)}
            />
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="6" stroke="#c1b498" strokeWidth="1.2"/>
              <path d="M1 7h12M7 1a9 9 0 010 12M7 1a9 9 0 000 12" stroke="#c1b498" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group/link"
        >
          <h3 className="text-sm font-medium text-ink-900 leading-snug line-clamp-1 group-hover/link:text-ink-950 transition-colors">
            {bookmark.title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="tag-domain text-[11px]">{domain}</span>
            <span className="text-xs text-ink-400">{formatDate(bookmark.created_at)}</span>
          </div>
        </a>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {isConfirmingDelete ? (
          <div className="flex items-center gap-1.5 animate-slide-in">
            <span className="text-xs text-ink-600 mr-0.5 hidden sm:block">Delete?</span>
            <button
              onClick={onDeleteConfirm}
              className="px-2.5 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
            >
              Yes
            </button>
            <button
              onClick={onDeleteCancel}
              className="px-2.5 py-1 text-xs bg-ink-100 text-ink-700 rounded hover:bg-ink-200 transition-colors font-medium"
            >
              No
            </button>
          </div>
        ) : (
          <>
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-all opacity-0 group-hover:opacity-100"
              title="Open link"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8M8 1h4v4M12 1L6.5 6.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <button
              onClick={onDeleteClick}
              className="p-1.5 rounded text-ink-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
              title="Delete bookmark"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M2 3.5h9M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M10 3.5L9.2 10a1 1 0 01-1 .9H4.8a1 1 0 01-1-.9L3 3.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
