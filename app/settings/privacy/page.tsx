'use client'
import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', paddingBottom: 40 }}>
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D1A', margin: 0 }}>Privacy Policy</h1>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 12, color: '#6B7168', marginBottom: 16 }}>Last updated: April 2026</div>

        {[
          {
            title: 'What data we collect',
            body: 'We collect your Google account information (name, email, profile picture) when you sign in. We store the meals you log including photos, calorie estimates, and nutrition data. We also store your profile preferences such as height, weight, and calorie goals.',
          },
          {
            title: 'How we use your data',
            body: 'Your data is used solely to provide the MealSnap service — showing you your meal history, calculating nutrition totals, and sending you optional reminder emails. We do not sell your data to third parties.',
          },
          {
            title: 'Food photos',
            body: 'Photos you take are uploaded to secure cloud storage (Vercel Blob) and sent to the Google Gemini API for analysis. Photos are stored linked to your account and are deleted if you delete your account.',
          },
          {
            title: 'AI analysis',
            body: 'Meal photos are sent to Google Gemini for nutritional analysis. By using MealSnap you agree to Google\'s API terms of service regarding data processing.',
          },
          {
            title: 'Email communications',
            body: 'If you have meals logged, we may send daily reminder emails via Resend. You can opt out at any time from the Settings > Push Notifications screen.',
          },
          {
            title: 'Data retention',
            body: 'Your data is retained for as long as your account is active. You can export all your data at any time from Profile > Export Data. To request account deletion, contact support@mealsnap.app.',
          },
          {
            title: 'Security',
            body: 'All data is transmitted over HTTPS. Authentication is handled via Google OAuth — we never store your password. Database access is restricted to the application server.',
          },
          {
            title: 'Contact',
            body: 'For privacy questions or deletion requests, email support@mealsnap.app.',
          },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1A', marginBottom: 8 }}>{s.title}</div>
            <div style={{ fontSize: 14, color: '#4A4A4A', lineHeight: 1.7 }}>{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
