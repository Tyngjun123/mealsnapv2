'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'


interface WeightEntry { id: string; weight_kg: number; logged_at: string; notes: string | null }

function WeightChart({ weights, goal }: { weights: WeightEntry[]; goal: number | null }) {
  if (weights.length === 0) return (
    <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7168', fontSize: 13 }}>
      No entries yet — log your first weight above
    </div>
  )

  const W = 340, H = 160, PAD = { t: 16, b: 32, l: 36, r: 16 }
  const sorted = [...weights].sort((a, b) => a.logged_at.localeCompare(b.logged_at))
  const vals = sorted.map(w => w.weight_kg)
  const allVals = goal ? [...vals, goal] : vals
  const min = Math.min(...allVals) - 1
  const max = Math.max(...allVals) + 1
  const range = max - min
  const cw = W - PAD.l - PAD.r
  const ch = H - PAD.t - PAD.b

  const x = (i: number) => PAD.l + (i / Math.max(sorted.length - 1, 1)) * cw
  const y = (v: number) => PAD.t + ch - ((v - min) / range) * ch

  const path = sorted.map((w, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(w.weight_kg)}`).join(' ')
  const goalY = goal ? y(goal) : null

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      {goalY !== null && (
        <line x1={PAD.l} y1={goalY} x2={W - PAD.r} y2={goalY} stroke="#4CAF50" strokeWidth={1.5} strokeDasharray="4 3"/>
      )}

      {[min + 1, (min + max) / 2, max - 1].map((v, i) => (
        <text key={i} x={PAD.l - 6} y={y(v) + 4} textAnchor="end" fontSize={9} fill="#6B7168">{Math.round(v)}</text>
      ))}

      <path d={`${path} L ${x(sorted.length - 1)} ${H - PAD.b} L ${x(0)} ${H - PAD.b} Z`} fill="url(#wGrad)" opacity={0.3}/>
      <defs>
        <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4CAF50"/>
          <stop offset="100%" stopColor="#4CAF50" stopOpacity={0}/>
        </linearGradient>
      </defs>

      <path d={path} fill="none" stroke="#4CAF50" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>

      {sorted.map((w, i) => (
        <circle key={i} cx={x(i)} cy={y(w.weight_kg)} r={4} fill="#4CAF50" stroke="#fff" strokeWidth={2}/>
      ))}

      {sorted.filter((_, i) => i % Math.max(Math.floor(sorted.length / 4), 1) === 0).map((w, idx) => {
        const i = sorted.findIndex(s => s.id === w.id)
        return (
          <text key={w.id} x={x(i)} y={H - 4} textAnchor="middle" fontSize={9} fill="#6B7168">
            {new Date(w.logged_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </text>
        )
      })}
    </svg>
  )
}

interface Props {
  initialEntries: WeightEntry[]
  goalWeight: number | null
}

export function ProgressView({ initialEntries, goalWeight }: Props) {
  const router = useRouter()
  const [entries, setEntries]   = useState<WeightEntry[]>(initialEntries)
  const [showAdd, setShowAdd]   = useState(false)
  const [newWeight, setNewWeight] = useState('')
  const [saving, setSaving]     = useState(false)

  const sorted = [...entries].sort((a, b) => a.logged_at.localeCompare(b.logged_at))
  const latest = sorted.length > 0 ? sorted[sorted.length - 1].weight_kg : null
  const first  = sorted.length > 0 ? sorted[0].weight_kg : null
  const lost   = (first !== null && latest !== null) ? (first - latest).toFixed(1) : '–'
  const toGo   = (latest !== null && goalWeight !== null) ? (latest - goalWeight).toFixed(1) : '–'

  async function handleAdd() {
    const kg = parseFloat(newWeight)
    if (!kg) return
    setSaving(true)
    const res = await fetch('/api/weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight_kg: kg }),
    })
    if (res.ok) {
      const log: WeightEntry = await res.json()
      setEntries(prev => [log, ...prev])
      setNewWeight('')
      setShowAdd(false)
      router.refresh()
    }
    setSaving(false)
  }

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
            { label: 'Current', value: latest ? `${latest}` : '–', unit: 'kg',      color: '#4CAF50' },
            { label: 'Lost',    value: first !== null && latest !== null ? (parseFloat(lost) > 0 ? `-${lost}` : `+${Math.abs(parseFloat(lost))}`) : '–', unit: 'kg', color: '#FF7043' },
            { label: 'To Goal', value: toGo,  unit: 'kg left', color: '#1565C0' },
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
            <div style={{ fontSize: 11, color: '#6B7168' }}>Last 60 days</div>
          </div>
          {goalWeight && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <div style={{ width: 16, height: 2, background: '#4CAF50', borderRadius: 1 }}/>
              <span style={{ fontSize: 11, color: '#6B7168' }}>Goal: {goalWeight} kg</span>
            </div>
          )}
          <WeightChart weights={sorted} goal={goalWeight}/>
        </div>

        {/* Log entries */}
        {entries.length > 0 && (
          <>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1A', marginBottom: 10 }}>Entries</div>
            <div className="card" style={{ padding: '0 16px' }}>
              {[...entries].sort((a, b) => b.logged_at.localeCompare(a.logged_at)).map((w, i, arr) => (
                <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid #F5F5F0' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1D1A' }}>
                      {new Date(w.logged_at).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 11, color: '#6B7168' }}>
                      {new Date(w.logged_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#4CAF50' }}>{w.weight_kg} kg</span>
                </div>
              ))}
            </div>
          </>
        )}
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
            <button className="btn-primary" style={{ width: '100%' }} onClick={handleAdd} disabled={saving}>
              {saving ? 'Saving…' : 'Save Entry'}
            </button>
          </div>
        </div>
      )}


    </div>
  )
}
