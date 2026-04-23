'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function WeeklyReportPage() {
  const router = useRouter()
  const [enabled, setEnabled]   = useState(false)
  const [day, setDay]           = useState('monday')
  const [saved, setSaved]       = useState(false)

  const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('weeklyReport') ?? '{}')
      if (p.enabled !== undefined) setEnabled(p.enabled)
      if (p.day) setDay(p.day)
    } catch {}
  }, [])

  function save() {
    localStorage.setItem('weeklyReport', JSON.stringify({ enabled, day }))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7' }}>
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D1A', margin: 0 }}>Weekly Report</h1>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div className="card" style={{ padding: '0 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
            <div>
              <div style={{ fontSize: 15, color: '#1A1D1A' }}>Weekly Email Report</div>
              <div style={{ fontSize: 12, color: '#6B7168', marginTop: 2 }}>Summary of calories and macros</div>
            </div>
            <button onClick={() => setEnabled(!enabled)} style={{
              width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', padding: 0,
              background: enabled ? '#4CAF50' : '#E0E0E0', transition: 'background 0.2s', position: 'relative', flexShrink: 0,
            }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: enabled ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}/>
            </button>
          </div>
        </div>

        {enabled && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Send on</div>
            <div className="card" style={{ padding: '0 16px', marginBottom: 20 }}>
              {DAYS.map((d, i) => (
                <button key={d} onClick={() => setDay(d)} style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '13px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  borderBottom: i < DAYS.length - 1 ? '1px solid #F5F5F0' : 'none',
                }}>
                  <span style={{ fontSize: 15, color: '#1A1D1A', textTransform: 'capitalize' }}>{d}</span>
                  {day === d && <span style={{ color: '#4CAF50', fontSize: 16 }}>✓</span>}
                </button>
              ))}
            </div>
          </>
        )}

        <button className="btn-primary" style={{ width: '100%' }} onClick={save}>
          {saved ? '✓ Saved!' : 'Save Preferences'}
        </button>

        <div style={{ marginTop: 16, padding: 16, borderRadius: 14, background: '#E8F5E9', border: '1px solid #C8E6C9' }}>
          <div style={{ fontSize: 13, color: '#2E7D32', fontWeight: 500, lineHeight: 1.5 }}>
            Weekly reports are sent every Monday by default via the automated cron job. This preference will be respected in future updates.
          </div>
        </div>
      </div>
    </div>
  )
}
