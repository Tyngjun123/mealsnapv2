'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ACTIVITY_LEVELS = [
  { key: 'sedentary',   label: 'Sedentary',        desc: 'Desk job, little movement',   mult: 1.2   },
  { key: 'light',       label: 'Lightly Active',    desc: '1–3 workouts/week',           mult: 1.375 },
  { key: 'moderate',    label: 'Moderately Active', desc: '3–5 workouts/week',           mult: 1.55  },
  { key: 'active',      label: 'Very Active',       desc: '6–7 workouts/week',           mult: 1.725 },
  { key: 'very_active', label: 'Athlete',           desc: 'Hard training twice/day',     mult: 1.9   },
]

const GOALS = [
  { key: 'lose_1',   label: 'Lose weight',       icon: '📉', kcal: -500 },
  { key: 'maintain', label: 'Maintain weight',   icon: '⚖️', kcal: 0    },
  { key: 'gain_2',   label: 'Build muscle',      icon: '💪', kcal: 500  },
]

function calcTDEE(sex: string, w: number, h: number, age: number, act: string) {
  const mult = ACTIVITY_LEVELS.find(a => a.key === act)?.mult ?? 1.55
  const bmr = sex === 'female'
    ? 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * age)
    : 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * age)
  return Math.round(bmr * mult)
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState('maintain')
  const [sex, setSex] = useState('male')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [activity, setActivity] = useState('moderate')
  const [saving, setSaving] = useState(false)

  const h = parseFloat(height), w = parseFloat(weight), a = parseInt(age)
  const tdee = h && w && a ? calcTDEE(sex, w, h, a, activity) : null
  const goalOffset = GOALS.find(g => g.key === goal)?.kcal ?? 0
  const dailyTarget = tdee ? Math.max(1200, tdee + goalOffset) : null

  async function handleFinish() {
    if (!dailyTarget) return
    setSaving(true)
    await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sex,
        height_cm: h,
        weight_kg: w,
        age: a,
        activity_level: activity,
        weekly_goal: goal,
        daily_goal_kcal: dailyTarget,
        protein_target_g: Math.round(dailyTarget * 0.30 / 4),
        carbs_target_g:   Math.round(dailyTarget * 0.40 / 4),
        fat_target_g:     Math.round(dailyTarget * 0.30 / 9),
      }),
    })
    router.push('/')
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    width: '100%', padding: '14px 16px', borderRadius: 16,
    border: active ? '2px solid #4CAF50' : '2px solid #E8E8E8',
    background: active ? '#E8F5E9' : '#fff',
    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
    boxShadow: active ? '0 2px 10px rgba(76,175,80,0.15)' : 'none',
    transition: 'all 0.15s',
    WebkitTapHighlightColor: 'transparent',
  })

  return (
    <div style={{ minHeight: '100dvh', background: '#FAFAF7', display: 'flex', flexDirection: 'column' }}>
      {/* Progress bar */}
      <div style={{ height: 4, background: '#E8E8E8' }}>
        <div style={{ height: '100%', background: '#4CAF50', width: `${(step / 3) * 100}%`, transition: 'width 0.3s ease' }}/>
      </div>

      <div style={{ flex: 1, padding: 'max(52px, calc(env(safe-area-inset-top) + 24px)) 20px 40px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 12, color: '#9E9E9E', fontWeight: 600, marginBottom: 8 }}>STEP {step} OF 3</div>

        {/* Step 1: Goal */}
        {step === 1 && (
          <>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A1D1A', margin: '0 0 6px' }}>What's your goal?</h1>
            <p style={{ fontSize: 14, color: '#6B7168', margin: '0 0 28px' }}>We'll personalise your daily calorie target.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {GOALS.map(g => (
                <button key={g.key} onClick={() => setGoal(g.key)} style={btnStyle(goal === g.key)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 28 }}>{g.icon}</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1D1A' }}>{g.label}</span>
                    {goal === g.key && <span style={{ marginLeft: 'auto', color: '#4CAF50', fontSize: 18 }}>✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2: Stats */}
        {step === 2 && (
          <>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A1D1A', margin: '0 0 6px' }}>Your stats</h1>
            <p style={{ fontSize: 14, color: '#6B7168', margin: '0 0 24px' }}>Used to calculate your personalised TDEE.</p>

            {/* Sex */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {['male', 'female'].map(s => (
                <button key={s} onClick={() => setSex(s)} style={{
                  flex: 1, padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: sex === s ? '#4CAF50' : '#F0F0EC',
                  color: sex === s ? '#fff' : '#1A1D1A',
                  fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
                  WebkitTapHighlightColor: 'transparent',
                }}>{s === 'male' ? '♂ Male' : '♀ Female'}</button>
              ))}
            </div>

            {/* Numeric fields */}
            {[
              { label: 'Height', value: height, setter: setHeight, unit: 'cm', placeholder: '170' },
              { label: 'Weight', value: weight, setter: setWeight, unit: 'kg', placeholder: '70' },
              { label: 'Age',    value: age,    setter: setAge,    unit: 'yrs', placeholder: '25' },
            ].map(f => (
              <div key={f.label} style={{ background: '#fff', borderRadius: 14, padding: '12px 16px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <span style={{ fontSize: 15, color: '#1A1D1A' }}>{f.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="number" value={f.value} onChange={e => f.setter(e.target.value)}
                    placeholder={f.placeholder} inputMode="decimal"
                    style={{ width: 70, border: 'none', textAlign: 'right', fontSize: 17, fontWeight: 700, color: '#4CAF50', background: 'none', fontFamily: 'inherit', outline: 'none' }}/>
                  <span style={{ fontSize: 13, color: '#9E9E9E', minWidth: 28 }}>{f.unit}</span>
                </div>
              </div>
            ))}

            {/* Activity */}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Activity Level</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ACTIVITY_LEVELS.map(a => (
                  <button key={a.key} onClick={() => setActivity(a.key)} style={{
                    ...btnStyle(activity === a.key),
                    padding: '12px 14px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1A' }}>{a.label}</div>
                        <div style={{ fontSize: 12, color: '#9E9E9E' }}>{a.desc}</div>
                      </div>
                      {activity === a.key && <span style={{ color: '#4CAF50', fontSize: 16 }}>✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A1D1A', margin: '0 0 6px' }}>Your daily plan</h1>
            <p style={{ fontSize: 14, color: '#6B7168', margin: '0 0 24px' }}>Based on your stats and goal.</p>

            {dailyTarget ? (
              <>
                <div style={{ background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', borderRadius: 20, padding: '28px 24px', textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>Daily Calorie Target</div>
                  <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', letterSpacing: -2 }}>{dailyTarget.toLocaleString()}</div>
                  <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }}>kcal / day</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                  {[
                    { label: 'Protein', value: Math.round(dailyTarget * 0.30 / 4), color: '#4CAF50' },
                    { label: 'Carbs',   value: Math.round(dailyTarget * 0.40 / 4), color: '#FFA726' },
                    { label: 'Fat',     value: Math.round(dailyTarget * 0.30 / 9), color: '#42A5F5' },
                  ].map(m => (
                    <div key={m.label} style={{ background: '#fff', borderRadius: 14, padding: '14px 10px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{m.value}g</div>
                      <div style={{ fontSize: 11, color: '#9E9E9E', marginTop: 2 }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#F5F5F0', borderRadius: 14, padding: '14px 16px', fontSize: 13, color: '#6B7168', lineHeight: 1.6 }}>
                  You can always adjust these in <strong>Settings → Goals</strong> later.
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 24, color: '#9E9E9E' }}>
                Go back and fill in your height, weight, and age to see your plan.
              </div>
            )}
          </>
        )}

        {/* Navigation */}
        <div style={{ marginTop: 'auto', paddingTop: 24, display: 'flex', gap: 10 }}>
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} style={{
              flex: 1, padding: '14px', borderRadius: 14, border: '2px solid #E0E0E0',
              background: '#fff', color: '#1A1D1A', fontWeight: 700, fontSize: 15,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>← Back</button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} style={{
              flex: 2, padding: '14px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
              color: '#fff', fontWeight: 700, fontSize: 15,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 16px rgba(76,175,80,0.35)',
            }}>Continue →</button>
          ) : (
            <button onClick={handleFinish} disabled={!dailyTarget || saving} style={{
              flex: 2, padding: '14px', borderRadius: 14, border: 'none',
              background: !dailyTarget || saving ? '#E0E0E0' : 'linear-gradient(135deg, #4CAF50, #2E7D32)',
              color: !dailyTarget || saving ? '#9E9E9E' : '#fff',
              fontWeight: 700, fontSize: 15,
              cursor: !dailyTarget || saving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: dailyTarget && !saving ? '0 4px 16px rgba(76,175,80,0.35)' : 'none',
            }}>{saving ? 'Setting up…' : "Let's go! 🚀"}</button>
          )}
        </div>
      </div>
    </div>
  )
}
