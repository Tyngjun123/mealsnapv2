'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  name: string
  email: string
  heightCm: number | null
  weightKg: number | null
  age: number | null
}

export function ProfileEditClient({ name: initName, email, heightCm, weightKg, age: initAge }: Props) {
  const router = useRouter()
  const [name, setName]     = useState(initName)
  const [height, setHeight] = useState(heightCm?.toString() ?? '')
  const [weight, setWeight] = useState(weightKg?.toString() ?? '')
  const [age, setAge]       = useState(initAge?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  async function handleSave() {
    setSaving(true)
    const newWeight = weight ? parseFloat(weight) : null
    await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:      name.trim() || initName,
        height_cm: height ? parseInt(height) : null,
        weight_kg: newWeight,
        age:       age ? parseInt(age) : null,
      }),
    })
    // If weight changed, also log it
    if (newWeight && newWeight !== weightKg) {
      await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_kg: newWeight }),
      })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => router.push('/profile'), 1200)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1.5px solid #E0E0E0', borderRadius: 12,
    padding: '12px 14px', fontSize: 15, fontFamily: 'inherit',
    outline: 'none', background: '#FAFAF7', color: '#1A1D1A',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#FAFAF7' }}>
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D1A', margin: 0 }}>Edit Profile</h1>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Name */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Display Name</div>
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="Your name" style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#4CAF50')}
            onBlur={e => (e.target.style.borderColor = '#E0E0E0')}
          />
        </div>

        {/* Email (read-only) */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Email</div>
          <div style={{ ...inputStyle, color: '#9E9E9E', background: '#F0F0EC' }}>{email}</div>
        </div>

        {/* Body stats */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Body Stats</div>
        <div className="card" style={{ padding: '0 16px', marginBottom: 20 }}>
          {[
            { label: 'Current Weight', value: weight, setter: setWeight, unit: 'kg', placeholder: '70', note: 'Updates your weight log' },
            { label: 'Height',         value: height, setter: setHeight, unit: 'cm', placeholder: '170', note: null },
            { label: 'Age',            value: age,    setter: setAge,    unit: 'yrs', placeholder: '25', note: null },
          ].map((f, i) => (
            <div key={f.label} style={{ padding: '14px 0', borderBottom: i < 2 ? '1px solid #F5F5F0' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 15, color: '#1A1D1A' }}>{f.label}</div>
                  {f.note && <div style={{ fontSize: 11, color: '#9E9E9E', marginTop: 2 }}>{f.note}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number" value={f.value} placeholder={f.placeholder}
                    onChange={e => f.setter(e.target.value)} inputMode="decimal"
                    style={{ width: 70, border: 'none', textAlign: 'right', fontSize: 16, fontWeight: 700, color: '#4CAF50', background: 'none', fontFamily: 'inherit', outline: 'none' }}
                  />
                  <span style={{ fontSize: 13, color: '#9E9E9E', minWidth: 28 }}>{f.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave} disabled={saving}
          className="btn-primary" style={{ width: '100%', fontSize: 15, opacity: saving ? 0.7 : 1 }}>
          {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
