import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserByGoogleId, savePushSubscription, deletePushSubscription } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const googleId = (session.user as { id?: string }).id ?? ''
  const user = await getUserByGoogleId(googleId)
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()

  if (body.unsubscribe) {
    await deletePushSubscription(user.id)
    return NextResponse.json({ ok: true })
  }

  await savePushSubscription(user.id, body.subscription)
  return NextResponse.json({ ok: true })
}
