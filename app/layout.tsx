import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { SplashScreen } from '@/components/SplashScreen'
import { NavWrapper } from './NavWrapper'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'MealSnap — AI Calorie Tracker',
  description: 'Point. Snap. Log. AI-powered meal calorie tracking.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MealSnap',
  },
  icons: {
    icon: '/icon.svg',
    apple: [
      { url: '/api/icon/192', sizes: '192x192', type: 'image/png' },
      { url: '/api/icon/512', sizes: '512x512', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4CAF50',
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          <SplashScreen />
          <main className="max-w-md mx-auto relative brand-bg" style={{ height: '100dvh', overflowY: 'auto', overscrollBehavior: 'none' }}>
            {children}
            <NavWrapper />
          </main>
        </Providers>
      </body>
    </html>
  )
}
