'use client'
// Phase 1: Simple name-based onboarding (no OAuth needed)
// Phase 2: Re-enable Google login via LoginButton + NextAuth
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile, saveProfile } from '@/lib/store'

const FEATURES = [
  { emoji: '📸', text: 'Snap a photo → instant calorie count' },
  { emoji: '🧠', text: 'AI identifies every item on your plate' },
  { emoji: '📊', text: 'Track macros & daily nutrition goals' },
  { emoji: '💾', text: 'Data saved locally on your device' },
]

export default function LoginPage() {
  const router = useRouter()
  const [name, setName]     = useState('')
  const [goal, setGoal]     = useState(2000)
  const [step, setStep]     = useState<'splash' | 'setup'>('splash')

  useEffect(() => {
    if (getProfile()) router.replace('/')
  }, [router])

  function handleStart() {
    if (!name.trim()) return
    saveProfile({ name: name.trim(), dailyGoalKcal: goal, heightCm: null, weightKg: null, age: null, isPro: false })
    router.push('/')
  }

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

      {step === 'splash' ? (
        <>
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
          <button onClick={() => setStep('setup')} className="btn-primary" style={{ width: '100%', maxWidth: 320, fontSize: 16 }}>
            Get Started →
          </button>
        </>
      ) : (
        <div style={{ width: '100%', maxWidth: 320 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A1D1A', margin: '0 0 24px', letterSpacing: -0.5 }}>
            Quick setup
          </h2>

          {/* Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#6B7168', display: 'block', marginBottom: 8 }}>
              YOUR NAME
            </label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              placeholder="e.g. Alex"
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 14,
                border: '1.5px solid #E0E0E0', fontSize: 16,
                fontFamily: 'inherit', outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#4CAF50')}
              onBlur={e => (e.target.style.borderColor = '#E0E0E0')}
            />
          </div>

          {/* Daily goal */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#6B7168', display: 'block', marginBottom: 8 }}>
              DAILY CALORIE GOAL
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#fff', borderRadius: 14, padding: '14px 16px',
              border: '1.5px solid #E0E0E0',
            }}>
              <input type="range" min={1000} max={4000} step={50} value={goal}
                onChange={e => setGoal(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#4CAF50' }}/>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#4CAF50', minWidth: 60, textAlign: 'right' }}>
                {goal}
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#9E9E9E', marginTop: 6 }}>
              Recommended: 1800–2200 kcal for most adults
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!name.trim()}
            className="btn-primary"
            style={{ width: '100%', fontSize: 16, opacity: name.trim() ? 1 : 0.5 }}>
            Start Tracking 🚀
          </button>
        </div>
      )}
    </div>
  )
}
