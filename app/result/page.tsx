'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DetectedFood } from '@/lib/claude'

interface ResultData {
  imageUrl: string | null
  foods: DetectedFood[]
  mealType: string
}

export default function ResultPage() {
  const router = useRouter()
  const [data, setData] = useState<ResultData | null>(null)
  const [foods, setFoods] = useState<DetectedFood[]>([])
  const [mealType, setMealType] = useState('dinner')
  const [saving, setSaving] = useState(false)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [correction, setCorrection] = useState('')
  const [correcting, setCorrecting] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('analyzeResult')
    if (!raw) { router.push('/camera'); return }
    const parsed = JSON.parse(raw) as ResultData
    setData(parsed)
    setFoods(parsed.foods)
    setMealType(parsed.mealType ?? 'dinner')
  }, [router])

  const totalKcal = foods.reduce((s, f) => s + f.calories_kcal, 0)
  const totalProtein = foods.reduce((s, f) => s + f.protein_g, 0)
  const totalCarbs = foods.reduce((s, f) => s + f.carbs_g, 0)
  const totalFat = foods.reduce((s, f) => s + f.fat_g, 0)

  const handleSave = async () => {
    if (!data) return
    setSaving(true)
    try {
      await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType,
          imageUrl: data.imageUrl,
          totalKcal,
          foodItems: foods.map(f => ({
            name: f.name,
            amountG: f.estimated_amount_g,
            kcal: f.calories_kcal,
            proteinG: f.protein_g,
            carbsG: f.carbs_g,
            fatG: f.fat_g,
          })),
        }),
      })
      sessionStorage.removeItem('analyzeResult')
      router.push('/')
    } finally {
      setSaving(false)
    }
  }

  const handleCorrect = async () => {
    if (!correction.trim() || correcting) return
    setCorrecting(true)
    try {
      const res = await fetch('/api/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foods, correction: correction.trim() }),
      })
      if (res.status === 429) { alert('AI busy — wait 1 minute and try again.'); return }
      if (!res.ok) { alert('Could not apply correction. Try again.'); return }
      const updated = await res.json()
      setFoods(updated.foods)
      setCorrection('')
    } finally {
      setCorrecting(false)
    }
  }

  const updateFood = (idx: number, field: keyof DetectedFood, value: string | number) => {
    setFoods(prev => prev.map((f, i) => i === idx ? { ...f, [field]: value } : f))
  }

  if (!data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF7' }}>
      <div style={{ fontSize: 14, color: '#6B7168' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', paddingBottom: 'max(120px, calc(env(safe-area-inset-bottom) + 100px))' }}>
      {/* Header */}
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.push('/camera')} style={{
          width: 36, height: 36, borderRadius: '50%', border: 'none',
          background: '#fff', cursor: 'pointer', fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D1A', margin: 0 }}>AI Recognition</h1>
      </div>

      {/* Photo */}
      {data.imageUrl && (
        <div style={{ margin: '0 16px 16px', borderRadius: 20, overflow: 'hidden', height: 180 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.imageUrl} alt="meal" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        </div>
      )}

      {/* AI Correction */}
      <div className="card" style={{ margin: '0 16px 12px', padding: '16px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D1A', marginBottom: 4 }}>
          ✏️ Correct the AI
        </div>
        <div style={{ fontSize: 12, color: '#6B7168', marginBottom: 10 }}>
          e.g. "no pearls and beans", "add extra cheese", "it's a mango latte"
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={correction}
            onChange={e => setCorrection(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCorrect()}
            placeholder="Describe what to change..."
            style={{
              flex: 1, border: '1.5px solid #E0E0E0', borderRadius: 12,
              padding: '10px 12px', fontSize: 13, fontFamily: 'inherit',
              outline: 'none', background: '#FAFAF7', color: '#1A1D1A',
            }}
            onFocus={e => (e.target.style.borderColor = '#4CAF50')}
            onBlur={e => (e.target.style.borderColor = '#E0E0E0')}
          />
          <button
            onClick={handleCorrect}
            disabled={!correction.trim() || correcting}
            style={{
              padding: '10px 16px', borderRadius: 12, border: 'none',
              background: !correction.trim() || correcting ? '#E0E0E0' : '#4CAF50',
              color: !correction.trim() || correcting ? '#9E9E9E' : '#fff',
              fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
              cursor: !correction.trim() || correcting ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}>
            {correcting ? '...' : '↻ Update'}
          </button>
        </div>
      </div>

      {/* Meal type selector */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8 }}>
        {['breakfast', 'lunch', 'dinner', 'snack'].map(t => (
          <button key={t} onClick={() => setMealType(t)} style={{
            padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: mealType === t ? '#4CAF50' : '#F0F0EC',
            color: mealType === t ? '#fff' : '#6B7168',
            fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            textTransform: 'capitalize', transition: 'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {/* Food items */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7168', marginBottom: 4 }}>
          {foods.length} items detected — tap to edit
        </div>
        {foods.map((food, idx) => (
          <div key={idx} className="card" style={{ padding: '14px 16px' }}>
            {editingIdx === idx ? (
              // Edit mode
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input value={food.name} onChange={e => updateFood(idx, 'name', e.target.value)}
                  style={{ border: '1.5px solid #4CAF50', borderRadius: 10, padding: '8px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}/>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                  {([
                    ['kcal', 'calories_kcal'],
                    ['g', 'estimated_amount_g'],
                    ['pro', 'protein_g'],
                    ['fat', 'fat_g'],
                  ] as [string, keyof DetectedFood][]).map(([label, key]) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, color: '#6B7168', fontWeight: 600, marginBottom: 3 }}>{label}</div>
                      <input type="number" value={food[key] as number}
                        onChange={e => updateFood(idx, key, parseFloat(e.target.value) || 0)}
                        style={{ width: '100%', border: '1px solid #E0E0E0', borderRadius: 8, padding: '6px 8px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}/>
                    </div>
                  ))}
                </div>
                <button onClick={() => setEditingIdx(null)} style={{
                  background: '#4CAF50', color: '#fff', border: 'none',
                  borderRadius: 10, padding: '8px', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                }}>Done</button>
              </div>
            ) : (
              // View mode
              <button onClick={() => setEditingIdx(idx)} style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1D1A' }}>{food.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7168', marginTop: 3 }}>
                      {food.estimated_amount_g}g · P:{food.protein_g}g C:{food.carbs_g}g F:{food.fat_g}g
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 16, fontWeight: 800, color: '#1A1D1A',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {food.calories_kcal}
                      <span style={{ fontSize: 10, fontWeight: 500, color: '#6B7168' }}> kcal</span>
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      padding: '2px 6px', borderRadius: 6,
                      background: food.confidence === 'high' ? '#E8F5E9' : food.confidence === 'medium' ? '#FFF8E1' : '#FFEBEE',
                      color: food.confidence === 'high' ? '#2E7D32' : food.confidence === 'medium' ? '#F57F17' : '#C62828',
                    }}>
                      {food.confidence}
                    </span>
                  </div>
                </div>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Total summary */}
      <div className="card" style={{ margin: '16px 16px 0', padding: '16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7168', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Calories', value: `${totalKcal}`, unit: 'kcal', big: true },
            { label: 'Protein', value: `${Math.round(totalProtein)}`, unit: 'g', big: false },
            { label: 'Carbs', value: `${Math.round(totalCarbs)}`, unit: 'g', big: false },
            { label: 'Fat', value: `${Math.round(totalFat)}`, unit: 'g', big: false },
          ].map(item => (
            <div key={item.label} style={{
              background: '#F5F5F0', borderRadius: 12, padding: '10px 12px', textAlign: 'center',
            }}>
              <div style={{ fontSize: item.big ? 22 : 18, fontWeight: 800, color: '#1A1D1A', fontVariantNumeric: 'tabular-nums' }}>
                {item.value}
              </div>
              <div style={{ fontSize: 10, color: '#6B7168', fontWeight: 600 }}>{item.unit}</div>
              <div style={{ fontSize: 10, color: '#6B7168' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm button */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 448, padding: '16px 16px', paddingBottom: 'max(32px, calc(env(safe-area-inset-bottom) + 16px))', background: 'rgba(250,250,247,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ width: '100%', fontSize: 16, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : '✓ Confirm & Save Meal'}
        </button>
      </div>
    </div>
  )
}
