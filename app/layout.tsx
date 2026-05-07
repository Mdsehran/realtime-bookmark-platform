import type { Metadata } from 'next'
import { Fraunces, Outfit } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['300', '400', '500', '700'],
  style: ['normal', 'italic'],
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Folio — Smart Bookmarks',
  description: 'Save, organize, and sync your bookmarks across every tab.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  )
}
