import { NextResponse } from 'next/server'
import { migrate } from '@/lib/db'

async function runMigrate() {
  await migrate()
  return NextResponse.json({ ok: true, message: 'Tables created' })
}

export async function GET() { return runMigrate() }
export async function POST() { return runMigrate() }
