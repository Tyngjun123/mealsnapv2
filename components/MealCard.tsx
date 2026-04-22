'use client'
import Image from 'next/image'

const MEAL_META: Record<string, { emoji: string; label: string; bg: string; color: string }> = {
  breakfast: { emoji: '🌅', label: 'Breakfast', bg: '#FFF8E1', color: '#F9A825' },
  lunch:     { emoji: '☀️',  label: 'Lunch',     bg: '#E8F5E9', color: '#388E3C' },
  dinner:    { emoji: '🌙', label: 'Dinner',    bg: '#E3F2FD', color: '#1565C0' },
  snack:     { emoji: '🍎', label: 'Snack',     bg: '#FBE9E7', color: '#BF360C' },
}

interface FoodItem { name: string; kcal: number }
interface Props {
  id: string
  mealType: string
  time: string
  totalKcal: number
  imageUrl?: string | null
  foodItems: FoodItem[]
  onDelete?: (id: string) => void
}

export function MealCard({ id, mealType, time, totalKcal, imageUrl, foodItems, onDelete }: Props) {
  const meta = MEAL_META[mealType] ?? MEAL_META.snack

  return (
    <div className="card" style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: meta.bg, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>
        {meta.emoji}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: meta.color }}>{meta.label}</div>
            <div style={{ fontSize: 12, color: '#6B7168', marginTop: 1 }}>{time}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 16, fontWeight: 800, color: '#1A1D1A',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {totalKcal} <span style={{ fontSize: 11, fontWeight: 500, color: '#6B7168' }}>kcal</span>
            </span>
            {onDelete && (
              <button onClick={() => onDelete(id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#ccc', padding: 4, borderRadius: 8,
                fontSize: 16, lineHeight: 1,
              }} title="Delete">×</button>
            )}
          </div>
        </div>

        {/* Food items list */}
        <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {foodItems.slice(0, 3).map((f, i) => (
            <span key={i} style={{
              fontSize: 11, color: '#6B7168',
              background: '#F5F5F0', borderRadius: 6,
              padding: '2px 7px',
            }}>
              {f.name}
            </span>
          ))}
          {foodItems.length > 3 && (
            <span style={{ fontSize: 11, color: '#6B7168' }}>+{foodItems.length - 3} more</span>
          )}
        </div>
      </div>

      {/* Thumbnail */}
      {imageUrl && (
        <div style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
          <Image src={imageUrl} alt="meal" width={52} height={52} style={{ objectFit: 'cover', width: '100%', height: '100%' }}/>
        </div>
      )}
    </div>
  )
}
