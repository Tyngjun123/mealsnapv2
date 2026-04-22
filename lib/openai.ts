// Alternative to Claude — OpenAI GPT-4o mini
// ~$0.001 per image scan (100x cheaper than GPT-4o)
// Get API key: https://platform.openai.com

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
Return ONLY the JSON array, no explanation.`

export async function analyzeMealImage(base64Image: string, mediaType: string): Promise<DetectedFood[]> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64Image}` } },
          { type: 'text', text: PROMPT },
        ],
      }],
    }),
  })

  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`)

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content ?? '[]'
  const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
  return JSON.parse(cleaned) as DetectedFood[]
}
