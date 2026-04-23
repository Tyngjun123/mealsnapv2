import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserByGoogleId, addWeightLog, getWeightLogs } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const googleId = (session.user as { id?: string }).id ?? ''
  const user = await getUserByGoogleId(googleId)
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const logs = await getWeightLogs(user.id, 60)
  return NextResponse.json(logs)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const googleId = (session.user as { id?: string }).id ?? ''
  const user = await getUserByGoogleId(googleId)
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const weightKg = parseFloat(body.weight_kg)
  if (!weightKg || weightKg < 10 || weightKg > 500) {
    return NextResponse.json({ error: 'Invalid weight' }, { status: 400 })
  }

  const log = await addWeightLog(user.id, weightKg, body.notes)
  return NextResponse.json(log)
}
