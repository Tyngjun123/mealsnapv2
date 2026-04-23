'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav'
import { CalorieRing } from '@/components/CalorieRing'
import { MacroBar } from '@/components/MacroBar'
import { MealCard } from '@/components/MealCard'

interface Props {
  user: { name: string; avatarUrl: string; dailyGoal: number }
  eaten: number
  burned: number
  macros: { protein: number; carbs: number; fat: number }
  meals: Array<{
    id: string
    mealType: string
    time: string
    totalKcal: number
    imageUrl?: string | null
    foodItems: Array<{ name: string; kcal: number }>
  }>
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HomeDashboard({ user, eaten, burned, macros, meals: initialMeals }: Props) {
  const [meals, setMeals] = useState(initialMeals)
  const router = useRouter()
  const today = new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })
  const net = user.dailyGoal - eaten + burned

  async function handleDelete(id: string) {
    await fetch(`/api/meals?id=${id}`, { method: 'DELETE' })
    setMeals(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div className="page-bottom">
      {/* Header */}
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, color: '#6B7168', fontWeight: 500 }} suppressHydrationWarning>{today}</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1D1A', margin: '4px 0 0', letterSpacing: -0.5 }} suppressHydrationWarning>
            {greeting()}, {user.name.split(' ')[0]} 👋
          </h1>
        </div>
        {user.avatarUrl && (
          <Image src={user.avatarUrl} alt="avatar" width={40} height={40}
            style={{ borderRadius: '50%', border: '2px solid #E8F5E9' }} />
        )}
      </div>

      {/* Calorie Ring Card */}
      <div className="card" style={{ margin: '0 16px 16px', padding: '24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <CalorieRing eaten={eaten} goal={user.dailyGoal} size={180} />
        </div>
        {burned > 0 && (
          <button onClick={() => router.push('/workout')} style={{
            display: 'flex', justifyContent: 'space-around', alignItems: 'center',
            background: '#F1F8E9', borderRadius: 12, padding: '10px 12px',
            marginBottom: 14, border: 'none', cursor: 'pointer', width: '100%',
            fontFamily: 'inherit', WebkitTapHighlightColor: 'transparent',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#6B7168' }}>Eaten</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1D1A' }}>{eaten}</div>
            </div>
            <div style={{ fontSize: 16, color: '#9E9E9E' }}>−</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#6B7168' }}>🔥 Burned</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#4CAF50' }}>{burned}</div>
            </div>
            <div style={{ fontSize: 16, color: '#9E9E9E' }}>=</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#6B7168' }}>Net left</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: net < 0 ? '#E53935' : '#1A1D1A' }}>{net}</div>
            </div>
          </button>
        )}
        <MacroBar protein={macros.protein} carbs={macros.carbs} fat={macros.fat} />
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
            {meals.map(m => <MealCard key={m.id} {...m} onDelete={handleDelete} />)}
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
            stroke="#fff" strokeWidth="2" fill="none" strokeLinejoin="round" />
          <circle cx="12" cy="13" r="4" stroke="#fff" strokeWidth="2" />
        </svg>
      </Link>

      <BottomNav />
    </div>
  )
}
