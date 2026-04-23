import { NextResponse } from 'next/server'
import { migrate } from '@/lib/db'

async function runMigrate(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== process.env.MIGRATION_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  await migrate()
  return NextResponse.json({ ok: true, message: 'Tables created' })
}

export async function GET(req: Request) { return runMigrate(req) }
export async function POST(req: Request) { return runMigrate(req) }
