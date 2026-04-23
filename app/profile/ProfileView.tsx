'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { BottomNav } from '@/components/BottomNav'

interface UserProfile {
  name: string; email: string; avatarUrl: string
  dailyGoalKcal: number; heightCm: number | null
  weightKg: number | null; age: number | null; isPro: boolean
}
interface Props { user: UserProfile }

export function ProfileView({ user }: Props) {
  const router = useRouter()
  const [goal, setGoal]     = useState(user.dailyGoalKcal)
  const [height, setHeight] = useState(user.heightCm?.toString() ?? '')
  const [weight, setWeight] = useState(user.weightKg?.toString() ?? '')
  const [age, setAge]       = useState(user.age?.toString() ?? '')
  const [saved, setSaved]   = useState(false)

  const GOAL_PRESETS = [
    { label: 'Lose', kcal: 1500, desc: '−500 deficit' },
    { label: 'Maintain', kcal: 2000, desc: 'Balance' },
    { label: 'Gain', kcal: 2500, desc: '+500 surplus' },
  ]

  async function handleSave() {
    await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daily_goal_kcal: goal, height_cm: height ? parseInt(height) : null, weight_kg: weight ? parseFloat(weight) : null, age: age ? parseInt(age) : null }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleExport() {
    const res  = await fetch('/api/meals?export=1')
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `mealsnap-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  function handleSignOut() {
    signOut({ callbackUrl: '/login' })
  }

  const isGuest = user.email.endsWith('@guest')

  return (
    <div className="page-bottom">
      {/* Header */}
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 20px 0' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D1A', margin: 0, letterSpacing: -0.5 }}>Profile</h1>
      </div>

      {/* Guest banner */}
      {isGuest && (
        <div style={{ margin: '12px 16px 0', padding: '14px 16px', borderRadius: 16, background: '#FFF8E1', border: '1px solid #FFE082', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#5D4037' }}>Guest session</div>
            <div style={{ fontSize: 12, color: '#795548', marginTop: 2 }}>Data will be lost when you sign out.</div>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} style={{
            padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: '#4CAF50', color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', flexShrink: 0,
          }}>Sign In</button>
        </div>
      )}

      {/* User card */}
      <div className="card" style={{ margin: '16px 16px', padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="avatar" width={60} height={60}
            style={{ borderRadius: '50%', border: '3px solid #E8F5E9', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, color: '#fff', fontWeight: 800, flexShrink: 0,
          }}>{user.name?.[0]?.toUpperCase() ?? '?'}</div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#1A1D1A' }}>{user.name}</div>
          <div style={{ fontSize: 13, color: '#6B7168', marginTop: 2 }}>{user.email}</div>
        </div>
        <span style={{
          padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
          background: user.isPro ? 'linear-gradient(135deg, #FFD700, #FF8F00)' : '#F5F5F0',
          color: user.isPro ? '#fff' : '#6B7168', flexShrink: 0,
        }}>{user.isPro ? '⭐ Pro' : 'Free'}</span>
      </div>

      {/* Daily Goal */}
      <div className="card" style={{ margin: '0 16px 12px', padding: '20px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1A', marginBottom: 14 }}>Daily Calorie Goal</div>

        {/* Presets */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {GOAL_PRESETS.map(p => (
            <button key={p.label} onClick={() => setGoal(p.kcal)} style={{
              flex: 1, padding: '10px 4px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: goal === p.kcal ? '#4CAF50' : '#F5F5F0',
              color: goal === p.kcal ? '#fff' : '#1A1D1A',
              fontFamily: 'inherit', textAlign: 'center',
              boxShadow: goal === p.kcal ? '0 4px 12px rgba(76,175,80,0.3)' : 'none',
              transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{p.label}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{p.kcal} kcal</div>
              <div style={{ fontSize: 10, opacity: 0.6 }}>{p.desc}</div>
            </button>
          ))}
        </div>

        {/* Custom slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#6B7168' }}>Custom</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#4CAF50', fontVariantNumeric: 'tabular-nums' }}>
              {goal.toLocaleString()} kcal
            </span>
          </div>
          <input type="range" min={1000} max={4000} step={50} value={goal}
            onChange={e => setGoal(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#4CAF50' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6B7168', marginTop: 4 }}>
            <span>1,000</span><span>4,000</span>
          </div>
        </div>
      </div>

      {/* Personal Stats */}
      <div className="card" style={{ margin: '0 16px 12px', padding: '20px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1A', marginBottom: 14 }}>Personal Stats</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: 'Height', value: height, setter: setHeight, unit: 'cm', placeholder: '170' },
            { label: 'Weight', value: weight, setter: setWeight, unit: 'kg', placeholder: '65' },
            { label: 'Age', value: age, setter: setAge, unit: 'yrs', placeholder: '25' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 11, color: '#6B7168', fontWeight: 600, marginBottom: 6 }}>
                {f.label} ({f.unit})
              </div>
              <input
                type="number" value={f.value} placeholder={f.placeholder}
                onChange={e => f.setter(e.target.value)}
                style={{
                  width: '100%', border: '1.5px solid #E0E0E0', borderRadius: 10,
                  padding: '10px 8px', fontSize: 16, fontWeight: 700,
                  fontFamily: 'inherit', outline: 'none', textAlign: 'center',
                  color: '#1A1D1A',
                }}
                onFocus={e => (e.target.style.borderColor = '#4CAF50')}
                onBlur={e => (e.target.style.borderColor = '#E0E0E0')}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div style={{ padding: '0 16px 12px' }}>
        <button onClick={handleSave} className="btn-primary" style={{ width: '100%', fontSize: 15 }}>
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Quick links */}
      <div className="card" style={{ margin: '0 16px 12px', padding: '8px 0', overflow: 'hidden' }}>
        {[
          { emoji: '🎯', label: 'Goals',             action: () => router.push('/goals'),    color: '#1A1D1A' },
          { emoji: '📈', label: 'Progress',          action: () => router.push('/progress'), color: '#1A1D1A' },
          { emoji: '🥗', label: 'Nutrition Details', action: () => router.push('/nutrition'), color: '#1A1D1A' },
          { emoji: '⚙️', label: 'Settings',          action: () => router.push('/settings'), color: '#1A1D1A' },
        ].map((item, i) => (
          <button key={item.label} onClick={item.action} style={{
            width: '100%', padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            borderTop: i > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none',
            textAlign: 'left',
          }}>
            <span style={{ fontSize: 22 }}>{item.emoji}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: item.color, flex: 1 }}>{item.label}</span>
            <span style={{ color: '#C0C0C0' }}>›</span>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="card" style={{ margin: '0 16px 12px', padding: '8px 0', overflow: 'hidden' }}>
        {[
          { emoji: '📤', label: 'Export Data (JSON)', action: handleExport, color: '#1A1D1A' },
          { emoji: '🚪', label: 'Sign Out', action: handleSignOut, color: '#F44336' },
        ].map((item, i) => (
          <button key={item.label} onClick={item.action} style={{
            width: '100%', padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            borderTop: i > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none',
            textAlign: 'left',
          }}>
            <span style={{ fontSize: 22 }}>{item.emoji}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: item.color }}>{item.label}</span>
          </button>
        ))}
      </div>

      {true && (
        <div style={{ margin: '0 16px', padding: '16px', borderRadius: 20, background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', textAlign: 'center' }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>⭐</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Upgrade to Pro</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: '4px 0 12px' }}>
            Unlimited AI scans · Advanced stats · Cloud backup
          </div>
          <button style={{
            background: '#fff', color: '#2E7D32', border: 'none',
            borderRadius: 12, padding: '10px 24px',
            fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            $4.99/month →
          </button>
        </div>
      )}

      <BottomNav/>
    </div>
  )
}
