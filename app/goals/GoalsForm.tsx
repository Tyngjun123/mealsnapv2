'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav'

const ACTIVITY_MULT: Record<string, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
}

function calcTDEE(sex: string, weightKg: number, heightCm: number, age: number, activity: string): number {
  const bmr = sex === 'female'
    ? 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age)
    : 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age)
  return Math.round(bmr * (ACTIVITY_MULT[activity] ?? 1.55))
}

const ACTIVITY_LEVELS = [
  { key: 'sedentary',   label: 'Sedentary',          desc: 'Little or no exercise' },
  { key: 'light',       label: 'Lightly Active',      desc: '1–3 days/week' },
  { key: 'moderate',    label: 'Moderately Active',   desc: '3–5 days/week' },
  { key: 'active',      label: 'Active',              desc: '6–7 days/week' },
  { key: 'very_active', label: 'Very Active',         desc: 'Hard exercise daily' },
]

const WEEKLY_GOALS = [
  { key: 'lose_1',   label: 'Lose 0.5 kg/week',   kcal: -500 },
  { key: 'lose_2',   label: 'Lose 0.25 kg/week',  kcal: -250 },
  { key: 'maintain', label: 'Maintain weight',     kcal: 0 },
  { key: 'gain_1',   label: 'Gain 0.25 kg/week',  kcal: 250 },
  { key: 'gain_2',   label: 'Gain 0.5 kg/week',   kcal: 500 },
]

const WEEKLY_KG: Record<string, number> = {
  lose_1: -0.5, lose_2: -0.25, maintain: 0, gain_1: 0.25, gain_2: 0.5,
}

function bmi(weightKg: number, heightCm: number) {
  const h = heightCm / 100
  return weightKg / (h * h)
}

function bmiLabel(b: number) {
  if (b < 18.5) return { label: 'Underweight', color: '#1565C0' }
  if (b < 25)   return { label: 'Normal',       color: '#4CAF50' }
  if (b < 30)   return { label: 'Overweight',   color: '#FF7043' }
  return               { label: 'Obese',         color: '#C62828' }
}

interface Props {
  currentWeight: number | null
  goalWeight: number | null
  weeklyGoal: string
  activity: string
  sex: string
  dailyGoalKcal: number
  heightCm: number | null
  age: number | null
}

