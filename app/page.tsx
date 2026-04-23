import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getHomeData } from '@/lib/db'
import { HomeDashboard } from './HomeDashboard'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const googleId = (session.user as { id?: string }).id ?? ''
  const data = await getHomeData(googleId)
  if (!data) redirect('/login')
  const { user, meals } = data

  const eaten   = meals.reduce((s, m) => s + m.total_kcal, 0)
  const protein = meals.reduce((s, m) => s + (m.food_items?.reduce((a, f) => a + f.protein_g, 0) ?? 0), 0)
  const carbs   = meals.reduce((s, m) => s + (m.food_items?.reduce((a, f) => a + f.carbs_g, 0) ?? 0), 0)
  const fat     = meals.reduce((s, m) => s + (m.food_items?.reduce((a, f) => a + f.fat_g, 0) ?? 0), 0)

  return (
    <HomeDashboard
      user={{ name: user.name, avatarUrl: user.avatar_url, dailyGoal: user.daily_goal_kcal }}
      eaten={Math.round(eaten)}
      macros={{ protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) }}
      meals={meals.map(m => ({
        id: m.id,
        mealType: m.meal_type,
        time: new Date(m.eaten_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
        totalKcal: m.total_kcal,
        imageUrl: m.image_url,
        foodItems: m.food_items ?? [],
      }))}
    />
  )
}
