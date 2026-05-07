'use client'

import Image from 'next/image'

interface HeaderProps {
  user: { name: string; email: string; avatar: string | null }
  bookmarkCount: number
  search: string
  onSearchChange: (val: string) => void
  onAdd: () => void
  onSignOut: () => void
}

export default function Header({ user, bookmarkCount, search, onSearchChange, onAdd, onSignOut }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-canvas/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-14">
          {/* Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 bg-flare rounded-md flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                <path d="M3 3h12v10l-6 2-6-2V3z" stroke="#0B0A08" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M3 3l6 4 6-4" stroke="#0B0A08" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="font-display font-semibold text-lg text-ink tracking-tight hidden sm:block">Folio</span>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search bookmarks…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-card border border-border text-ink text-sm font-body placeholder:text-muted rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-border-bright transition-colors"
            />
            {search && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          {/* Add button */}
          <button
            onClick={onAdd}
            className="flex-shrink-0 flex items-center gap-1.5 bg-flare hover:bg-flare-dim text-canvas text-sm font-body font-medium px-3.5 py-2 rounded-lg transition-all duration-150 active:scale-95"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span className="hidden sm:block">Add</span>
          </button>

          {/* User menu */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={28}
                height={28}
                className="rounded-full ring-1 ring-border"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center text-xs text-muted font-body font-medium">
                {user.name[0]?.toUpperCase()}
              </div>
            )}
            <button
              onClick={onSignOut}
              className="text-muted hover:text-ink text-sm font-body transition-colors hidden sm:block"
              title="Sign out"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-2">
        <p className="text-xs text-muted font-body">
          {bookmarkCount === 0 ? 'No bookmarks yet' : `${bookmarkCount} bookmark${bookmarkCount !== 1 ? 's' : ''}`}
        </p>
      </div>
    </header>
  )
}
