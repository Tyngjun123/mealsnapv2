import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserByGoogleId } from '@/lib/db'
import { sql } from '@vercel/postgres'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const googleId = (session.user as { id?: string }).id ?? ''
  const user = await getUserByGoogleId(googleId)
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const dateParam = req.nextUrl.searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  const mealsResult = await sql<{
    id: string; meal_type: string; total_kcal: number;
    protein_g: number; carbs_g: number; fat_g: number;
  }>`
    SELECT m.id, m.meal_type, m.total_kcal,
      COALESCE(SUM(fi.protein_g), 0)::float AS protein_g,
      COALESCE(SUM(fi.carbs_g),  0)::float AS carbs_g,
      COALESCE(SUM(fi.fat_g),    0)::float AS fat_g
    FROM meals m
    LEFT JOIN food_items fi ON fi.meal_id = m.id
    WHERE m.user_id = ${user.id}
      AND m.eaten_at::date = ${dateParam}::date
    GROUP BY m.id
    ORDER BY m.eaten_at ASC
  `

  const meals = mealsResult.rows
  const totals = meals.reduce(
    (acc, m) => ({
      kcal:    acc.kcal    + m.total_kcal,
      protein: acc.protein + m.protein_g,
      carbs:   acc.carbs   + m.carbs_g,
      fat:     acc.fat     + m.fat_g,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return NextResponse.json({ meals, totals, dailyGoal: user.daily_goal_kcal })
}
