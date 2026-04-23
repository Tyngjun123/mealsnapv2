import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getUserByGoogleId, getStreak, getProfileStats } from '@/lib/db'
import { ProfileView } from './ProfileView'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const googleId = (session.user as { id?: string }).id ?? ''
  const user = await getUserByGoogleId(googleId)
  if (!user) redirect('/login')

  const [streak, stats] = await Promise.all([
    getStreak(user.id),
    getProfileStats(user.id),
  ])

  return (
    <ProfileView
      user={{
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar_url,
        dailyGoalKcal: user.daily_goal_kcal,
        heightCm: user.height_cm,
        weightKg: user.weight_kg,
        goalWeightKg: user.goal_weight_kg,
        age: user.age,
        isPro: user.is_pro,
      }}
      streak={streak}
      stats={stats}
    />
  )
}
