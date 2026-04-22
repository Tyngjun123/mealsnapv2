export interface DetectedFood {
  name: string
  estimated_amount_g: number
  calories_kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  confidence: 'high' | 'medium' | 'low'
}

const PROMPT = `Analyze this meal photo. For each food item visible, return a JSON array:
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
]
Return ONLY the JSON array, no explanation, no markdown.`

const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite',
]

export async function analyzeMealImage(base64Image: string, mediaType: string): Promise<DetectedFood[]> {
  const body = {
    contents: [{ parts: [
      { inline_data: { mime_type: mediaType, data: base64Image } },
      { text: PROMPT },
    ]}],
    generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
  }

  let lastErr = ''
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 1500))
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      )
      if (res.status === 503 || res.status === 429) { lastErr = `${res.status}`; continue }
      if (!res.ok) { lastErr = `${res.status}`; break }
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]'
      const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
      return JSON.parse(cleaned) as DetectedFood[]
    }
  }
  throw new Error(`Gemini API error: ${lastErr}`)
}
