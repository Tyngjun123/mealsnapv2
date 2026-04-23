import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { query } = await req.json()
  if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

  const prompt = `Estimate the nutrition for: "${query}"

Return a JSON array of food items (split into components if needed):
[{
  "name": "Food name",
  "estimated_amount_g": <number>,
  "calories_kcal": <number>,
  "protein_g": <number>,
  "carbs_g": <number>,
  "fat_g": <number>,
  "confidence": "high" | "medium" | "low"
}]
Return ONLY the JSON array, no explanation.`

  const MODELS = ['gemini-flash-latest', 'gemini-2.0-flash-lite', 'gemini-2.0-flash']
  for (const model of MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
        }),
      }
    )
    if (res.status === 429) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    if (!res.ok) continue
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]'
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    return NextResponse.json({ foods: JSON.parse(cleaned) })
  }

  return NextResponse.json({ error: 'AI unavailable' }, { status: 503 })
}
