'use client'
import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function CameraPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
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
    formData.append('mealType', 'dinner')
    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      if (res.status === 429) {
        alert('AI is busy — free tier limit reached. Please wait 1 minute and try again.')
        return
      }
      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      sessionStorage.setItem('analyzeResult', JSON.stringify({ ...data, mealType: 'dinner' }))
      router.push('/result')
    } catch {
      alert('Failed to analyze image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100dvh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Full-screen image preview */}
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="preview" style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0,
        }}/>
      )}

      {/* Top overlay */}
      <div style={{
        position: 'relative', zIndex: 10,
        paddingTop: 'max(52px, calc(env(safe-area-inset-top) + 12px))',
        paddingLeft: 16, paddingRight: 16, paddingBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
      }}>
        <button onClick={() => router.push('/')} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', fontSize: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { icon: '📦', label: 'Barcode', path: '/barcode' },
            { icon: '✏️', label: 'Manual', path: '/manual' },
          ].map(m => (
            <button key={m.label} onClick={() => router.push(m.path)} style={{
              padding: '6px 12px', borderRadius: 999,
              background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 4,
              backdropFilter: 'blur(8px)',
            }}>
              <span>{m.icon}</span><span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Viewfinder (empty state) — entire area is a tap target */}
      {!preview && (
        <label htmlFor="camera-input" style={{
          flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'center', position: 'relative', cursor: 'pointer',
        }}>
          {/* Corner brackets */}
          {([
            { top: 80, left: 40 },
            { top: 80, right: 40 },
            { bottom: 80, left: 40 },
            { bottom: 80, right: 40 },
          ] as React.CSSProperties[]).map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', ...pos,
              width: 28, height: 28,
              borderColor: '#4CAF50', borderStyle: 'solid',
              borderWidth: i === 0 ? '2px 0 0 2px' : i === 1 ? '2px 2px 0 0' : i === 2 ? '0 0 2px 2px' : '0 2px 2px 0',
            }}/>
          ))}
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>📷</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Tap to open camera</div>
            <div style={{ fontSize: 12, marginTop: 6, opacity: 0.6 }}>or use gallery below</div>
          </div>
        </label>
      )}

      {/* Spacer when preview is shown */}
      {preview && <div style={{ flex: 1 }}/>}

      {/* Bottom controls */}
      <div style={{
        position: 'relative', zIndex: 10,
        paddingTop: 24, paddingLeft: 40, paddingRight: 40,
        paddingBottom: 'max(40px, calc(env(safe-area-inset-bottom) + 24px))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 60%, transparent)',
      }}>
        {/* Gallery */}
        <button onClick={() => fileRef.current?.click()} style={{
          width: 50, height: 50, borderRadius: 14,
          background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>🖼️</button>

        {/* Main action button */}
        <button
          onClick={preview ? handleCapture : () => fileRef.current?.click()}
          disabled={loading}
          style={{
            width: 76, height: 76, borderRadius: '50%',
            background: loading ? 'rgba(107,113,104,0.9)' : 'linear-gradient(135deg, #4CAF50, #2E7D32)',
            border: '3px solid rgba(255,255,255,0.35)',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: loading ? 13 : 28, color: '#fff', fontWeight: 700,
            fontFamily: 'inherit',
            boxShadow: loading ? 'none' : '0 6px 24px rgba(76,175,80,0.5)',
            transition: 'all 0.2s',
          }}>
          {loading ? 'AI...' : preview ? '✓' : '📷'}
        </button>

        {/* Retake */}
        {preview ? (
          <button onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = '' }} style={{
            width: 50, height: 50, borderRadius: 14,
            background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>🔄</button>
        ) : <div style={{ width: 50 }}/>}
      </div>

      <input
        id="camera-input"
        ref={fileRef} type="file" accept="image/*" capture="environment"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
      />
    </div>
  )
}
