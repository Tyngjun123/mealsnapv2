'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav'
import { CalorieRing } from '@/components/CalorieRing'
import { MacroBar } from '@/components/MacroBar'
import { MealCard } from '@/components/MealCard'
import { getProfile, getTodayMeals, getTodayMacros, deleteMeal, type Meal } from '@/lib/store'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function HomeDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<ReturnType<typeof getProfile>>(null)
  const [meals, setMeals]     = useState<Meal[]>([])
  const [macros, setMacros]   = useState({ protein: 0, carbs: 0, fat: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const p = getProfile()
    if (!p) { router.replace('/login'); return }
    setProfile(p)
    setMeals(getTodayMeals())
    setMacros(getTodayMacros())
  }, [router])

  function handleDelete(id: string) {
    deleteMeal(id)
    setMeals(getTodayMeals())
    setMacros(getTodayMacros())
  }

  if (!mounted || !profile) return null

  const eaten = meals.reduce((s, m) => s + m.totalKcal, 0)
  const today = new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, color: '#6B7168', fontWeight: 500 }}>{today}</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1D1A', margin: '4px 0 0', letterSpacing: -0.5 }}>
            {greeting()}, {profile.name.split(' ')[0]} 👋
          </h1>
        </div>
      </div>

      {/* Calorie Ring Card */}
      <div className="card" style={{ margin: '0 16px 16px', padding: '24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <CalorieRing eaten={eaten} goal={profile.dailyGoalKcal} size={180} />
        </div>
        <MacroBar protein={Math.round(macros.protein)} carbs={Math.round(macros.carbs)} fat={Math.round(macros.fat)} />
      </div>

      {/* Today's Meals */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D1A', margin: 0 }}>Today's meals</h2>
          <span style={{ fontSize: 12, color: '#6B7168' }}>{meals.length} logged</span>
        </div>

        {meals.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '32px 20px',
            background: '#fff', borderRadius: 20, border: '2px dashed #E8F5E9',
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🍽️</div>
            <div style={{ fontSize: 14, color: '#6B7168', fontWeight: 500 }}>No meals logged yet today</div>
            <div style={{ fontSize: 12, color: '#9E9E9E', marginTop: 4 }}>Tap the camera button to log your first meal</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {meals.map(m => (
              <MealCard
                key={m.id} id={m.id} mealType={m.mealType}
                time={new Date(m.eatenAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                totalKcal={m.totalKcal} imageUrl={m.imageUrl}
                foodItems={m.foodItems}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB Camera Button */}
      <Link href="/camera" style={{
        position: 'fixed', bottom: 76, left: '50%', transform: 'translateX(-50%)',
        width: 64, height: 64, borderRadius: '50%',
        background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 28px rgba(76,175,80,0.45)',
        zIndex: 60, textDecoration: 'none',
      }}>
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
            stroke="#fff" strokeWidth="2" fill="none" strokeLinejoin="round"/>
          <circle cx="12" cy="13" r="4" stroke="#fff" strokeWidth="2"/>
        </svg>
      </Link>

      <BottomNav />
    </div>
  )
}
