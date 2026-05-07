'use client'

import type { Bookmark } from '@/lib/types'

interface DeleteConfirmModalProps {
  bookmark: Bookmark | null
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

export default function DeleteConfirmModal({ bookmark, onConfirm, onCancel, isDeleting }: DeleteConfirmModalProps) {
  if (!bookmark) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl animate-slide-up">
        <div className="p-6">
          {/* Icon */}
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </div>

          <h2 className="font-display font-semibold text-ink text-lg mb-1">Delete bookmark?</h2>
          <p className="text-muted text-sm font-body mb-1 leading-relaxed">
            <span className="text-ink font-medium">"{bookmark.title}"</span>
          </p>
          <p className="text-muted text-sm font-body mb-6">
            {getDomain(bookmark.url)} · This action cannot be undone.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 bg-canvas border border-border text-muted hover:text-ink font-body text-sm font-medium py-2.5 rounded-lg transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-body text-sm font-medium py-2.5 rounded-lg transition-all active:scale-[0.98]"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin-slow w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Deleting…
                </>
              ) : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
