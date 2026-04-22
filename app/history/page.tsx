import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getMealsByDateRange, getUserByGoogleId } from '@/lib/db'
import { HistoryView } from './HistoryView'

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const googleId = (session.user as { id?: string }).id ?? ''
  const meals = await getMealsByDateRange(googleId, 30).catch(() => [])

  return (
    <HistoryView meals={meals.map(m => ({
      id: m.id,
      mealType: m.meal_type,
      eatenAt: m.eaten_at,
      totalKcal: m.total_kcal,
      imageUrl: m.image_url,
      foodItems: m.food_items ?? [],
    }))} />
  )
}
