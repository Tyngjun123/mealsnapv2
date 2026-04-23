'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Mode = 'starting' | 'live' | 'preview' | 'denied' | 'fallback'

export default function CameraPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [mode, setMode] = useState<Mode>('starting')
  const [preview, setPreview] = useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)

  // Start camera on mount
  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMode('fallback')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setMode('live')
      } catch (err: unknown) {
        if (cancelled) return
        const name = err instanceof Error ? err.name : ''
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          setMode('denied')
        } else {
          setMode('fallback')
        }
      }
    }

    startCamera()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  function stopStream() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  function captureFrame() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      if (!blob) return
      setCapturedBlob(blob)
      setPreview(URL.createObjectURL(blob))
      stopStream()
      setMode('preview')
    }, 'image/jpeg', 0.92)
  }

  function retake() {
    setPreview(null)
    setCapturedBlob(null)
    setMode('starting')
    // Re-start camera
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false,
    }).then(stream => {
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setMode('live')
    }).catch(() => setMode('fallback'))
  }

  const handleFileChange = useCallback((file: File) => {
    setCapturedBlob(file)
    setPreview(URL.createObjectURL(file))
    stopStream()
    setMode('preview')
  }, [])

  async function handleAnalyze() {
    if (!capturedBlob) return
    setLoading(true)
    const formData = new FormData()
    formData.append('image', capturedBlob, 'photo.jpg')
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

  const corners = [
    { top: 80, left: 40 },
    { top: 80, right: 40 },
    { bottom: 80, left: 40 },
    { bottom: 80, right: 40 },
  ] as React.CSSProperties[]

  return (
    <div style={{ height: '100dvh', background: '#000', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* Live video feed */}
      <video ref={videoRef} playsInline muted style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        objectFit: 'cover', zIndex: 0,
        display: mode === 'live' ? 'block' : 'none',
      }} />

      {/* Captured photo preview */}
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="preview" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0,
        }} />
      )}

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Top bar */}
      <div style={{
        position: 'relative', zIndex: 10,
        paddingTop: 'max(52px, calc(env(safe-area-inset-top) + 12px))',
        paddingLeft: 16, paddingRight: 16, paddingBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
      }}>
        <button onClick={() => { stopStream(); router.push('/') }} style={{
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
            <button key={m.label} onClick={() => { stopStream(); router.push(m.path) }} style={{
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

      {/* Viewfinder brackets — shown on live or fallback */}
      {mode !== 'preview' && !preview && (
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {corners.map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', ...pos, width: 28, height: 28,
              borderColor: '#4CAF50', borderStyle: 'solid',
              borderWidth: i === 0 ? '2px 0 0 2px' : i === 1 ? '2px 2px 0 0' : i === 2 ? '0 0 2px 2px' : '0 2px 2px 0',
            }} />
          ))}

          {/* Denied state */}
          {mode === 'denied' && (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)', padding: 32 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🚫</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Camera access denied</div>
              <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 20 }}>Allow camera in your browser settings, or use the gallery below</div>
            </div>
          )}

          {/* Fallback (no getUserMedia) */}
          {mode === 'fallback' && (
            <label htmlFor="camera-input" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>📷</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Tap to open camera</div>
              <div style={{ fontSize: 12, marginTop: 6, opacity: 0.6 }}>or use gallery below</div>
            </label>
          )}

          {/* Starting spinner */}
          {mode === 'starting' && (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              <div style={{ fontSize: 13 }}>Opening camera…</div>
            </div>
          )}
        </div>
      )}

      {preview && <div style={{ flex: 1 }} />}

      {/* Bottom controls */}
      <div style={{
        position: 'relative', zIndex: 10,
        paddingTop: 24, paddingLeft: 40, paddingRight: 40,
        paddingBottom: 'max(40px, calc(env(safe-area-inset-bottom) + 24px))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 60%, transparent)',
      }}>
        {/* Gallery picker */}
        <button onClick={() => fileRef.current?.click()} style={{
          width: 50, height: 50, borderRadius: 14,
          background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>🖼️</button>

        {/* Main shutter / confirm */}
        <button
          onClick={mode === 'preview' ? handleAnalyze : mode === 'live' ? captureFrame : () => fileRef.current?.click()}
          disabled={loading || mode === 'starting'}
          style={{
            width: 76, height: 76, borderRadius: '50%',
            background: loading ? 'rgba(107,113,104,0.9)' : 'linear-gradient(135deg, #4CAF50, #2E7D32)',
            border: '3px solid rgba(255,255,255,0.35)',
            cursor: (loading || mode === 'starting') ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: loading ? 13 : 28, color: '#fff', fontWeight: 700,
            fontFamily: 'inherit',
            boxShadow: loading ? 'none' : '0 6px 24px rgba(76,175,80,0.5)',
            transition: 'all 0.2s',
            opacity: mode === 'starting' ? 0.5 : 1,
          }}>
          {loading ? 'AI…' : mode === 'preview' ? '✓' : '📷'}
        </button>

        {/* Retake */}
        {mode === 'preview' ? (
          <button onClick={retake} style={{
            width: 50, height: 50, borderRadius: 14,
            background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>🔄</button>
        ) : <div style={{ width: 50 }} />}
      </div>

      {/* Hidden file input for gallery fallback */}
      <input
        id="camera-input"
        ref={fileRef} type="file" accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) handleFileChange(e.target.files[0]) }}
      />
    </div>
  )
}
