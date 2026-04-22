import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getUserByGoogleId } from '@/lib/db'
import { ProfileView } from './ProfileView'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const googleId = (session.user as { id?: string }).id ?? ''
  const user = await getUserByGoogleId(googleId)
  if (!user) redirect('/login')

  return (
    <ProfileView user={{
      name: user.name,
      email: user.email,
      avatarUrl: user.avatar_url,
      dailyGoalKcal: user.daily_goal_kcal,
      heightCm: user.height_cm,
      weightKg: user.weight_kg,
      age: user.age,
      isPro: user.is_pro,
    }} />
  )
}
