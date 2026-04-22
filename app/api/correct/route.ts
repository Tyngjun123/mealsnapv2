import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { foods, correction } = await req.json()
  if (!correction || !Array.isArray(foods)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const prompt = `You are a nutrition assistant. The user has a list of detected food items and wants to correct them.

Current food items:
${JSON.stringify(foods, null, 2)}

User correction: "${correction}"

Apply the correction (remove, add, or modify items as needed). Return ONLY a JSON array in exactly this format, no explanation:
[
  {
    "name": "Food name",
    "estimated_amount_g": <number>,
    "calories_kcal": <number>,
    "protein_g": <number>,
    "carbs_g": <number>,
    "fat_g": <number>,
    "confidence": "high" | "medium" | "low"
  }
]`

  const MODELS = ['gemini-flash-latest', 'gemini-2.0-flash-lite', 'gemini-2.0-flash']
  let lastErr = ''

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 1500))
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
          }),
        }
      )
      if (res.status === 429 || res.status === 503) { lastErr = `${res.status}`; continue }
      if (!res.ok) { lastErr = `${res.status}`; break }
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]'
      const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
      return NextResponse.json({ foods: JSON.parse(cleaned) })
    }
  }

  if (lastErr === '429') return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  return NextResponse.json({ error: 'AI unavailable' }, { status: 503 })
}
