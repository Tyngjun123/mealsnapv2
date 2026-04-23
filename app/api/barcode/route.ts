import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const barcode = new URL(req.url).searchParams.get('code')
  if (!barcode) return NextResponse.json({ error: 'Missing barcode' }, { status: 400 })

  const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
  const data = await res.json()

  if (data.status !== 1) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const p = data.product
  const per100 = p.nutriments
  const servingG = p.serving_quantity ? parseFloat(p.serving_quantity) : 100

  return NextResponse.json({
    name: p.product_name || p.product_name_en || 'Unknown product',
    brand: p.brands || '',
    imageUrl: p.image_front_url || null,
    servingG,
    food: {
      name: `${p.product_name || 'Product'}${p.brands ? ` (${p.brands})` : ''}`,
      estimated_amount_g: servingG,
      calories_kcal: Math.round((per100['energy-kcal_100g'] || 0) * servingG / 100),
      protein_g: Math.round((per100.proteins_100g || 0) * servingG / 100 * 10) / 10,
      carbs_g: Math.round((per100.carbohydrates_100g || 0) * servingG / 100 * 10) / 10,
      fat_g: Math.round((per100.fat_100g || 0) * servingG / 100 * 10) / 10,
      confidence: 'high',
    },
  })
}
