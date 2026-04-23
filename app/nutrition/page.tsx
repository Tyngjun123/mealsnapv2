'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav'

const MOCK = {
  calories: { eaten: 1240, goal: 2000, burned: 0 },
  macros: { protein: { eaten: 62, goal: 150 }, carbs: { eaten: 148, goal: 250 }, fat: { eaten: 38, goal: 67 } },
  nutrients: [
    { name: 'Protein',         eaten: 62,  goal: 150, unit: 'g'  },
    { name: 'Carbohydrates',   eaten: 148, goal: 250, unit: 'g'  },
    { name: 'Fiber',           eaten: 8,   goal: 30,  unit: 'g'  },
    { name: 'Sugar',           eaten: 42,  goal: 50,  unit: 'g'  },
    { name: 'Fat',             eaten: 38,  goal: 67,  unit: 'g'  },
    { name: 'Saturated Fat',   eaten: 10,  goal: 22,  unit: 'g'  },
    { name: 'Sodium',          eaten: 980, goal: 2300, unit: 'mg' },
    { name: 'Potassium',       eaten: 620, goal: 3500, unit: 'mg' },
    { name: 'Cholesterol',     eaten: 88,  goal: 300, unit: 'mg' },
  ],
  meals: [
    { name: 'Breakfast', kcal: 420, color: '#F9A825', pct: 34 },
    { name: 'Lunch',     kcal: 580, color: '#4CAF50', pct: 47 },
    { name: 'Dinner',    kcal: 0,   color: '#1565C0', pct: 0  },
    { name: 'Snack',     kcal: 240, color: '#FF7043', pct: 19 },
  ],
}

function DonutChart({ segments }: { segments: { pct: number; color: string }[] }) {
  const r = 70, cx = 90, cy = 90, stroke = 22
  const circ = 2 * Math.PI * r
  let offset = 0
  return (
    <svg width={180} height={180} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0F0F0" strokeWidth={stroke}/>
      {segments.filter(s => s.pct > 0).map((s, i) => {
        const dash = (s.pct / 100) * circ
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={stroke} strokeLinecap="butt"
            strokeDasharray={`${dash} ${circ}`}
            strokeDashoffset={-offset}/>
        )
        offset += dash
        return el
      })}
    </svg>
  )
}

function MacroDonut({ p, c, f }: { p: number; c: number; f: number }) {
  const total = p + c + f || 1
  return <DonutChart segments={[
    { pct: Math.round(c / total * 100), color: '#4CAF50' },
    { pct: Math.round(f / total * 100), color: '#AB47BC' },
    { pct: Math.round(p / total * 100), color: '#FFA726' },
  ]}/>
}

export default function NutritionPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'calories' | 'nutrients' | 'macros'>('calories')

  return (
    <div className="page-bottom" style={{ background: '#FAFAF7' }}>
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D1A', margin: 0, flex: 1 }}>Nutrition</h1>
        <button style={{ fontSize: 13, fontWeight: 700, color: '#4CAF50', background: 'none', border: 'none', cursor: 'pointer' }}>Export</button>
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
        <button style={{ background: 'none', border: 'none', fontSize: 18, color: '#6B7168', cursor: 'pointer' }}>‹</button>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1D1A' }}>Today</span>
        <button style={{ background: 'none', border: 'none', fontSize: 18, color: '#6B7168', cursor: 'pointer' }}>›</button>
      </div>

      {tab === 'calories' && (
        <div style={{ padding: '20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 24 }}>
            <DonutChart segments={MOCK.meals.map(m => ({ pct: m.pct, color: m.color }))}/>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#1A1D1A' }}>{MOCK.calories.eaten}</div>
              <div style={{ fontSize: 11, color: '#6B7168' }}>cal eaten</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {MOCK.meals.map(m => (
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
              { label: 'Total Calories', value: MOCK.calories.eaten },
              { label: 'Exercise Calories', value: MOCK.calories.burned },
              { label: 'Net Calories', value: MOCK.calories.eaten - MOCK.calories.burned },
              { label: 'Goal', value: MOCK.calories.goal },
            ].map((row, i, arr) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid #F5F5F0' : 'none' }}>
                <span style={{ fontSize: 14, color: '#1A1D1A' }}>{row.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: row.label === 'Goal' ? '#4CAF50' : '#1A1D1A' }}>{row.value.toLocaleString()}</span>
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
            {MOCK.nutrients.map((n, i) => {
              const left = n.goal - n.eaten
              return (
                <div key={n.name} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, padding: '13px 0', borderBottom: i < MOCK.nutrients.length - 1 ? '1px solid #F5F5F0' : 'none', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: '#1A1D1A' }}>{n.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1D1A', textAlign: 'right', minWidth: 40 }}>{n.eaten}</span>
                  <span style={{ fontSize: 14, color: '#6B7168', textAlign: 'right', minWidth: 40 }}>{n.goal}</span>
                  <span style={{ fontSize: 14, color: left >= 0 ? '#4CAF50' : '#F44336', fontWeight: 600, textAlign: 'right', minWidth: 40 }}>{left > 0 ? left : left} ›</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'macros' && (
        <div style={{ padding: '20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 20 }}>
            <MacroDonut p={MOCK.macros.protein.eaten} c={MOCK.macros.carbs.eaten} f={MOCK.macros.fat.eaten}/>
          </div>
          <div className="card" style={{ padding: '0 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
              {['', 'Total', 'Goal'].map(h => <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textAlign: h === '' ? 'left' : 'right' }}>{h}</div>)}
            </div>
            {[
              { label: 'Carbohydrates', eaten: MOCK.macros.carbs.eaten, goal: MOCK.macros.carbs.goal, color: '#4CAF50', goalPct: 50 },
              { label: 'Fat',           eaten: MOCK.macros.fat.eaten,   goal: MOCK.macros.fat.goal,   color: '#AB47BC', goalPct: 30 },
              { label: 'Protein',       eaten: MOCK.macros.protein.eaten, goal: MOCK.macros.protein.goal, color: '#FFA726', goalPct: 20 },
            ].map((m, i, arr) => {
              const total = MOCK.macros.protein.eaten + MOCK.macros.carbs.eaten + MOCK.macros.fat.eaten || 1
              const pct = Math.round(m.eaten / total * 100)
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
                    <div style={{ height: '100%', width: `${pct}%`, background: m.color, borderRadius: 4 }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <BottomNav/>
    </div>
  )
}
