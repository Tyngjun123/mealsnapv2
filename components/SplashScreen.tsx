'use client'
import { useEffect, useState } from 'react'

export function SplashScreen() {
  const [phase, setPhase] = useState<'hidden' | 'visible' | 'fading'>('hidden')

  useEffect(() => {
    // Only show when launched as installed PWA, and only once per session
    const isPWA = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true
    const shown = sessionStorage.getItem('splashShown')

    if (!isPWA || shown) return

    sessionStorage.setItem('splashShown', '1')
    setPhase('visible')
    const fadeTimer = setTimeout(() => setPhase('fading'), 1800)
    const hideTimer = setTimeout(() => setPhase('hidden'), 2400)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [])

  if (phase === 'hidden') return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(160deg, #4CAF50 0%, #2E7D32 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 0,
      opacity: phase === 'fading' ? 0 : 1,
      transition: 'opacity 0.5s ease-in-out',
      pointerEvents: phase === 'fading' ? 'none' : 'all',
    }}>
      {/* Icon */}
      <div style={{
        width: 100, height: 100, borderRadius: 28,
        background: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 52, marginBottom: 24,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        animation: 'splashPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        🍽️
      </div>

      {/* Name */}
      <div style={{
        fontSize: 38, fontWeight: 900, color: '#fff',
        letterSpacing: -1.5, lineHeight: 1,
        animation: 'splashSlideUp 0.5s ease-out 0.15s both',
      }}>
        MealSnap
      </div>

      {/* Tagline */}
      <div style={{
        fontSize: 14, color: 'rgba(255,255,255,0.75)',
        marginTop: 10, fontWeight: 500, letterSpacing: 0.3,
        animation: 'splashSlideUp 0.5s ease-out 0.25s both',
      }}>
        Point. Snap. Log.
      </div>

      {/* Loading dots */}
      <div style={{
        position: 'absolute', bottom: 'max(60px, calc(env(safe-area-inset-bottom) + 40px))',
        display: 'flex', gap: 8,
        animation: 'splashSlideUp 0.5s ease-out 0.4s both',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
            animation: `splashDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}/>
        ))}
      </div>
    </div>
  )
}
