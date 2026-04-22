'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav'
import { getProfile, saveProfile, getMealsByDays } from '@/lib/store'

export default function ProfileView() {
  const router  = useRouter()
  const profile = getProfile()
  const [name, setName]     = useState(profile?.name ?? '')
  const [goal, setGoal]     = useState(profile?.dailyGoalKcal ?? 2000)
  const [height, setHeight] = useState(profile?.heightCm?.toString() ?? '')
  const [weight, setWeight] = useState(profile?.weightKg?.toString() ?? '')
  const [age, setAge]       = useState(profile?.age?.toString() ?? '')
  const [saved, setSaved]   = useState(false)
  const [mealCount, setMealCount] = useState(0)

  useEffect(() => {
    if (!profile) { router.replace('/login'); return }
    setMealCount(getMealsByDays(30).length)
  }, [profile, router])

  const GOAL_PRESETS = [
    { label: 'Lose', kcal: 1500, desc: '−500 deficit' },
    { label: 'Maintain', kcal: 2000, desc: 'Balance' },
    { label: 'Gain', kcal: 2500, desc: '+500 surplus' },
  ]

  function handleSave() {
    if (!profile) return
    saveProfile({ ...profile, name, dailyGoalKcal: goal, heightCm: height ? parseInt(height) : null, weightKg: weight ? parseFloat(weight) : null, age: age ? parseInt(age) : null })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleExport() {
    const meals = getMealsByDays(365)
    const json  = JSON.stringify(meals, null, 2)
    const blob  = new Blob([json], { type: 'application/json' })
    const url   = URL.createObjectURL(blob)
    const a     = document.createElement('a')
    a.href = url
    a.download = `mealsnap-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  function handleSignOut() {
    localStorage.removeItem('ms_profile')
    router.push('/login')
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 0' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D1A', margin: 0, letterSpacing: -0.5 }}>Profile</h1>
      </div>

      {/* User card */}
      <div className="card" style={{ margin: '16px 16px', padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, color: '#fff', fontWeight: 800, flexShrink: 0,
        }}>{name?.[0]?.toUpperCase() ?? '?'}</div>
        <div style={{ flex: 1 }}>
          <input value={name} onChange={e => setName(e.target.value)}
            style={{ fontSize: 17, fontWeight: 800, color: '#1A1D1A', border: 'none', background: 'none', fontFamily: 'inherit', outline: 'none', width: '100%' }}/>
          <div style={{ fontSize: 12, color: '#6B7168', marginTop: 2 }}>
            {mealCount} meals logged (30 days)
          </div>
        </div>
        <span style={{
          padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
          background: '#F5F5F0', color: '#6B7168', flexShrink: 0,
        }}>Free</span>
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
