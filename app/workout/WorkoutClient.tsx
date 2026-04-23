'use client'
import { useState } from 'react'
import { BottomNav } from '@/components/BottomNav'

const EXERCISES = [
  { name: 'Walking',   icon: '🚶', met: 3.5 },
  { name: 'Running',   icon: '🏃', met: 8.0 },
  { name: 'Cycling',   icon: '🚴', met: 6.0 },
  { name: 'Swimming',  icon: '🏊', met: 6.0 },
  { name: 'HIIT',      icon: '⚡', met: 8.0 },
  { name: 'Strength',  icon: '🏋️', met: 5.0 },
  { name: 'Yoga',      icon: '🧘', met: 2.5 },
  { name: 'Hiking',    icon: '🥾', met: 5.5 },
  { name: 'Jump Rope', icon: '🪢', met: 10.0 },
  { name: 'Dance',     icon: '💃', met: 4.5 },
  { name: 'Pilates',   icon: '🤸', met: 3.0 },
  { name: 'Sports',    icon: '🏸', met: 6.0 },
]

const DURATIONS = [15, 20, 30, 45, 60, 90]

interface WorkoutEntry {
  id: string
  exercise: string
  durationMin: number
  kcalBurned: number
  loggedAt: string
}

interface Props {
  weightKg: number
  initialWorkouts: WorkoutEntry[]
}

export function WorkoutClient({ weightKg, initialWorkouts }: Props) {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>(initialWorkouts)
  const [selected, setSelected] = useState<string | null>(null)
  const [duration, setDuration] = useState(30)
  const [saving, setSaving] = useState(false)

  const selectedEx = EXERCISES.find(e => e.name === selected)
  const previewKcal = selectedEx
    ? Math.round(selectedEx.met * weightKg * (duration / 60))
    : 0

  const totalBurned = workouts.reduce((s, w) => s + w.kcalBurned, 0)

  async function handleLog() {
    if (!selected || !selectedEx) return
    setSaving(true)
    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise: selected, durationMin: duration, kcalBurned: previewKcal }),
      })
      if (res.ok) {
        const { workout } = await res.json()
        setWorkouts(prev => [{ ...workout, durationMin: workout.duration_min, kcalBurned: workout.kcal_burned, loggedAt: workout.logged_at }, ...prev])
        setSelected(null)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/workouts?id=${id}`, { method: 'DELETE' })
    setWorkouts(prev => prev.filter(w => w.id !== id))
  }

  return (
    <div className="page-bottom" style={{ background: '#FAFAF7' }}>
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 16px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1D1A', margin: 0 }}>Today's Activity</h1>
        <div style={{ fontSize: 13, color: '#6B7168', marginTop: 2 }} suppressHydrationWarning>
          {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Total burned banner */}
      {totalBurned > 0 && (
        <div style={{ margin: '0 16px 16px', padding: '14px 18px', borderRadius: 16, background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 28 }}>🔥</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#2E7D32' }}>{totalBurned} kcal</div>
            <div style={{ fontSize: 12, color: '#388E3C' }}>burned today</div>
          </div>
        </div>
      )}

      {/* Exercise grid */}
      <div style={{ padding: '0 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7168', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Choose Activity
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {EXERCISES.map(ex => {
            const active = selected === ex.name
            return (
              <button key={ex.name} onClick={() => setSelected(active ? null : ex.name)} style={{
                padding: '10px 4px',
                borderRadius: 14,
                border: active ? '2px solid #4CAF50' : '2px solid transparent',
                background: active ? '#E8F5E9' : '#fff',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                boxShadow: active ? '0 2px 8px rgba(76,175,80,0.2)' : '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.15s',
                WebkitTapHighlightColor: 'transparent',
              }}>
                <span style={{ fontSize: 22 }}>{ex.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: active ? '#2E7D32' : '#1A1D1A', textAlign: 'center', lineHeight: 1.2 }}>{ex.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Duration selector */}
      {selected && (
        <div style={{ margin: '0 16px 16px', padding: 16, borderRadius: 16, background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7168', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Duration
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {DURATIONS.map(d => (
              <button key={d} onClick={() => setDuration(d)} style={{
                padding: '8px 16px', borderRadius: 999,
                border: duration === d ? '2px solid #4CAF50' : '2px solid #E0E0E0',
                background: duration === d ? '#E8F5E9' : '#F5F5F0',
                color: duration === d ? '#2E7D32' : '#1A1D1A',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: 'inherit',
                WebkitTapHighlightColor: 'transparent',
              }}>{d} min</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 13, color: '#6B7168' }}>Est. burn: </span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#4CAF50' }}>{previewKcal} kcal</span>
            </div>
            <button onClick={handleLog} disabled={saving} style={{
              padding: '12px 24px', borderRadius: 999,
              background: saving ? '#9E9E9E' : 'linear-gradient(135deg, #4CAF50, #2E7D32)',
              color: '#fff', fontWeight: 700, fontSize: 14,
              border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(76,175,80,0.35)',
              WebkitTapHighlightColor: 'transparent',
            }}>
              {saving ? 'Saving…' : 'Log it ✓'}
            </button>
          </div>
        </div>
      )}

      {/* Today's logged workouts */}
      {workouts.length > 0 && (
        <div style={{ padding: '0 16px', marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7168', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Logged Today
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {workouts.map(w => {
              const ex = EXERCISES.find(e => e.name === w.exercise)
              return (
                <div key={w.id} style={{
                  padding: '12px 14px', borderRadius: 14, background: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <span style={{ fontSize: 24 }}>{ex?.icon ?? '🏃'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1A' }}>{w.exercise}</div>
                    <div style={{ fontSize: 12, color: '#6B7168' }}>{w.durationMin} min · {w.kcalBurned} kcal</div>
                  </div>
                  <button onClick={() => handleDelete(w.id)} style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: '#FFEBEE', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, color: '#E53935',
                  }}>×</button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {workouts.length === 0 && !selected && (
        <div style={{ textAlign: 'center', padding: '24px 20px', color: '#9E9E9E', fontSize: 13 }}>
          Tap an activity above to log your workout
        </div>
      )}

      <BottomNav />
    </div>
  )
}
