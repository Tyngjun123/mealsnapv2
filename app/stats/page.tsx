import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getDailyTotals, getUserByGoogleId } from '@/lib/db'
import { StatsView } from './StatsView'

export default async function StatsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const googleId = (session.user as { id?: string }).id ?? ''
  const [user, totals] = await Promise.all([
    getUserByGoogleId(googleId),
    getDailyTotals(googleId, 30).catch(() => []),
  ])

  return (
    <StatsView
      goal={user?.daily_goal_kcal ?? 2000}
      totals={totals.map(t => ({
        date: t.date,
        fullDate: t.date,
        kcal: Math.round(t.total_kcal),
        protein: Math.round(t.protein_g),
        carbs: Math.round(t.carbs_g),
        fat: Math.round(t.fat_g),
      }))}
    />
  )
}