export function GoalsForm({ currentWeight, goalWeight, weeklyGoal: initialWeekly, activity: initialActivity, sex: initialSex, dailyGoalKcal, heightCm, age: initialAge }: Props) {
  const router = useRouter()
  const [curWeight, setCurWeight]   = useState(currentWeight?.toString() ?? '')
  const [goalWt, setGoalWt]         = useState(goalWeight?.toString() ?? '')
  const [weekly, setWeekly]         = useState(initialWeekly || 'maintain')
  const [activity, setActivity]     = useState(initialActivity || 'moderate')
  const [sex, setSex]               = useState(initialSex || 'male')
  const [age, setAge]               = useState(initialAge?.toString() ?? '')
  const [showActivity, setShowActivity] = useState(false)
  const [showWeekly, setShowWeekly]     = useState(false)
  const [saved, setSaved]               = useState(false)

  const ageNum = parseInt(age) || 0
  const weightNum = parseFloat(curWeight) || 0
  const tdee = heightCm && weightNum && ageNum
    ? calcTDEE(sex, weightNum, heightCm, ageNum, activity)
    : null
  const weeklyOffset = WEEKLY_GOALS.find(w => w.key === weekly)?.kcal ?? 0
  const suggestedKcal = tdee ? Math.max(1200, tdee + weeklyOffset) : null

  const actLabel  = ACTIVITY_LEVELS.find(a => a.key === activity)?.label ?? ''
  const weekLabel = WEEKLY_GOALS.find(w => w.key === weekly)?.label ?? ''

  async function handleSave() {
    const body: Record<string, unknown> = {
      weight_kg:      curWeight ? parseFloat(curWeight) : null,
      goal_weight_kg: goalWt    ? parseFloat(goalWt)    : null,
      activity_level: activity,
      weekly_goal:    weekly,
      sex,
      age: ageNum || null,
    }
    if (suggestedKcal) {
      body.daily_goal_kcal  = suggestedKcal
      body.protein_target_g = Math.round(suggestedKcal * 0.30 / 4)
      body.carbs_target_g   = Math.round(suggestedKcal * 0.40 / 4)
      body.fat_target_g     = Math.round(suggestedKcal * 0.30 / 9)
    }
    await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaved(true)
    setTimeout(() => router.push('/'), 1000)
  }

  return (
    <div className="page-bottom" style={{ background: '#FAFAF7' }}>
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D1A', margin: 0, flex: 1 }}>Goals</h1>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Sex */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Biological Sex</div>
        <div className="card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10 }}>
          {['male', 'female'].map(s => (
            <button key={s} onClick={() => setSex(s)} style={{
              flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: sex === s ? '#4CAF50' : '#F5F5F0',
              color: sex === s ? '#fff' : '#1A1D1A',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
              boxShadow: sex === s ? '0 4px 12px rgba(76,175,80,0.3)' : 'none',
              transition: 'all 0.15s',
            }}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
          ))}
        </div>

        {/* Weight + Age */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Body Stats</div>
        <div className="card" style={{ padding: '0 16px', marginBottom: 16 }}>
          {[
            { label: 'Current Weight', value: curWeight, setter: setCurWeight, unit: 'kg' },
            { label: 'Goal Weight',    value: goalWt,    setter: setGoalWt,    unit: 'kg' },
            { label: 'Age',            value: age,       setter: setAge,       unit: 'yrs' },
          ].map((row, i) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 2 ? '1px solid #F5F5F0' : 'none' }}>
              <span style={{ fontSize: 15, color: '#1A1D1A' }}>{row.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="number" value={row.value} onChange={e => row.setter(e.target.value)}
                  placeholder="–"
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
                <button key={g.key} onClick={() => { setWeekly(g.key); setShowWeekly(false) }} style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  <span style={{ fontSize: 14, color: '#1A1D1A' }}>{g.label}</span>
                  {weekly === g.key && <span style={{ color: '#4CAF50', fontSize: 16 }}>✓</span>}
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

        {/* 30-day projection */}
        {curWeight && goalWt && heightCm && parseFloat(curWeight) > 0 && parseFloat(goalWt) > 0 && (
          (() => {
            const cur = parseFloat(curWeight)
            const goal = parseFloat(goalWt)
            const weeklyChange = WEEKLY_KG[weekly] ?? 0
            const rows = [7, 14, 21, 30].map(days => {
              const weeks = days / 7
              const projected = cur + weeklyChange * weeks
              const clamped = weeklyChange < 0 ? Math.max(projected, goal) : Math.min(projected, goal)
              const b = bmi(clamped, heightCm)
              const { label, color } = bmiLabel(b)
              const reached = weeklyChange < 0 ? projected <= goal : weeklyChange > 0 ? projected >= goal : true
              return { days, weight: clamped, bmi: b, label, color, reached }
            })
            const daysToGoal = weeklyChange !== 0
              ? Math.ceil(Math.abs(goal - cur) / Math.abs(weeklyChange) * 7)
              : null

            return (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                  30-Day Weight Projection
                </div>
                <div className="card" style={{ padding: '0 16px', marginBottom: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 70px 80px', gap: 8, padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
                    {['Day', 'Weight', 'BMI', 'Status'].map(h => (
                      <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase' }}>{h}</div>
                    ))}
                  </div>
                  {rows.map((r, i) => (
                    <div key={r.days} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 70px 80px', gap: 8, padding: '13px 0', borderBottom: i < rows.length - 1 ? '1px solid #F5F5F0' : 'none', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1D1A' }}>Day {r.days}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: r.reached ? '#4CAF50' : '#1A1D1A' }}>
                        {r.weight.toFixed(1)} kg {r.reached && weeklyChange !== 0 ? '🎯' : ''}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#6B7168' }}>{r.bmi.toFixed(1)}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: r.color, background: r.color + '18', padding: '3px 6px', borderRadius: 6 }}>{r.label}</span>
                    </div>
                  ))}
                </div>
                {daysToGoal !== null && (
                  <div style={{ padding: '12px 14px', borderRadius: 12, background: '#E8F5E9', border: '1px solid #C8E6C9' }}>
                    <span style={{ fontSize: 13, color: '#2E7D32', fontWeight: 600 }}>
                      {daysToGoal <= 30
                        ? `At this rate you reach ${goal} kg in ~${daysToGoal} days`
                        : `At this rate you reach ${goal} kg in ~${Math.round(daysToGoal / 7)} weeks`}
                    </span>
                  </div>
                )}
              </div>
            )
          })()
        )}

        {/* TDEE / calorie target */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Daily Calorie Target</div>
        {suggestedKcal ? (
          <div className="card" style={{ padding: '16px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: '#6B7168' }}>TDEE (maintenance)</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1D1A' }}>{tdee?.toLocaleString()} kcal</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #F0F0EC' }}>
              <span style={{ fontSize: 14, color: '#6B7168' }}>Goal adjustment</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: weeklyOffset < 0 ? '#E53935' : weeklyOffset > 0 ? '#4CAF50' : '#9E9E9E' }}>
                {weeklyOffset > 0 ? '+' : ''}{weeklyOffset} kcal
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1D1A' }}>Your Daily Target</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#4CAF50' }}>{suggestedKcal.toLocaleString()} kcal</span>
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9E9E9E' }}>
              <span>P: {Math.round(suggestedKcal * 0.30 / 4)}g</span>
              <span>C: {Math.round(suggestedKcal * 0.40 / 4)}g</span>
              <span>F: {Math.round(suggestedKcal * 0.30 / 9)}g</span>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '16px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: '#6B7168' }}>Fill in weight & age above to auto-calculate</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#4CAF50' }}>{dailyGoalKcal.toLocaleString()} kcal</span>
            </div>
          </div>
        )}

        <button className="btn-primary" style={{ width: '100%', marginBottom: 16 }} onClick={handleSave}>
          {saved ? '✓ Saved!' : 'Save Goals'}
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
