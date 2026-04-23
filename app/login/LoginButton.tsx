'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export function LoginButton() {
  const [guestLoading, setGuestLoading] = useState(false)

  async function handleGuest() {
    setGuestLoading(true)
    await signIn('guest', { callbackUrl: '/' })
  }

  return (
    <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Google */}
      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 12, width: '100%',
          padding: '14px 24px', borderRadius: 16,
          background: '#fff', border: '1.5px solid rgba(0,0,0,0.12)',
          cursor: 'pointer', fontSize: 15, fontWeight: 700,
          color: '#1A1D1A', fontFamily: 'inherit',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'box-shadow 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.14)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
      >
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2v6h7.8c4.5-4.2 7.1-10.3 7.1-17.2z"/>
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.8-6c-2.1 1.4-4.9 2.3-8.1 2.3-6.2 0-11.5-4.2-13.4-9.9H2.6v6.2C6.6 42.7 14.7 48 24 48z"/>
          <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6v-6.2H2.6C1 16.3 0 20 0 24s1 7.7 2.6 10.8l8-6.2z"/>
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.9 2.4 30.5 0 24 0 14.7 0 6.6 5.3 2.6 13.2l8 6.2C12.5 13.7 17.8 9.5 24 9.5z"/>
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: '#E0E0E0' }}/>
        <span style={{ fontSize: 12, color: '#6B7168', fontWeight: 600 }}>OR</span>
        <div style={{ flex: 1, height: 1, background: '#E0E0E0' }}/>
      </div>

      {/* Guest */}
      <button
        onClick={handleGuest}
        disabled={guestLoading}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, width: '100%',
          padding: '14px 24px', borderRadius: 16,
          background: guestLoading ? '#F5F5F0' : 'transparent',
          border: '1.5px solid #D0D0C8',
          cursor: guestLoading ? 'default' : 'pointer',
          fontSize: 15, fontWeight: 600,
          color: '#6B7168', fontFamily: 'inherit',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { if (!guestLoading) e.currentTarget.style.borderColor = '#4CAF50'; e.currentTarget.style.color = '#4CAF50' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#D0D0C8'; e.currentTarget.style.color = '#6B7168' }}
      >
        <span style={{ fontSize: 18 }}>👤</span>
        {guestLoading ? 'Starting guest session…' : 'Continue as Guest'}
      </button>

      <p style={{ margin: 0, fontSize: 11, color: '#9E9E9E', textAlign: 'center', lineHeight: 1.5 }}>
        Guest sessions are not saved after sign-out.<br/>Sign in with Google to keep your data.
      </p>
    </div>
  )
}
