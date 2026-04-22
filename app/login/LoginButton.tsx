'use client'
import { signIn } from 'next-auth/react'

export function LoginButton() {
  return (
    <button
      onClick={() => signIn('google', { callbackUrl: '/' })}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, width: '100%', maxWidth: 320,
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
      {/* Google G logo */}
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2v6h7.8c4.5-4.2 7.1-10.3 7.1-17.2z"/>
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.8-6c-2.1 1.4-4.9 2.3-8.1 2.3-6.2 0-11.5-4.2-13.4-9.9H2.6v6.2C6.6 42.7 14.7 48 24 48z"/>
        <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6v-6.2H2.6C1 16.3 0 20 0 24s1 7.7 2.6 10.8l8-6.2z"/>
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.9 2.4 30.5 0 24 0 14.7 0 6.6 5.3 2.6 13.2l8 6.2C12.5 13.7 17.8 9.5 24 9.5z"/>
      </svg>
      Continue with Google
    </button>
  )
}
