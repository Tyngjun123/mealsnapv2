import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getUserByGoogleId, getWeightLogs } from '@/lib/db'
import { ProgressView } from './ProgressView'

export default async function ProgressPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const googleId = (session.user as { id?: string }).id ?? ''
  const user = await getUserByGoogleId(googleId)
  if (!user) redirect('/login')

  const logs = await getWeightLogs(user.id, 60)

  return (
    <ProgressView
      initialEntries={logs}
      goalWeight={user.goal_weight_kg}
    />
  )
}
