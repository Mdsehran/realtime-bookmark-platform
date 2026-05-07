'use client'

import { useState } from 'react'
import type { Bookmark } from '@/lib/types'

interface BookmarkCardProps {
  bookmark: Bookmark
  onDelete: (bookmark: Bookmark) => void
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

export default function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
  const [imgError, setImgError] = useState(false)
  const domain = getDomain(bookmark.url)
  const faviconSrc = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

  return (
    <article className="group relative bg-card border border-border rounded-xl p-4 hover:border-border-bright hover:bg-card-hover transition-all duration-200 flex flex-col gap-3">
      {/* Top row: favicon + title + delete */}
      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-canvas border border-border flex items-center justify-center overflow-hidden mt-0.5">
          {!imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={faviconSrc}
              alt=""
              width={16}
              height={16}
              onError={() => setImgError(true)}
              className="w-4 h-4"
            />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C7370" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-ink text-sm font-body font-medium leading-snug line-clamp-2 hover:text-flare transition-colors"
          >
            {bookmark.title}
          </a>
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(bookmark)}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150"
          title="Delete bookmark"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>

      {/* Bottom row: domain + time */}
      <div className="flex items-center justify-between gap-2 pl-11">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted font-body truncate hover:text-flare transition-colors"
        >
          {domain}
        </a>
        <span className="text-xs text-muted font-body flex-shrink-0">
          {timeAgo(bookmark.created_at)}
        </span>
      </div>
    </article>
  )
}
