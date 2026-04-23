'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav'

const MOCK_WEIGHTS = [
  { date: '2026-03-23', kg: 74.2 },
  { date: '2026-03-30', kg: 73.8 },
  { date: '2026-04-06', kg: 73.5 },
  { date: '2026-04-13', kg: 73.1 },
  { date: '2026-04-17', kg: 72.0 },
  { date: '2026-04-20', kg: 72.4 },
  { date: '2026-04-23', kg: 72.0 },
]

const GOAL_WEIGHT = 68

function WeightChart({ weights, goal }: { weights: typeof MOCK_WEIGHTS; goal: number }) {
  const W = 340, H = 160, PAD = { t: 16, b: 32, l: 36, r: 16 }
  const vals = weights.map(w => w.kg)
  const min = Math.min(...vals, goal) - 1
  const max = Math.max(...vals) + 1
  const range = max - min
  const cw = W - PAD.l - PAD.r
  const ch = H - PAD.t - PAD.b

  const x = (i: number) => PAD.l + (i / (weights.length - 1)) * cw
  const y = (v: number) => PAD.t + ch - ((v - min) / range) * ch

  const path = weights.map((w, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(w.kg)}`).join(' ')
  const goalY = y(goal)

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      {/* Goal line */}
      <line x1={PAD.l} y1={goalY} x2={W - PAD.r} y2={goalY} stroke="#4CAF50" strokeWidth={1.5} strokeDasharray="4 3"/>

      {/* Y axis labels */}
      {[min + 1, (min + max) / 2, max - 1].map((v, i) => (
        <text key={i} x={PAD.l - 6} y={y(v) + 4} textAnchor="end" fontSize={9} fill="#6B7168">{Math.round(v)}</text>
      ))}

      {/* Area fill */}
      <path d={`${path} L ${x(weights.length - 1)} ${H - PAD.b} L ${x(0)} ${H - PAD.b} Z`}
        fill="url(#wGrad)" opacity={0.3}/>
      <defs>
        <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4CAF50"/>
          <stop offset="100%" stopColor="#4CAF50" stopOpacity={0}/>
        </linearGradient>
      </defs>

      {/* Line */}
      <path d={path} fill="none" stroke="#4CAF50" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>

      {/* Dots */}
      {weights.map((w, i) => (
        <circle key={i} cx={x(i)} cy={y(w.kg)} r={4} fill="#4CAF50" stroke="#fff" strokeWidth={2}/>
      ))}

      {/* X axis labels */}
      {weights.filter((_, i) => i % 2 === 0).map((w, i) => {
        const idx = i * 2
        return (
          <text key={idx} x={x(idx)} y={H - 4} textAnchor="middle" fontSize={9} fill="#6B7168">
            {new Date(w.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </text>
        )
      })}
    </svg>
  )
}

export default function ProgressPage() {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [newWeight, setNewWeight] = useState('')

  const latest = MOCK_WEIGHTS[MOCK_WEIGHTS.length - 1].kg
  const first = MOCK_WEIGHTS[0].kg
  const lost = (first - latest).toFixed(1)
  const toGo = (latest - GOAL_WEIGHT).toFixed(1)

  return (
    <div className="page-bottom" style={{ background: '#FAFAF7' }}>
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D1A', margin: 0, flex: 1 }}>Progress</h1>
        <button onClick={() => setShowAdd(true)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#4CAF50', color: '#fff', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(76,175,80,0.3)' }}>+</button>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Current',   value: `${latest}`, unit: 'kg',    color: '#4CAF50' },
            { label: 'Lost',      value: `-${lost}`,  unit: 'kg',    color: '#FF7043' },
            { label: 'To Goal',   value: `${toGo}`,   unit: 'kg left', color: '#1565C0' },
          ].map(c => (
            <div key={c.label} className="card" style={{ padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{c.value}</div>
              <div style={{ fontSize: 10, color: '#6B7168', fontWeight: 600 }}>{c.unit}</div>
              <div style={{ fontSize: 10, color: '#6B7168', marginTop: 2 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Weight chart */}
        <div className="card" style={{ padding: '16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1A' }}>Weight</div>
            <div style={{ fontSize: 11, color: '#6B7168' }}>Last 30 days</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <div style={{ width: 16, height: 2, background: '#4CAF50', borderRadius: 1 }}/>
            <span style={{ fontSize: 11, color: '#6B7168' }}>Goal: {GOAL_WEIGHT} kg</span>
          </div>
          <WeightChart weights={MOCK_WEIGHTS} goal={GOAL_WEIGHT}/>
        </div>

        {/* Log entries */}
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1A', marginBottom: 10 }}>Entries</div>
        <div className="card" style={{ padding: '0 16px' }}>
          {[...MOCK_WEIGHTS].reverse().map((w, i, arr) => (
            <div key={w.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid #F5F5F0' : 'none' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1D1A' }}>
                  {new Date(w.date).toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div style={{ fontSize: 11, color: '#6B7168' }}>{new Date(w.date).toLocaleDateString('en', { weekday: 'long' })}</div>
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#4CAF50' }}>{w.kg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add weight modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowAdd(false)}>
          <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', padding: '24px 24px 40px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1D1A', marginBottom: 16 }}>Log Weight</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
              <input type="number" value={newWeight} onChange={e => setNewWeight(e.target.value)}
                placeholder="e.g. 71.5"
                style={{ flex: 1, border: '1.5px solid #E0E0E0', borderRadius: 14, padding: '14px 16px', fontSize: 18, fontWeight: 700, fontFamily: 'inherit', outline: 'none', textAlign: 'center' }}
                onFocus={e => (e.target.style.borderColor = '#4CAF50')}
                onBlur={e => (e.target.style.borderColor = '#E0E0E0')}
              />
              <span style={{ fontSize: 16, fontWeight: 700, color: '#6B7168' }}>kg</span>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowAdd(false)}>Save Entry</button>
          </div>
        </div>
      )}

      <BottomNav/>
    </div>
  )
}
