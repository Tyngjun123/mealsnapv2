import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ size: string }> }) {
  const { size: sizeStr } = await params
  const size = sizeStr === '512' ? 512 : 192
  const radius = Math.round(size * 0.22)

  return new ImageResponse(
    (
      <div style={{
        width: size, height: size,
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        borderRadius: radius,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: Math.round(size * 0.52), lineHeight: 1 }}>🍽️</span>
      </div>
    ),
    { width: size, height: size }
  )
}
