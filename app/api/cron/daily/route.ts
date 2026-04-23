import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { sendDailyReminder } from '@/lib/email'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]

  // Find users who have NOT logged any meal today
  const { rows: users } = await sql`
    SELECT u.email, u.name
    FROM users u
    WHERE u.email IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM meals m
      WHERE m.user_id = u.id
      AND DATE(m.eaten_at) = ${today}::date
    )
  `

  const results = await Promise.allSettled(
    users.map(u => sendDailyReminder(u.email, u.name))
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ sent, total: users.length })
}
