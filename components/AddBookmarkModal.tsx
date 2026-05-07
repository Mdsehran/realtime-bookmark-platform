'use client'

import { useState, useEffect, useRef } from 'react'

interface AddBookmarkModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (url: string, title: string) => Promise<void>
}

function isValidUrl(str: string): boolean {
  try {
    const u = new URL(str)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch { return false }
}

export default function AddBookmarkModal({ isOpen, onClose, onAdd }: AddBookmarkModalProps) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [isFetchingTitle, setIsFetchingTitle] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const urlInputRef = useRef<HTMLInputElement>(null)
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isOpen) {
      setUrl(''); setTitle(''); setError('')
      setTimeout(() => urlInputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Auto-fetch title when URL is valid (bonus feature)
  useEffect(() => {
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current)

    if (!isValidUrl(url)) return

    fetchTimerRef.current = setTimeout(async () => {
      setIsFetchingTitle(true)
      try {
        const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`)
        const data = await res.json()
        if (data.title) setTitle(data.title)
      } catch { /* silent */ }
      finally { setIsFetchingTitle(false) }
    }, 600)

    return () => { if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current) }
  }, [url])

  const handleSubmit = async () => {
    if (!url.trim()) { setError('Please enter a URL'); return }
    if (!isValidUrl(url.trim())) { setError('Please enter a valid URL (include https://)'); return }
    if (!title.trim()) { setError('Please enter a title'); return }

    setIsSubmitting(true)
    setError('')
    try {
      await onAdd(url.trim(), title.trim())
      onClose()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to add bookmark'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSubmit()
    if (e.key === 'Escape') onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <h2 className="font-display font-semibold text-ink text-lg">Add Bookmark</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-canvas transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* URL input */}
          <div>
            <label className="block text-xs text-muted font-body font-medium mb-1.5 uppercase tracking-wider">
              URL
            </label>
            <input
              ref={urlInputRef}
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              className="w-full bg-canvas border border-border text-ink font-body text-sm placeholder:text-muted rounded-lg px-3 py-2.5 focus:outline-none focus:border-border-bright transition-colors"
            />
          </div>

          {/* Title input */}
          <div>
            <label className="block text-xs text-muted font-body font-medium mb-1.5 uppercase tracking-wider flex items-center gap-2">
              Title
              {isFetchingTitle && (
                <span className="flex items-center gap-1 text-flare font-normal normal-case tracking-normal">
                  <svg className="animate-spin-slow w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Auto-fetching…
                </span>
              )}
            </label>
            <input
              type="text"
              placeholder="My bookmark title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              className="w-full bg-canvas border border-border text-ink font-body text-sm placeholder:text-muted rounded-lg px-3 py-2.5 focus:outline-none focus:border-border-bright transition-colors"
            />
            <p className="mt-1.5 text-xs text-muted font-body">Title is auto-filled when you paste a URL.</p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm font-body flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 bg-canvas border border-border text-muted hover:text-ink font-body text-sm font-medium py-2.5 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 bg-flare hover:bg-flare-dim disabled:opacity-60 disabled:cursor-not-allowed text-canvas font-body text-sm font-medium py-2.5 rounded-lg transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin-slow w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Saving…
              </>
            ) : 'Save Bookmark'}
          </button>
        </div>
      </div>
    </div>
  )
}
