'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }}
      />

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(#F2EDE8 1px, transparent 1px), linear-gradient(90deg, #F2EDE8 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center animate-slide-up">
        {/* Brand */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-flare rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 3h12v10l-6 2-6-2V3z" stroke="#0B0A08" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M3 3l6 4 6-4" stroke="#0B0A08" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="font-display text-2xl font-semibold text-ink tracking-tight">Folio</span>
          </div>
          <h1 className="font-display text-5xl font-bold text-ink leading-none mb-4 tracking-tight">
            Save what<br />
            <span className="text-flare italic">matters.</span>
          </h1>
          <p className="text-muted text-base font-body leading-relaxed">
            Bookmarks that sync in real-time,<br />across every tab.
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-ink text-canvas font-body font-medium text-sm py-3 px-4 rounded-xl transition-all duration-200 hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isLoading ? (
              <svg className="animate-spin-slow w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
                <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z"/>
                <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"/>
                <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
              </svg>
            )}
            {isLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          <p className="text-center text-muted text-xs mt-4 font-body">
            No password needed. Sign in with your Google account.
          </p>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-muted text-xs text-center font-body">
          Your bookmarks are private and encrypted.
        </p>
      </div>
    </main>
  )
}
