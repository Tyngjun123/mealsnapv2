'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotificationsPage() {
  const router = useRouter()
  const [pushEnabled, setPushEnabled]   = useState(false)
  const [reminderTime, setReminderTime] = useState('11:00')
  const [status, setStatus]             = useState<'idle' | 'requesting' | 'saving' | 'done' | 'denied' | 'unsupported'>('idle')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported'); return
    }
    // Reflect current permission state
    if (Notification.permission === 'granted') setPushEnabled(true)
    if (Notification.permission === 'denied')  setStatus('denied')

    const prefs = JSON.parse(localStorage.getItem('notifPrefs') ?? '{}')
    if (prefs.reminderTime) setReminderTime(prefs.reminderTime)
  }, [])

  async function registerSW() {
    return navigator.serviceWorker.register('/sw.js')
  }

  async function handleToggle(enable: boolean) {
    if (!enable) {
      // Unsubscribe
      setStatus('saving')
      const reg = await navigator.serviceWorker.getRegistration('/sw.js')
      if (reg) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) await sub.unsubscribe()
      }
      await fetch('/api/push/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unsubscribe: true }),
      })
      setPushEnabled(false)
      setStatus('idle')
      return
    }

    // Request permission + subscribe
    setStatus('requesting')
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') { setStatus('denied'); return }

    setStatus('saving')
    try {
      const reg = await registerSW()
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })
      await fetch('/api/push/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      })
      setPushEnabled(true)
      setStatus('done')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('idle')
    }
  }

  function saveTime() {
    localStorage.setItem('notifPrefs', JSON.stringify({ reminderTime }))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7' }}>
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D1A', margin: 0 }}>Push Notifications</h1>
      </div>

      <div style={{ padding: '0 16px' }}>
        {status === 'unsupported' && (
          <div style={{ padding: 16, borderRadius: 14, background: '#FFF8E1', border: '1px solid #FFE082', marginBottom: 16, fontSize: 13, color: '#5D4037' }}>
            Push notifications are not supported on this browser. Try adding the app to your home screen first.
          </div>
        )}

        {status === 'denied' && (
          <div style={{ padding: 16, borderRadius: 14, background: '#FFEBEE', border: '1px solid #FFCDD2', marginBottom: 16, fontSize: 13, color: '#C62828' }}>
            Notifications are blocked. Go to your browser Settings → Site Settings → Notifications and allow MealSnap.
          </div>
        )}

        <div className="card" style={{ padding: '0 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: pushEnabled ? '1px solid #F5F5F0' : 'none' }}>
            <div>
              <div style={{ fontSize: 15, color: '#1A1D1A' }}>Daily Reminder</div>
              <div style={{ fontSize: 12, color: '#6B7168', marginTop: 2 }}>
                {status === 'requesting' ? 'Requesting permission…' :
                 status === 'saving'     ? 'Saving…' :
                 status === 'done'       ? '✓ Enabled!' :
                 'Get a push notification to log your meals'}
              </div>
            </div>
            <button
              onClick={() => status === 'unsupported' || status === 'denied' ? null : handleToggle(!pushEnabled)}
              style={{
                width: 48, height: 28, borderRadius: 14, border: 'none',
                cursor: status === 'unsupported' || status === 'denied' ? 'default' : 'pointer',
                padding: 0, background: pushEnabled ? '#4CAF50' : '#E0E0E0',
                transition: 'background 0.2s', position: 'relative', flexShrink: 0, opacity: status === 'requesting' || status === 'saving' ? 0.6 : 1,
              }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: pushEnabled ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}/>
            </button>
          </div>

          {pushEnabled && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
              <div>
                <div style={{ fontSize: 15, color: '#1A1D1A' }}>Reminder Time</div>
                <div style={{ fontSize: 12, color: '#6B7168', marginTop: 2 }}>Approximate time to send nudge</div>
              </div>
              <input type="time" value={reminderTime} onChange={e => { setReminderTime(e.target.value); saveTime() }}
                style={{ border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '8px 12px', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', outline: 'none', color: '#1A1D1A', background: '#F5F5F0' }}/>
            </div>
          )}
        </div>

        <div style={{ padding: 16, borderRadius: 14, background: '#E8F5E9', border: '1px solid #C8E6C9', fontSize: 13, color: '#2E7D32', lineHeight: 1.5 }}>
          Push notifications require the app to be installed (Add to Home Screen). Email reminders are sent automatically regardless of this setting.
        </div>
      </div>
    </div>
  )
}
