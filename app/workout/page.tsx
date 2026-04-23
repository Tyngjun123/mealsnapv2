import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserByGoogleId, getTodayWorkouts } from '@/lib/db'
import { redirect } from 'next/navigation'
import { WorkoutClient } from './WorkoutClient'

export default async function WorkoutPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const googleId = (session.user as { id?: string }).id ?? ''
  const user = await getUserByGoogleId(googleId)
  if (!user) redirect('/login')

  const workouts = await getTodayWorkouts(user.id)

  return (
    <WorkoutClient
      weightKg={user.weight_kg ?? 70}
      initialWorkouts={workouts.map(w => ({
        id: w.id,
        exercise: w.exercise,
        durationMin: w.duration_min,
        kcalBurned: w.kcal_burned,
        loggedAt: w.logged_at,
      }))}
    />
  )
}
