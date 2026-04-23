'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BarcodePage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => stopScan(), [])

  function stopScan() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    setScanning(false)
  }

  async function startScan() {
    setError('')
    // Use native BarcodeDetector if available
    if (!('BarcodeDetector' in window)) {
      setError('Barcode scanning not supported on this browser. Enter code manually.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setScanning(true)

      // @ts-expect-error BarcodeDetector not in TS types
      const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'] })
      intervalRef.current = setInterval(async () => {
        if (!videoRef.current) return
        try {
          const barcodes = await detector.detect(videoRef.current)
          if (barcodes.length > 0) {
            stopScan()
            await lookup(barcodes[0].rawValue)
          }
        } catch {}
      }, 400)
    } catch {
      setError('Camera access denied. Enter barcode manually.')
    }
  }

  async function lookup(barcode: string) {
    if (!barcode.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/barcode?code=${encodeURIComponent(barcode.trim())}`)
      if (res.status === 404) {
        setError('not_found')
        return
      }
      if (!res.ok) throw new Error()
      const data = await res.json()
      sessionStorage.setItem('analyzeResult', JSON.stringify({
        foods: [data.food],
        imageUrl: data.imageUrl,
        mealType: 'snack',
      }))
      router.push('/result')
    } catch {
      setError('Could not reach the product database. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7' }}>
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{
          width: 36, height: 36, borderRadius: '50%', border: 'none',
          background: '#fff', cursor: 'pointer', fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D1A', margin: 0 }}>Scan Barcode</h1>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Camera viewfinder */}
        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#111', marginBottom: 16, aspectRatio: '4/3' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: scanning ? 'block' : 'none' }}/>
          {!scanning && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ fontSize: 48 }}>📦</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Tap to start camera</div>
            </div>
          )}
          {scanning && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ width: '70%', height: 2, background: '#4CAF50', boxShadow: '0 0 12px #4CAF50', borderRadius: 2 }}/>
            </div>
          )}
        </div>

        {!scanning ? (
          <button onClick={startScan} className="btn-primary" style={{ width: '100%', marginBottom: 16 }}>
            📷 Start Camera Scan
          </button>
        ) : (
          <button onClick={stopScan} style={{
            width: '100%', padding: '14px', borderRadius: 14, border: '1.5px solid #E0E0E0',
            background: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'inherit', cursor: 'pointer', marginBottom: 16,
          }}>
            Stop Scanning
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: '#E0E0E0' }}/>
          <span style={{ fontSize: 12, color: '#6B7168', fontWeight: 600 }}>OR ENTER MANUALLY</span>
          <div style={{ flex: 1, height: 1, background: '#E0E0E0' }}/>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lookup(code)}
            placeholder="Enter barcode number..."
            inputMode="numeric"
            style={{
              flex: 1, border: '1.5px solid #E0E0E0', borderRadius: 14,
              padding: '14px 16px', fontSize: 15, fontFamily: 'inherit',
              outline: 'none', background: '#fff',
            }}
            onFocus={e => (e.target.style.borderColor = '#4CAF50')}
            onBlur={e => (e.target.style.borderColor = '#E0E0E0')}
          />
          <button
            onClick={() => lookup(code)}
            disabled={!code.trim() || loading}
            className="btn-primary"
            style={{ padding: '0 20px', fontSize: 20, borderRadius: 14, boxShadow: 'none' }}
          >
            {loading ? '...' : '→'}
          </button>
        </div>

        {error === 'not_found' ? (
          <div style={{ marginTop: 12, padding: '16px', borderRadius: 14, background: '#FFF3E0', border: '1px solid #FFCC80' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#E65100', marginBottom: 6 }}>Product not found</div>
            <div style={{ fontSize: 13, color: '#BF360C', marginBottom: 12 }}>
              This barcode isn't in our database. You can describe the food manually instead.
            </div>
            <button onClick={() => router.push('/manual')} style={{
              width: '100%', padding: '12px', borderRadius: 12, border: 'none',
              background: '#FF7043', color: '#fff', fontWeight: 700, fontSize: 14,
              fontFamily: 'inherit', cursor: 'pointer',
            }}>
              Enter Food Manually →
            </button>
          </div>
        ) : error ? (
          <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 12, background: '#FFEBEE', color: '#C62828', fontSize: 13, fontWeight: 500 }}>
            {error}
          </div>
        ) : null}
      </div>
    </div>
  )
}
