'use client'
import { useState } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { MealCard } from '@/components/MealCard'

interface MealEntry {
  id: string
  mealType: string
  eatenAt: string
  totalKcal: number
  imageUrl?: string | null
  foodItems: Array<{ name: string; kcal: number }>
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
}

// Build last 7 days for calendar strip
function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })
}

interface Props { meals: MealEntry[] }

export function HistoryView({ meals: initialMeals }: Props) {
  const [meals, setMeals]               = useState(initialMeals)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  async function handleDelete(id: string) {
    await fetch(`/api/meals?id=${id}`, { method: 'DELETE' })
    setMeals(prev => prev.filter(m => m.id !== id))
  }

  const days = getLast7Days()

  // Group meals by date
  const byDate = meals.reduce<Record<string, MealEntry[]>>((acc, m) => {
    const key = new Date(m.eatenAt).toDateString()
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  // Filter meals for display
  const displayMeals = selectedDate
    ? meals.filter(m => new Date(m.eatenAt).toDateString() === selectedDate)
    : meals

  // Group for display
  const grouped = displayMeals.reduce<Record<string, MealEntry[]>>((acc, m) => {
    const key = new Date(m.eatenAt).toDateString()
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <div className="page-bottom">
      {/* Header */}
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 20px 16px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D1A', margin: 0, letterSpacing: -0.5 }}>History</h1>
        <p style={{ fontSize: 13, color: '#6B7168', margin: '4px 0 0' }}>Last 30 days</p>
      </div>

      {/* 7-day Calendar Strip */}
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {days.map(d => {
            const key = d.toDateString()
            const hasData = !!byDate[key]
            const isSelected = selectedDate === key
            const isToday = d.toDateString() === new Date().toDateString()
            const dayTotal = byDate[key]?.reduce((s, m) => s + m.totalKcal, 0) ?? 0

            return (
              <button key={key} onClick={() => setSelectedDate(isSelected ? null : key)} style={{
                flex: 1, padding: '10px 4px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: isSelected ? '#4CAF50' : isToday ? '#E8F5E9' : '#fff',
                boxShadow: isSelected ? '0 4px 12px rgba(76,175,80,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
                textAlign: 'center', fontFamily: 'inherit', transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: isSelected ? 'rgba(255,255,255,0.7)' : '#6B7168', textTransform: 'uppercase' }}>
                  {d.toLocaleDateString('en', { weekday: 'short' })}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: isSelected ? '#fff' : '#1A1D1A', margin: '4px 0' }}>
                  {d.getDate()}
                </div>
                {hasData ? (
                  <div style={{ fontSize: 9, fontWeight: 700, color: isSelected ? 'rgba(255,255,255,0.85)' : '#4CAF50' }}>
                    {dayTotal}
                  </div>
                ) : (
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'transparent', margin: '0 auto' }}/>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Meal list */}
      <div style={{ padding: '0 16px' }}>
        {sortedDates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#6B7168' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>No meals recorded</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              {selectedDate ? 'No meals on this day' : 'Start logging your meals!'}
            </div>
          </div>
        ) : sortedDates.map(dateKey => {
          const dayMeals = grouped[dateKey]
          const dayTotal = dayMeals.reduce((s, m) => s + m.totalKcal, 0)

          return (
            <div key={dateKey} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1A' }}>
                  {formatDate(dayMeals[0].eatenAt)}
                </span>
                <span style={{
                  fontSize: 13, fontWeight: 700, color: '#4CAF50',
                  background: '#E8F5E9', padding: '3px 10px', borderRadius: 999,
                }}>
                  {dayTotal} kcal
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dayMeals.map(m => (
                  <MealCard
                    key={m.id} id={m.id}
                    mealType={m.mealType}
                    time={formatTime(m.eatenAt)}
                    totalKcal={m.totalKcal}
                    imageUrl={m.imageUrl}
                    foodItems={m.foodItems}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <BottomNav/>
    </div>
  )
}
