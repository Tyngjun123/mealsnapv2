// Alternative to Claude — Google Gemini Flash (FREE tier: 1500 req/day)
// Get API key: https://aistudio.google.com → Get API Key

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

export async function analyzeMealImage(base64Image: string, mediaType: string): Promise<DetectedFood[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mediaType, data: base64Image } },
            { text: PROMPT },
          ],
        }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
      }),
    }
  )

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`)

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]'
  const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
  return JSON.parse(cleaned) as DetectedFood[]
}
