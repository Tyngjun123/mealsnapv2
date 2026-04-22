'use client'
import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

export default function CameraPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [mealType, setMealType] = useState('Dinner')
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    setPreview(url)
  }, [])

  const handleCapture = async () => {
    if (!preview || !fileRef.current?.files?.[0]) return
    setLoading(true)

    const file = fileRef.current.files[0]
    const formData = new FormData()
    formData.append('image', file)
    formData.append('mealType', mealType.toLowerCase())

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      // Store in sessionStorage for result page
      sessionStorage.setItem('analyzeResult', JSON.stringify({ ...data, mealType: mealType.toLowerCase() }))
      router.push('/result')
    } catch {
      alert('Failed to analyze image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#111',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Close */}
      <button onClick={() => router.push('/')} style={{
        position: 'absolute', top: 'max(52px, calc(env(safe-area-inset-top) + 12px))', left: 16, zIndex: 10,
        width: 40, height: 40, borderRadius: '50%',
        background: 'rgba(0,0,0,0.5)', border: 'none',
        color: '#fff', fontSize: 20, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>×</button>

      {/* Meal type selector */}
      <div style={{
        position: 'absolute', top: 'max(48px, calc(env(safe-area-inset-top) + 8px))', left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, display: 'flex', gap: 6,
        background: 'rgba(0,0,0,0.5)', borderRadius: 999,
        padding: '4px 6px', backdropFilter: 'blur(8px)',
      }}>
        {MEAL_TYPES.map(t => (
          <button key={t} onClick={() => setMealType(t)} style={{
            padding: '6px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: mealType === t ? '#4CAF50' : 'transparent',
            color: mealType === t ? '#fff' : 'rgba(255,255,255,0.6)',
            fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {/* Viewfinder */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}/>
        ) : (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            {/* AI bracket corners */}
            {[['0,0', 'bottom right'], ['auto,0', 'bottom left'], ['0,auto', 'top right'], ['auto,auto', 'top left']].map(([pos, _], i) => {
              const [top, right, bottom, left] = [
                i === 0 || i === 2 ? 60 : 'auto',
                i === 2 || i === 3 ? 40 : 'auto',
                i === 1 || i === 3 ? 60 : 'auto',
                i === 0 || i === 1 ? 40 : 'auto',
              ]
              const bStyle = {
                position: 'absolute' as const,
                top, right, bottom, left,
                width: 32, height: 32,
                borderColor: '#4CAF50',
                borderStyle: 'solid',
                borderWidth: `${i < 2 ? '2px 0 0 2px' : i === 2 ? '2px 2px 0 0' : '0 2px 2px 0'}`,
              }
              return <div key={i} style={bStyle}/>
            })}
            <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Tap below to take a photo</div>
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.6 }}>or choose from your gallery</div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div style={{
        padding: '24px 32px',
        paddingBottom: 'max(48px, calc(env(safe-area-inset-bottom) + 24px))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
      }}>
        {/* Gallery */}
        <button onClick={() => fileRef.current?.click()} style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(255,255,255,0.15)', border: 'none',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>🖼️</button>

        {/* Capture / Confirm */}
        <button
          onClick={preview ? handleCapture : () => fileRef.current?.click()}
          disabled={loading}
          style={{
            width: 72, height: 72, borderRadius: '50%',
            background: loading ? '#6B7168' : '#4CAF50',
            border: '4px solid rgba(255,255,255,0.3)',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: loading ? 14 : 28, color: '#fff', fontWeight: 700,
            fontFamily: 'inherit', transition: 'background 0.2s',
          }}>
          {loading ? '...' : preview ? '✓' : '📷'}
        </button>

        {/* Re-shoot */}
        {preview ? (
          <button onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = '' }} style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'rgba(255,255,255,0.15)', border: 'none',
            color: '#fff', cursor: 'pointer', fontSize: 22,
          }}>🔄</button>
        ) : <div style={{ width: 48 }}/>}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef} type="file" accept="image/*" capture="environment"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
      />
    </div>
  )
}
