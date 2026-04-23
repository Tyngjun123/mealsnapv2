import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getUserByGoogleId } from '@/lib/db'
import { ProfileEditClient } from './ProfileEditClient'

export default async function ProfileEditPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const googleId = (session.user as { id?: string }).id ?? ''
  const user = await getUserByGoogleId(googleId)
  if (!user) redirect('/login')

  return (
    <ProfileEditClient
      name={user.name}
      email={user.email}
      heightCm={user.height_cm}
      weightKg={user.weight_kg}
      age={user.age}
    />
  )
}
