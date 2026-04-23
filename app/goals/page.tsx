import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getUserByGoogleId } from '@/lib/db'
import { GoalsForm } from './GoalsForm'

export default async function GoalsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const googleId = (session.user as { id?: string }).id ?? ''
  const user = await getUserByGoogleId(googleId)
  if (!user) redirect('/login')

  return (
    <GoalsForm
      currentWeight={user.weight_kg}
      goalWeight={user.goal_weight_kg}
      weeklyGoal={user.weekly_goal ?? 'maintain'}
      activity={user.activity_level ?? 'moderate'}
      sex={user.sex ?? 'male'}
      dailyGoalKcal={user.daily_goal_kcal}
      heightCm={user.height_cm}
    />
  )
}
