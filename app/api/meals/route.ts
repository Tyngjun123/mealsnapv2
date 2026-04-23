import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createMeal, getMealsByDateRange, deleteMeal, getUserByGoogleId } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const googleId = (session.user as { id?: string }).id ?? ''
  const { searchParams } = new URL(req.url)
  const isExport = searchParams.get('export') === '1'

  const user = await getUserByGoogleId(googleId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const meals = await getMealsByDateRange(user.id, isExport ? 365 : 30)

  if (isExport) {
    const json = JSON.stringify(meals, null, 2)
    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="mealsnap-export.json"`,
      },
    })
  }

  return NextResponse.json(meals)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const googleId = (session.user as { id?: string }).id ?? ''
  const user = await getUserByGoogleId(googleId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await req.json()
  const { mealType, imageUrl, totalKcal, foodItems } = body

  if (!mealType || !Array.isArray(foodItems)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const meal = await createMeal({
    userId: user.id,
    mealType,
    imageUrl,
    totalKcal,
    foodItems,
  })

  return NextResponse.json(meal, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const googleId = (session.user as { id?: string }).id ?? ''
  const { searchParams } = new URL(req.url)
  const mealId = searchParams.get('id')

  if (!mealId) return NextResponse.json({ error: 'Missing meal id' }, { status: 400 })

  const deleteUser = await getUserByGoogleId(googleId)
  if (!deleteUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await deleteMeal(mealId, deleteUser.id)
  return NextResponse.json({ ok: true })
}
