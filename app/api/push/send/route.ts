import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { getPushSubscriptions } from '@/lib/db'

export async function POST(req: NextRequest) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  webpush.setVapidDetails(
    'mailto:support@mealsnap.app',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const { title, body, url } = await req.json()
  const subs = await getPushSubscriptions()

  const results = await Promise.allSettled(
    subs.map(row =>
      webpush.sendNotification(
        JSON.parse(row.subscription),
        JSON.stringify({ title, body, url: url ?? '/' })
      )
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  return NextResponse.json({ sent, failed })
}
