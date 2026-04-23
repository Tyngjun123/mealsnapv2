'use client'
import Image from 'next/image'
import { useState } from 'react'

const MEAL_META: Record<string, { emoji: string; label: string; bg: string; color: string }> = {
  breakfast: { emoji: '🌅', label: 'Breakfast', bg: '#FFF8E1', color: '#F9A825' },
  lunch:     { emoji: '☀️',  label: 'Lunch',     bg: '#E8F5E9', color: '#388E3C' },
  dinner:    { emoji: '🌙', label: 'Dinner',    bg: '#E3F2FD', color: '#1565C0' },
  snack:     { emoji: '🍎', label: 'Snack',     bg: '#FBE9E7', color: '#BF360C' },
}

interface FoodItem {
  name: string
  kcal: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  amount_g?: number
}

interface Props {
  id: string
  mealType: string
  time: string
  totalKcal: number
  imageUrl?: string | null
  foodItems: FoodItem[]
  onDelete?: (id: string) => void
}

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0)
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#6B7168', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1D1A' }}>{Math.round(value)}g</span>
      </div>
      <div style={{ height: 6, background: '#F0F0F0', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.4s ease' }}/>
      </div>
    </div>
  )
}

export function MealCard({ id, mealType, time, totalKcal, imageUrl, foodItems, onDelete }: Props) {
  const meta = MEAL_META[mealType] ?? MEAL_META.snack
  const [showDetail, setShowDetail] = useState(false)

  const totalProtein = foodItems.reduce((s, f) => s + (f.protein_g ?? 0), 0)
  const totalCarbs   = foodItems.reduce((s, f) => s + (f.carbs_g   ?? 0), 0)
  const totalFat     = foodItems.reduce((s, f) => s + (f.fat_g     ?? 0), 0)
  const hasMacros = totalProtein > 0 || totalCarbs > 0 || totalFat > 0

  return (
    <>
      <div
        className="card"
        onClick={() => setShowDetail(true)}
        style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 14, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {meta.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: meta.color }}>{meta.label}</div>
              <div style={{ fontSize: 12, color: '#6B7168', marginTop: 1 }}>{time}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#1A1D1A', fontVariantNumeric: 'tabular-nums' }}>
                {totalKcal} <span style={{ fontSize: 11, fontWeight: 500, color: '#6B7168' }}>kcal</span>
              </span>
              {onDelete && (
                <button onClick={e => { e.stopPropagation(); onDelete(id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 4, borderRadius: 8, fontSize: 16, lineHeight: 1 }}>×</button>
              )}
            </div>
          </div>

          {hasMacros && (
            <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
              {[
                { label: 'P', value: Math.round(totalProtein), color: '#FFA726' },
                { label: 'C', value: Math.round(totalCarbs),   color: '#4CAF50' },
                { label: 'F', value: Math.round(totalFat),     color: '#AB47BC' },
              ].map(m => (
                <span key={m.label} style={{ fontSize: 11, color: '#6B7168', background: '#F5F5F0', borderRadius: 6, padding: '2px 7px' }}>
                  <span style={{ fontWeight: 700, color: m.color }}>{m.label}</span> {m.value}g
                </span>
              ))}
            </div>
          )}

          {!hasMacros && (
            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {foodItems.slice(0, 3).map((f, i) => (
                <span key={i} style={{ fontSize: 11, color: '#6B7168', background: '#F5F5F0', borderRadius: 6, padding: '2px 7px' }}>{f.name}</span>
              ))}
              {foodItems.length > 3 && <span style={{ fontSize: 11, color: '#6B7168' }}>+{foodItems.length - 3} more</span>}
            </div>
          )}
        </div>

        {imageUrl && (
          <div style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
            <Image src={imageUrl} alt="meal" width={52} height={52} style={{ objectFit: 'cover', width: '100%', height: '100%' }}/>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {showDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowDetail(false)}>
          <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 448, margin: '0 auto', padding: '20px 20px max(32px, calc(env(safe-area-inset-bottom) + 20px))', maxHeight: '80dvh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{meta.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1D1A' }}>{meta.label}</div>
                <div style={{ fontSize: 12, color: '#6B7168' }}>{time} · {totalKcal} kcal total</div>
              </div>
              <button onClick={() => setShowDetail(false)} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#F5F5F0', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            {/* Macro summary */}
            {hasMacros && (
              <div style={{ background: '#FAFAF7', borderRadius: 16, padding: '16px', marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>Macros</div>
                <MacroBar label="Protein" value={totalProtein} max={150} color="#FFA726"/>
                <MacroBar label="Carbs"   value={totalCarbs}   max={250} color="#4CAF50"/>
                <MacroBar label="Fat"     value={totalFat}     max={67}  color="#AB47BC"/>
              </div>
            )}

            {/* Food items */}
            {foodItems.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>Items</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {foodItems.map((f, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < foodItems.length - 1 ? '1px solid #F5F5F0' : 'none' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1D1A' }}>{f.name}</div>
                        {f.amount_g ? <div style={{ fontSize: 11, color: '#6B7168', marginTop: 1 }}>{Math.round(f.amount_g)}g</div> : null}
                        {(f.protein_g || f.carbs_g || f.fat_g) ? (
                          <div style={{ fontSize: 11, color: '#9E9E9E', marginTop: 2 }}>
                            P {Math.round(f.protein_g ?? 0)}g · C {Math.round(f.carbs_g ?? 0)}g · F {Math.round(f.fat_g ?? 0)}g
                          </div>
                        ) : null}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1A' }}>{f.kcal} kcal</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
