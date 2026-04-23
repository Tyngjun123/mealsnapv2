import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { sendWeeklySummary } from '@/lib/email'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { rows: users } = await sql`SELECT id, email, name, daily_goal_kcal FROM users WHERE email IS NOT NULL`

  const results = await Promise.allSettled(users.map(async (u) => {
    type DayRow = { kcal: string; day: string }
    const { rows: totals } = await sql`
      SELECT
        COALESCE(SUM(total_kcal),0) AS kcal,
        DATE(eaten_at) AS day
      FROM meals
      WHERE user_id = ${u.id}
        AND eaten_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(eaten_at)
    ` as { rows: DayRow[] }
    if (totals.length === 0) return

    const avgKcal = Math.round(totals.reduce((s, r) => s + Number(r.kcal), 0) / totals.length)
    const daysLogged = totals.length
    const daysUnder = totals.filter(r => Number(r.kcal) <= u.daily_goal_kcal).length

    let streak = 0
    const today = new Date()
    const daySet = new Set(totals.map(r => r.day?.toString().split('T')[0]))
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      if (daySet.has(d.toISOString().split('T')[0])) streak++
      else break
    }

    return sendWeeklySummary(u.email, u.name, { avgKcal, goal: u.daily_goal_kcal, daysLogged, daysUnder, streak })
  }))

  const sent = results.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ sent, total: users.length })
}
