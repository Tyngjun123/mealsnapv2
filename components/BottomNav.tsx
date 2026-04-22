'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
          stroke={active ? '#4CAF50' : '#6B7168'} strokeWidth="2"
          fill={active ? '#E8F5E9' : 'none'} strokeLinejoin="round"/>
        <path d="M9 21V12h6v9" stroke={active ? '#4CAF50' : '#6B7168'} strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/history',
    label: 'History',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="3"
          stroke={active ? '#4CAF50' : '#6B7168'} strokeWidth="2"
          fill={active ? '#E8F5E9' : 'none'}/>
        <path d="M3 9h18M8 2v4M16 2v4" stroke={active ? '#4CAF50' : '#6B7168'} strokeWidth="2" strokeLinecap="round"/>
        <path d="M7 13h2M11 13h2M15 13h2M7 17h2M11 17h2" stroke={active ? '#4CAF50' : '#6B7168'} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/stats',
    label: 'Stats',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <path d="M4 20V14M8 20V8M12 20V12M16 20V4M20 20V10"
          stroke={active ? '#4CAF50' : '#6B7168'} strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" stroke={active ? '#4CAF50' : '#6B7168'} strokeWidth="2"
          fill={active ? '#E8F5E9' : 'none'}/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? '#4CAF50' : '#6B7168'} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 448,
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(0,0,0,0.07)',
      display: 'flex', alignItems: 'center',
      paddingTop: 8,
      paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
      zIndex: 50,
    }}>
      {tabs.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link key={tab.href} href={tab.href} prefetch={false} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 4, textDecoration: 'none',
          }}>
            {tab.icon(active)}
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 500,
              color: active ? '#4CAF50' : '#6B7168',
              letterSpacing: 0.3,
            }}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
