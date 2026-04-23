'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UnitsPage() {
  const router = useRouter()
  const [weight, setWeight]   = useState<'kg' | 'lbs'>('kg')
  const [height, setHeight]   = useState<'cm' | 'ft'>('cm')
  const [energy, setEnergy]   = useState<'kcal' | 'kJ'>('kcal')
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('unitPrefs') ?? '{}')
      if (u.weight) setWeight(u.weight)
      if (u.height) setHeight(u.height)
      if (u.energy) setEnergy(u.energy)
    } catch {}
  }, [])

  function save() {
    localStorage.setItem('unitPrefs', JSON.stringify({ weight, height, energy }))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7' }}>
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D1A', margin: 0 }}>Units</h1>
      </div>

      <div style={{ padding: '0 16px' }}>
        <Section title="Weight">
          <SegmentedControl options={['kg', 'lbs']} value={weight} onChange={v => setWeight(v as 'kg' | 'lbs')}/>
        </Section>

        <Section title="Height">
          <SegmentedControl options={['cm', 'ft']} value={height} onChange={v => setHeight(v as 'cm' | 'ft')}/>
        </Section>

        <Section title="Energy">
          <SegmentedControl options={['kcal', 'kJ']} value={energy} onChange={v => setEnergy(v as 'kcal' | 'kJ')}/>
        </Section>

        <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={save}>
          {saved ? '✓ Saved!' : 'Save Units'}
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>{title}</div>
      <div className="card" style={{ padding: 16 }}>{children}</div>
    </div>
  )
}

function SegmentedControl({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} style={{
          flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: value === o ? '#4CAF50' : '#F5F5F0',
          color: value === o ? '#fff' : '#1A1D1A',
          fontFamily: 'inherit', fontWeight: 700, fontSize: 15,
          boxShadow: value === o ? '0 4px 12px rgba(76,175,80,0.3)' : 'none',
          transition: 'all 0.15s',
        }}>{o}</button>
      ))}
    </div>
  )
}
