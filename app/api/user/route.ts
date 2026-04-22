import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserByGoogleId, updateUser } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const googleId = (session.user as { id?: string }).id ?? ''
  const user = await getUserByGoogleId(googleId)

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const googleId = (session.user as { id?: string }).id ?? ''
  const body = await req.json()

  await updateUser(googleId, {
    daily_goal_kcal: body.daily_goal_kcal,
    height_cm: body.height_cm,
    weight_kg: body.weight_kg,
    age: body.age,
    name: body.name,
  })

  return NextResponse.json({ ok: true })
}
