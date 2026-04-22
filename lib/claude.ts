import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface DetectedFood {
  name: string
  estimated_amount_g: number
  calories_kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  confidence: 'high' | 'medium' | 'low'
}

export async function analyzeMealImage(base64Image: string, mediaType: string): Promise<DetectedFood[]> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are a nutrition expert. Analyze meal photos and return accurate calorie estimates.
Always respond with ONLY a valid JSON array, no other text.`,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `Analyze this meal photo. For each food item visible, return a JSON array:
[
  {
    "name": "Food name (in the user's language if possible, otherwise English)",
    "estimated_amount_g": <number>,
    "calories_kcal": <number>,
    "protein_g": <number>,
    "carbs_g": <number>,
    "fat_g": <number>,
    "confidence": "high" | "medium" | "low"
  }
]
Be conservative. If a dish is mixed (e.g. fried rice), list it as one item.
Return ONLY the JSON array, no explanation.`,
          },
        ],
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
  return JSON.parse(cleaned) as DetectedFood[]
}
