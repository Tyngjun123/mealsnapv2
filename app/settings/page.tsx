'use client'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { BottomNav } from '@/components/BottomNav'

const SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: '👤', label: 'Profile',            path: '/profile' },
      { icon: '🎯', label: 'Goals',               path: '/goals'   },
      { icon: '📊', label: 'Progress',            path: '/progress' },
      { icon: '🍽️', label: 'Nutrition Details',  path: '/nutrition' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: '🔔', label: 'Push Notifications',  path: '/settings/notifications' },
      { icon: '📅', label: 'Weekly Report',        path: '/settings/weekly-report'  },
      { icon: '🌍', label: 'Units',                path: '/settings/units'          },
    ],
  },
  {
    title: 'App',
    items: [
      { icon: '📤', label: 'Export Data (JSON)',   path: '_export' },
      { icon: '❓', label: 'Help & Support',        path: '/settings/help' },
      { icon: '📋', label: 'Privacy Policy',        path: '/settings/privacy' },
    ],
  },
]

export default function SettingsPage() {
  const router = useRouter()

  function handleItem(path: string) {
    if (path === '_export') {
      fetch('/api/meals?export=1')
        .then(r => r.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `mealsnap-export-${new Date().toISOString().split('T')[0]}.json`
          a.click()
        })
    } else {
      router.push(path)
    }
  }

  return (
    <div className="page-bottom" style={{ background: '#FAFAF7' }}>
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>←</button>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D1A', margin: 0 }}>Settings</h1>
      </div>

      <div style={{ padding: '0 16px' }}>
        {SECTIONS.map(section => (
          <div key={section.title} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              {section.title}
            </div>
            <div className="card" style={{ padding: '0 16px' }}>
              {section.items.map((item, i, arr) => (
                <button key={item.label} onClick={() => handleItem(item.path)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 0', border: 'none', background: 'none', cursor: 'pointer',
                  borderBottom: i < arr.length - 1 ? '1px solid #F5F5F0' : 'none',
                  fontFamily: 'inherit', textAlign: 'left',
                }}>
                  <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ fontSize: 15, color: '#1A1D1A', flex: 1 }}>{item.label}</span>
                  <span style={{ fontSize: 16, color: '#C0C0C0' }}>›</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Pro banner */}
        <div style={{ borderRadius: 20, background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', padding: '20px', textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>⭐</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Upgrade to Pro</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: '4px 0 12px' }}>
            Unlimited AI scans · Advanced stats · Cloud backup
          </div>
          <button style={{ background: '#fff', color: '#2E7D32', border: 'none', borderRadius: 12, padding: '10px 24px', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            $4.99/month →
          </button>
        </div>

        {/* Sign out */}
        <div className="card" style={{ padding: '0 16px', marginBottom: 20 }}>
          <button onClick={() => signOut({ callbackUrl: '/login' })} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>🚪</span>
            <span style={{ fontSize: 15, color: '#F44336', fontWeight: 600 }}>Sign Out</span>
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
