import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        body: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: '#0B0A08',
        card: '#131110',
        'card-hover': '#1A1714',
        border: '#2A2521',
        'border-bright': '#3D3732',
        ink: '#F2EDE8',
        muted: '#7C7370',
        flare: '#F97316',
        'flare-dim': '#C45C0A',
      },
      keyframes: {
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'toast-in': 'toast-in 0.3s ease-out',
        'spin-slow': 'spin-slow 0.8s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
