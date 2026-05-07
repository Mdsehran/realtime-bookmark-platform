'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from './Header'
import BookmarkCard from './BookmarkCard'
import AddBookmarkModal from './AddBookmarkModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import type { Bookmark, ToastMessage } from '@/lib/types'

interface UserInfo {
  id: string
  email: string
  name: string
  avatar: string | null
}

interface BookmarkManagerProps {
  user: UserInfo
  initialBookmarks: Bookmark[]
}

export default function BookmarkManager({ user, initialBookmarks }: BookmarkManagerProps) {
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Bookmark | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('bookmarks-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const incoming = payload.new as Bookmark
          setBookmarks((prev) => {
            // Avoid duplicates (optimistic update may have already added it)
            if (prev.some((b) => b.id === incoming.id)) return prev
            return [incoming, ...prev]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected')
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setRealtimeStatus('error')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user.id])

  // Keyboard shortcut: Cmd/Ctrl+K to open Add modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsAddOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleAdd = async (url: string, title: string) => {
    const supabase = createClient()
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({ url, title, favicon_url: faviconUrl, user_id: user.id })
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Optimistic update — realtime will deduplicate if it arrives
    if (data) {
      setBookmarks((prev) => {
        if (prev.some((b) => b.id === data.id)) return prev
        return [data as Bookmark, ...prev]
      })
    }

    addToast('Bookmark saved!')
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', deleteTarget.id)

    if (error) {
      addToast('Failed to delete bookmark', 'error')
    } else {
      // Optimistic removal — realtime will also fire DELETE
      setBookmarks((prev) => prev.filter((b) => b.id !== deleteTarget.id))
      addToast('Bookmark deleted')
    }

    setIsDeleting(false)
    setDeleteTarget(null)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // Filtered bookmarks
  const filtered = search.trim()
    ? bookmarks.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.url.toLowerCase().includes(search.toLowerCase())
      )
    : bookmarks

  return (
    <div className="min-h-screen bg-canvas">
      <Header
        user={user}
        bookmarkCount={bookmarks.length}
        search={search}
        onSearchChange={setSearch}
        onAdd={() => setIsAddOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Realtime status indicator */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-3">
        <div className={`inline-flex items-center gap-1.5 text-xs font-body ${realtimeStatus === 'connected' ? 'text-green-500' : realtimeStatus === 'error' ? 'text-red-400' : 'text-muted'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${realtimeStatus === 'connected' ? 'bg-green-500' : realtimeStatus === 'error' ? 'bg-red-400' : 'bg-muted animate-pulse'}`} />
          {realtimeStatus === 'connected' ? 'Live sync on' : realtimeStatus === 'error' ? 'Sync error' : 'Connecting…'}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {filtered.length === 0 ? (
          <EmptyState search={search} onAdd={() => setIsAddOpen(true)} />
        ) : (
          <>
            {search && (
              <p className="text-muted text-sm font-body mb-4">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <AddBookmarkModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAdd}
      />
      <DeleteConfirmModal
        bookmark={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg font-body text-sm font-medium animate-toast-in ${
              toast.type === 'success'
                ? 'bg-card border-border text-ink'
                : 'bg-red-950 border-red-800 text-red-200'
            }`}
          >
            {toast.type === 'success' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ search, onAdd }: { search: string; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {search ? (
        <>
          <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C7370" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <h3 className="font-display font-semibold text-ink text-xl mb-2">No results</h3>
          <p className="text-muted font-body text-sm">No bookmarks match "{search}"</p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-5">
            <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
              <path d="M3 3h12v10l-6 2-6-2V3z" stroke="#3D3732" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M3 3l6 4 6-4" stroke="#3D3732" strokeWidth="1.5"/>
            </svg>
          </div>
          <h3 className="font-display font-semibold text-ink text-2xl mb-2">Your collection awaits</h3>
          <p className="text-muted font-body text-sm max-w-xs mb-6 leading-relaxed">
            Save your first bookmark and it'll appear here, synced across all your tabs.
          </p>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-flare hover:bg-flare-dim text-canvas font-body font-medium text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add your first bookmark
          </button>
          <p className="mt-3 text-muted text-xs font-body">or press ⌘K</p>
        </>
      )}
    </div>
  )
}
