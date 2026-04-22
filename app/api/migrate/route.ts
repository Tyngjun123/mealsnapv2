import { NextResponse } from 'next/server'
import { migrate } from '@/lib/db'

// One-time migration endpoint — protect with a secret
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== process.env.MIGRATION_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  await migrate()
  return NextResponse.json({ ok: true, message: 'Tables created' })
}
