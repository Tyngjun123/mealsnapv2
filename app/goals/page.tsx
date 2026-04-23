'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ACTIVITY_LEVELS = [
  { key: 'sedentary',  label: 'Sedentary',       desc: 'Little or no exercise' },
  { key: 'light',      label: 'Lightly Active',   desc: '1–3 days/week' },
  { key: 'moderate',   label: 'Moderately Active', desc: '3–5 days/week' },
  { key: 'active',     label: 'Active',            desc: '6–7 days/week' },
  { key: 'very_active', label: 'Very Active',      desc: 'Hard exercise daily' },
]

const WEEKLY_GOALS = [
  { key: 'lose_1', label: 'Lose 0.5 kg/week', kcal: -500 },
  { key: 'lose_2', label: 'Lose 0.25 kg/week', kcal: -250 },
  { key: 'maintain', label: 'Maintain weight', kcal: 0 },
  { key: 'gain_1', label: 'Gain 0.25 kg/week', kcal: 250 },
  { key: 'gain_2', label: 'Gain 0.5 kg/week', kcal: 500 },
]

export default function GoalsPage() {
  const router = useRouter()
  const [currentWeight, setCurrentWeight] = useState('72')
  const [goalWeight, setGoalWeight] = useState('68')
  const [weeklyGoal, setWeeklyGoal] = useState('lose_1')
  const [activity, setActivity] = useState('active')
  const [showActivity, setShowActivity] = useState(false)
  const [showWeekly, setShowWeekly] = useState(false)

  const actLabel = ACTIVITY_LEVELS.find(a => a.key === activity)?.label ?? ''
  const weekLabel = WEEKLY_GOALS.find(w => w.key === weeklyGoal)?.label ?? ''

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7' }}>
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D1A', margin: 0 }}>Goals</h1>
      </div>

      <div style={{ padding: '0 16px 100px' }}>
        {/* Weight section */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Weight</div>
        <div className="card" style={{ padding: '0 16px', marginBottom: 16 }}>
          {[
            { label: 'Current Weight', value: currentWeight, setter: setCurrentWeight, unit: 'kg' },
            { label: 'Goal Weight',    value: goalWeight,    setter: setGoalWeight,    unit: 'kg' },
          ].map((row, i) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i === 0 ? '1px solid #F5F5F0' : 'none' }}>
              <span style={{ fontSize: 15, color: '#1A1D1A' }}>{row.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number" value={row.value}
                  onChange={e => row.setter(e.target.value)}
                  style={{ width: 60, border: 'none', textAlign: 'right', fontSize: 15, fontWeight: 700, color: '#4CAF50', background: 'none', fontFamily: 'inherit', outline: 'none' }}
                />
                <span style={{ fontSize: 13, color: '#6B7168' }}>{row.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly goal */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Weekly Goal</div>
        <div className="card" style={{ padding: '0 16px', marginBottom: 16 }}>
          <button onClick={() => setShowWeekly(!showWeekly)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <span style={{ fontSize: 15, color: '#1A1D1A' }}>Weekly Goal</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#4CAF50' }}>{weekLabel} ›</span>
          </button>
          {showWeekly && (
            <div style={{ borderTop: '1px solid #F5F5F0', paddingBottom: 8 }}>
              {WEEKLY_GOALS.map(g => (
                <button key={g.key} onClick={() => { setWeeklyGoal(g.key); setShowWeekly(false) }} style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  <span style={{ fontSize: 14, color: '#1A1D1A' }}>{g.label}</span>
                  {weeklyGoal === g.key && <span style={{ color: '#4CAF50', fontSize: 16 }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Activity level */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Fitness</div>
        <div className="card" style={{ padding: '0 16px', marginBottom: 16 }}>
          <button onClick={() => setShowActivity(!showActivity)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <span style={{ fontSize: 15, color: '#1A1D1A' }}>Activity Level</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#4CAF50' }}>{actLabel} ›</span>
          </button>
          {showActivity && (
            <div style={{ borderTop: '1px solid #F5F5F0', paddingBottom: 8 }}>
              {ACTIVITY_LEVELS.map(a => (
                <button key={a.key} onClick={() => { setActivity(a.key); setShowActivity(false) }} style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, color: '#1A1D1A' }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: '#6B7168' }}>{a.desc}</div>
                  </div>
                  {activity === a.key && <span style={{ color: '#4CAF50', fontSize: 16 }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nutrition Goals */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Nutrition Goals</div>
        <div className="card" style={{ padding: '0 16px', marginBottom: 24 }}>
          {[
            { label: 'Calorie Goal', value: '2,000 kcal', link: '/profile' },
            { label: 'Protein Goal', value: '150g (30%)', link: '#' },
            { label: 'Carbs Goal',   value: '200g (40%)', link: '#' },
            { label: 'Fat Goal',     value: '67g (30%)',  link: '#' },
          ].map((row, i, arr) => (
            <button key={row.label} onClick={() => router.push(row.link)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid #F5F5F0' : 'none', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              <span style={{ fontSize: 15, color: '#1A1D1A' }}>{row.label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#4CAF50' }}>{row.value} ›</span>
            </button>
          ))}
        </div>

        <button className="btn-primary" style={{ width: '100%' }}>Save Goals</button>
      </div>
    </div>
  )
}
