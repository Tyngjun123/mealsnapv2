import { NextRequest, NextResponse } from 'next/server'

// Phase 1: No auth required — just analyze the image
// Phase 2: Add back session check + Vercel Blob upload
//
// AI_PROVIDER=gemini  → Google Gemini Flash (free 1500 req/day) ← RECOMMENDED
// AI_PROVIDER=claude  → Claude Sonnet (~$52/100 users/mo)
// AI_PROVIDER=openai  → GPT-4o mini (~$14/100 users/mo)
// (unset)             → Mock data (works with zero API keys)

const MOCK_FOODS = [
  { name: 'Grilled Chicken Breast', estimated_amount_g: 150, calories_kcal: 248, protein_g: 46, carbs_g: 0, fat_g: 5, confidence: 'high' },
  { name: 'Steamed White Rice', estimated_amount_g: 180, calories_kcal: 234, protein_g: 4, carbs_g: 52, fat_g: 0, confidence: 'medium' },
  { name: 'Stir-fried Broccoli', estimated_amount_g: 100, calories_kcal: 55, protein_g: 3, carbs_g: 8, fat_g: 2, confidence: 'high' },
]

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('image') as File | null
  if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Image too large (max 10MB)' }, { status: 400 })

  // Convert image to base64 data URL for local preview
  const buffer   = await file.arrayBuffer()
  const base64   = Buffer.from(buffer).toString('base64')
  const mediaType = file.type || 'image/jpeg'
  const imageUrl = `data:${mediaType};base64,${base64}`

  const provider = process.env.AI_PROVIDER

  // No API key configured → return mock data so UI is fully testable
  if (!provider) {
    await new Promise(r => setTimeout(r, 1200)) // simulate latency
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
    // Fallback to mock on error so app doesn't break
    return NextResponse.json({ foods: MOCK_FOODS, imageUrl, mock: true })
  }
}
