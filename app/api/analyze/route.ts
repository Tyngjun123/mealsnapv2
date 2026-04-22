import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'

const MOCK_FOODS = [
  { name: 'Grilled Chicken Breast', estimated_amount_g: 150, calories_kcal: 248, protein_g: 46, carbs_g: 0, fat_g: 5, confidence: 'high' },
  { name: 'Steamed White Rice', estimated_amount_g: 180, calories_kcal: 234, protein_g: 4, carbs_g: 52, fat_g: 0, confidence: 'medium' },
  { name: 'Stir-fried Broccoli', estimated_amount_g: 100, calories_kcal: 55, protein_g: 3, carbs_g: 8, fat_g: 2, confidence: 'high' },
]

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('image') as File | null
  if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Image too large (max 10MB)' }, { status: 400 })

  const buffer    = await file.arrayBuffer()
  const base64    = Buffer.from(buffer).toString('base64')
  const mediaType = file.type || 'image/jpeg'

  // Upload to Vercel Blob for persistent storage
  let imageUrl = `data:${mediaType};base64,${base64}`
  try {
    const blob = await put(`meals/${Date.now()}-${file.name}`, file, { access: 'public' })
    imageUrl = blob.url
  } catch {
    // Blob unavailable — use base64 preview (still works)
  }

  const provider = process.env.AI_PROVIDER
  if (!provider) {
    await new Promise(r => setTimeout(r, 800))
    return NextResponse.json({ foods: MOCK_FOODS, imageUrl })
  }

  try {
    let foods
    if (provider === 'gemini') {
      const { analyzeMealImage } = await import('@/lib/gemini')
      foods = await analyzeMealImage(base64, mediaType)
    } else if (provider === 'openai') {
      const { analyzeMealImage } = await import('@/lib/openai')
      foods = await analyzeMealImage(base64, mediaType)
    } else {
      const { analyzeMealImage } = await import('@/lib/claude')
      foods = await analyzeMealImage(base64, mediaType)
    }
    return NextResponse.json({ foods, imageUrl })
  } catch (err) {
    console.error('AI analysis error:', err)
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('429')) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }
    return NextResponse.json({ foods: MOCK_FOODS, imageUrl, mock: true })
  }
}
