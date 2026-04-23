'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FAQS = [
  {
    q: 'How does the AI meal analysis work?',
    a: 'Take a photo of your food and our AI (Google Gemini) identifies each item and estimates calories, protein, carbs, and fat. You can correct any mistakes by typing in the result screen.',
  },
  {
    q: 'How accurate is the calorie estimate?',
    a: 'The AI gives approximate values based on typical portion sizes. For packaged foods, use the barcode scanner for precise nutrition data from the product label.',
  },
  {
    q: 'How do I scan a barcode?',
    a: 'Tap the barcode icon on the camera screen. Point your camera at the product barcode — it scans automatically. If your product is not found, you can enter the barcode number manually or describe the food instead.',
  },
  {
    q: 'Why is my product not found by the barcode scanner?',
    a: 'We use the Open Food Facts database which has millions of products but may not include every item, especially regional or home-branded products. In that case, use Manual Entry to describe the food.',
  },
  {
    q: 'How do I set my calorie goal?',
    a: 'Go to Profile and use the slider or presets (Lose / Maintain / Gain). For a more personalised goal, go to Goals and fill in your weight, target weight, and activity level.',
  },
  {
    q: 'Can I edit a meal after saving?',
    a: 'Currently you can delete a meal from History and re-log it. Inline editing is planned for a future update.',
  },
  {
    q: 'How do I export my data?',
    a: 'Go to Profile or Settings and tap "Export Data (JSON)". This downloads all your meal history as a JSON file.',
  },
  {
    q: 'What is the daily reminder email?',
    a: "If you haven't logged any meals by 11am, the app sends a gentle reminder to your registered email address. You can adjust notification preferences in Settings.",
  },
]

export default function HelpPage() {
  const router = useRouter()
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', paddingBottom: 40 }}>
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D1A', margin: 0 }}>Help & Support</h1>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7168', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
          Frequently Asked Questions
        </div>

        <div className="card" style={{ padding: '0 16px', marginBottom: 20 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? '1px solid #F5F5F0' : 'none' }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', gap: 12,
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1D1A', flex: 1 }}>{faq.q}</span>
                <span style={{ fontSize: 16, color: '#6B7168', flexShrink: 0, transition: 'transform 0.2s', transform: open === i ? 'rotate(180deg)' : 'none' }}>›</span>
              </button>
              {open === i && (
                <div style={{ paddingBottom: 14, fontSize: 14, color: '#4A4A4A', lineHeight: 1.6 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>📧</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1A', marginBottom: 4 }}>Still need help?</div>
          <div style={{ fontSize: 13, color: '#6B7168' }}>Contact us at support@mealsnap.app</div>
        </div>
      </div>
    </div>
  )
}
