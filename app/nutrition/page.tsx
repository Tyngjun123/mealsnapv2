'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'


const MEAL_COLORS: Record<string, string> = {
  breakfast: '#F9A825',
  lunch:     '#4CAF50',
  dinner:    '#1565C0',
  snack:     '#FF7043',
}

interface MealRow { id: string; meal_type: string; total_kcal: number; protein_g: number; carbs_g: number; fat_g: number }
interface Totals   { kcal: number; protein: number; carbs: number; fat: number }
interface Data     { meals: MealRow[]; totals: Totals; dailyGoal: number }

function DonutChart({ segments }: { segments: { pct: number; color: string }[] }) {
  const r = 70, cx = 90, cy = 90, stroke = 22
  const circ = 2 * Math.PI * r
  let offset = 0
  const visible = segments.filter(s => s.pct > 0)
  return (
    <svg width={180} height={180} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0F0F0" strokeWidth={stroke}/>
      {visible.map((s, i) => {
        const dash = (s.pct / 100) * circ
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={stroke} strokeLinecap="butt"
            strokeDasharray={`${dash} ${circ}`} strokeDashoffset={-offset}/>
        )
        offset += dash
        return el
      })}
    </svg>
  )
}

function offsetDate(base: string, delta: number) {
  const d = new Date(base + 'T12:00:00')
  d.setDate(d.getDate() + delta)
  return d.toISOString().split('T')[0]
}

function labelDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  const today = new Date().toISOString().split('T')[0]
  const yest  = offsetDate(today, -1)
  if (dateStr === today) return 'Today'
  if (dateStr === yest)  return 'Yesterday'
  return d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function NutritionPage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [tab, setTab]       = useState<'calories' | 'nutrients' | 'macros'>('calories')
  const [date, setDate]     = useState(today)
  const [data, setData]     = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (d: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/nutrition?date=${d}`)
      if (res.ok) setData(await res.json())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData(date) }, [date, fetchData])

  function changeDate(delta: number) {
    const next = offsetDate(date, delta)
    if (next > today) return
    setDate(next)
  }

  const meals  = data?.meals  ?? []
  const totals = data?.totals ?? { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  const goal   = data?.dailyGoal ?? 2000

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']
  const byType = mealTypes.map(t => {
    const kcal = meals.filter(m => m.meal_type === t).reduce((s, m) => s + m.total_kcal, 0)
    return { name: t.charAt(0).toUpperCase() + t.slice(1), kcal, color: MEAL_COLORS[t], pct: totals.kcal > 0 ? Math.round(kcal / totals.kcal * 100) : 0 }
  })

  const macroTotal = totals.protein + totals.carbs + totals.fat || 1
  const macros = [
    { label: 'Carbs',   eaten: Math.round(totals.carbs),   goal: Math.round(goal * 0.5 / 4),  color: '#4CAF50',  goalPct: 50 },
    { label: 'Fat',     eaten: Math.round(totals.fat),     goal: Math.round(goal * 0.3 / 9),  color: '#AB47BC',  goalPct: 30 },
    { label: 'Protein', eaten: Math.round(totals.protein), goal: Math.round(goal * 0.2 / 4),  color: '#FFA726',  goalPct: 20 },
  ]

  return (
    <div className="page-bottom" style={{ background: '#FAFAF7' }}>
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D1A', margin: 0, flex: 1 }}>Nutrition</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E8E8E8', margin: '16px 0 0' }}>
        {(['calories', 'nutrients', 'macros'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: tab === t ? 700 : 500,
            color: tab === t ? '#4CAF50' : '#6B7168', fontFamily: 'inherit',
            borderBottom: tab === t ? '2px solid #4CAF50' : '2px solid transparent',
            textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>

      {/* Day selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '12px 16px', borderBottom: '1px solid #F0F0F0' }}>
        <button onClick={() => changeDate(-1)} style={{ background: 'none', border: 'none', fontSize: 18, color: '#6B7168', cursor: 'pointer' }}>‹</button>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1D1A', minWidth: 120, textAlign: 'center' }}>{labelDate(date)}</span>
        <button onClick={() => changeDate(1)} disabled={date === today} style={{ background: 'none', border: 'none', fontSize: 18, color: date === today ? '#D0D0D0' : '#6B7168', cursor: date === today ? 'default' : 'pointer' }}>›</button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#6B7168', fontSize: 14 }}>Loading…</div>
      ) : (
        <>
          {tab === 'calories' && (
            <div style={{ padding: '20px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 24 }}>
                <DonutChart segments={byType.map(m => ({ pct: m.pct, color: m.color }))}/>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#1A1D1A' }}>{Math.round(totals.kcal)}</div>
                  <div style={{ fontSize: 11, color: '#6B7168' }}>cal eaten</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {byType.map(m => (
                  <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: m.color, flexShrink: 0 }}/>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1D1A' }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: '#6B7168' }}>{m.pct}% ({m.kcal} cal)</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: '16px' }}>
                {[
                  { label: 'Calories Eaten', value: Math.round(totals.kcal) },
                  { label: 'Remaining',      value: Math.max(0, goal - Math.round(totals.kcal)) },
                  { label: 'Daily Goal',     value: goal },
                ].map((row, i, arr) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid #F5F5F0' : 'none' }}>
                    <span style={{ fontSize: 14, color: '#1A1D1A' }}>{row.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: row.label === 'Daily Goal' ? '#4CAF50' : '#1A1D1A' }}>{row.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'nutrients' && (
            <div style={{ padding: '16px' }}>
              <div className="card" style={{ padding: '0 16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
                  {['', 'Total', 'Goal', 'Left'].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textAlign: h === '' ? 'left' : 'right' }}>{h}</div>
                  ))}
                </div>
                {[
                  { name: 'Protein',       eaten: Math.round(totals.protein), goal: macros[2].goal, unit: 'g' },
                  { name: 'Carbohydrates', eaten: Math.round(totals.carbs),   goal: macros[0].goal, unit: 'g' },
                  { name: 'Fat',           eaten: Math.round(totals.fat),     goal: macros[1].goal, unit: 'g' },
                ].map((n, i, arr) => {
                  const left = n.goal - n.eaten
                  return (
                    <div key={n.name} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, padding: '13px 0', borderBottom: i < arr.length - 1 ? '1px solid #F5F5F0' : 'none', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: '#1A1D1A' }}>{n.name}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1D1A', textAlign: 'right', minWidth: 40 }}>{n.eaten}{n.unit}</span>
                      <span style={{ fontSize: 14, color: '#6B7168', textAlign: 'right', minWidth: 40 }}>{n.goal}{n.unit}</span>
                      <span style={{ fontSize: 14, color: left >= 0 ? '#4CAF50' : '#F44336', fontWeight: 600, textAlign: 'right', minWidth: 40 }}>{left > 0 ? `+${left}` : left}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === 'macros' && (
            <div style={{ padding: '20px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 20 }}>
                <DonutChart segments={[
                  { pct: Math.round(totals.carbs   / macroTotal * 100), color: '#4CAF50' },
                  { pct: Math.round(totals.fat     / macroTotal * 100), color: '#AB47BC' },
                  { pct: Math.round(totals.protein / macroTotal * 100), color: '#FFA726' },
                ]}/>
              </div>
              <div className="card" style={{ padding: '0 16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
                  {['', 'Total', 'Goal'].map(h => <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textAlign: h === '' ? 'left' : 'right' }}>{h}</div>)}
                </div>
                {macros.map((m, i, arr) => {
                  const pct = Math.round(m.eaten / (macroTotal) * 100)
                  return (
                    <div key={m.label} style={{ padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid #F5F5F0' : 'none' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: m.color }}/>
                          <span style={{ fontSize: 14, color: '#1A1D1A' }}>{m.label} ({m.eaten}g)</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1D1A', textAlign: 'right' }}>{pct}%</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#4CAF50', textAlign: 'right' }}>{m.goalPct}%</span>
                      </div>
                      <div style={{ height: 6, background: '#F0F0F0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: m.color, borderRadius: 4 }}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}


    </div>
  )
}
