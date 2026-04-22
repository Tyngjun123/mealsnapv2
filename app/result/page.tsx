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
  const [saving, setSaving] = useState(false)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('analyzeResult')
    if (!raw) { router.push('/camera'); return }
    const parsed = JSON.parse(raw) as ResultData
    setData(parsed)
    setFoods(parsed.foods)
  }, [router])

  const totalKcal = foods.reduce((s, f) => s + f.calories_kcal, 0)
  const totalProtein = foods.reduce((s, f) => s + f.protein_g, 0)
  const totalCarbs = foods.reduce((s, f) => s + f.carbs_g, 0)
  const totalFat = foods.reduce((s, f) => s + f.fat_g, 0)

  const handleSave = () => {
    if (!data) return
    setSaving(true)
    // Phase 1: save to localStorage directly
    // Phase 2: POST to /api/meals then localStorage
    const { addMeal } = require('@/lib/store')
    addMeal({
      mealType: data.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      eatenAt: new Date().toISOString(),
      imageUrl: data.imageUrl,
      totalKcal,
      foodItems: foods.map(f => ({
        id: crypto.randomUUID(),
        name: f.name,
        amountG: f.estimated_amount_g,
        kcal: f.calories_kcal,
        proteinG: f.protein_g,
        carbsG: f.carbs_g,
        fatG: f.fat_g,
      })),
    })
    sessionStorage.removeItem('analyzeResult')
    setSaving(false)
    router.push('/')
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
    <div style={{ minHeight: '100vh', background: '#FAFAF7', paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ padding: '52px 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
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

      {/* Meal type badge */}
      <div style={{ padding: '0 16px 12px' }}>
        <span style={{
          background: '#E8F5E9', color: '#2E7D32',
          padding: '4px 12px', borderRadius: 999,
          fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
        }}>
          {data.mealType}
        </span>
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
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 448, padding: '16px 16px 32px', background: '#FAFAF7', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ width: '100%', fontSize: 16, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : '✓ Confirm & Save Meal'}
        </button>
      </div>
    </div>
  )
}
