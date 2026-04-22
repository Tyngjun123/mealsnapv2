'use client'
// Phase 2: Google OAuth login
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LoginButton } from './LoginButton'

const FEATURES = [
  { emoji: '📸', text: 'Snap a photo → instant calorie count' },
  { emoji: '🧠', text: 'AI identifies every item on your plate' },
  { emoji: '📊', text: 'Track macros & daily nutrition goals' },
  { emoji: '☁️', text: 'Synced across all your devices' },
]

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.replace('/')
  }, [session, router])

  if (status === 'loading') return null

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', background: '#FAFAF7',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 28,
          background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, margin: '0 auto 20px',
          boxShadow: '0 8px 32px rgba(76,175,80,0.3)',
        }}>🍽️</div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: '#1A1D1A', margin: '0 0 8px', letterSpacing: -1.5 }}>
          MealSnap
        </h1>
        <p style={{ fontSize: 15, color: '#6B7168', margin: 0, lineHeight: 1.5 }}>
          Point. Snap. Log.<br />AI-powered calorie tracking
        </p>
      </div>

      {/* Features */}
      <div style={{ width: '100%', maxWidth: 320, marginBottom: 36 }}>
        {FEATURES.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{
              width: 40, height: 40, borderRadius: 12, background: '#E8F5E9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>{f.emoji}</span>
            <span style={{ fontSize: 14, color: '#1A1D1A', fontWeight: 500 }}>{f.text}</span>
          </div>
        ))}
      </div>

      <LoginButton />

      <p style={{ marginTop: 20, fontSize: 12, color: '#6B7168', textAlign: 'center', maxWidth: 280 }}>
        By signing in, you agree to our Terms of Service.<br />
        Your data is stored securely on your device.
      </p>
    </div>
  )
}
