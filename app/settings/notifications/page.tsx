'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotificationsPage() {
  const router = useRouter()
  const [dailyReminder, setDailyReminder] = useState(false)
  const [reminderTime, setReminderTime]   = useState('11:00')
  const [mealLogged, setMealLogged]       = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem('notifPrefs') ?? '{}')
      if (prefs.dailyReminder !== undefined) setDailyReminder(prefs.dailyReminder)
      if (prefs.reminderTime)  setReminderTime(prefs.reminderTime)
      if (prefs.mealLogged !== undefined)    setMealLogged(prefs.mealLogged)
    } catch {}
  }, [])

  function save() {
    localStorage.setItem('notifPrefs', JSON.stringify({ dailyReminder, reminderTime, mealLogged }))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7' }}>
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D1A', margin: 0 }}>Push Notifications</h1>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div className="card" style={{ padding: '0 16px', marginBottom: 16 }}>
          <Toggle label="Daily Reminder" desc="Get reminded to log your meals" value={dailyReminder} onChange={setDailyReminder}/>
          {dailyReminder && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid #F5F5F0' }}>
              <div>
                <div style={{ fontSize: 15, color: '#1A1D1A' }}>Reminder Time</div>
                <div style={{ fontSize: 12, color: '#6B7168', marginTop: 2 }}>When to send the daily nudge</div>
              </div>
              <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)}
                style={{ border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '8px 12px', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', outline: 'none', color: '#1A1D1A', background: '#F5F5F0' }}
              />
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '0 16px', marginBottom: 24 }}>
          <Toggle label="Meal Logged" desc="Confirm when a meal is saved" value={mealLogged} onChange={setMealLogged}/>
        </div>

        <button className="btn-primary" style={{ width: '100%' }} onClick={save}>
          {saved ? '✓ Saved!' : 'Save Preferences'}
        </button>

        <div style={{ marginTop: 16, padding: 16, borderRadius: 14, background: '#FFF8E1', border: '1px solid #FFE082' }}>
          <div style={{ fontSize: 13, color: '#5D4037', fontWeight: 500, lineHeight: 1.5 }}>
            Note: Push notifications require your browser to grant permission. Email reminders are sent via the daily cron job regardless of this setting.
          </div>
        </div>
      </div>
    </div>
  )
}

function Toggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
      <div>
        <div style={{ fontSize: 15, color: '#1A1D1A' }}>{label}</div>
        <div style={{ fontSize: 12, color: '#6B7168', marginTop: 2 }}>{desc}</div>
      </div>
      <button onClick={() => onChange(!value)} style={{
        width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', padding: 0,
        background: value ? '#4CAF50' : '#E0E0E0', transition: 'background 0.2s', position: 'relative', flexShrink: 0,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3, left: value ? 23 : 3,
          transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }}/>
      </button>
    </div>
  )
}
