import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserByGoogleId, logWorkout, getTodayWorkouts, deleteWorkout } from '@/lib/db'

async function getUser(req?: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  const googleId = (session.user as { id?: string }).id ?? ''
  return getUserByGoogleId(googleId)
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const workouts = await getTodayWorkouts(user.id)
  return NextResponse.json({ workouts })
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { exercise, durationMin, kcalBurned } = await req.json()
  if (!exercise || !durationMin || !kcalBurned) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const workout = await logWorkout(user.id, exercise, durationMin, kcalBurned)
  return NextResponse.json({ workout })
}

export async function DELETE(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await deleteWorkout(id, user.id)
  return NextResponse.json({ ok: true })
}
