'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DetectedFood } from '@/lib/claude'

function autoMealType() {
  const h = new Date().getHours()
  if (h >= 5  && h < 11) return 'breakfast'
  if (h >= 11 && h < 15) return 'lunch'
  if (h >= 15 && h < 18) return 'snack'
  if (h >= 18 && h < 22) return 'dinner'
  return 'snack'
}

const SUGGESTIONS = ['1 cup of rice', 'grilled chicken 150g', 'banana', 'Starbucks latte', '2 eggs scrambled']

export default function ManualPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSearch(q: string) {
    const text = q || query
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text.trim() }),
      })
      if (res.status === 429) { alert('AI busy — wait 1 minute.'); return }
      if (!res.ok) throw new Error()
      const data = await res.json()
      sessionStorage.setItem('analyzeResult', JSON.stringify({
        foods: data.foods as DetectedFood[],
        imageUrl: null,
        mealType: autoMealType(),
      }))
      router.push('/result')
    } catch {
      alert('Could not estimate nutrition. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7' }}>
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{
          width: 36, height: 36, borderRadius: '50%', border: 'none',
          background: '#fff', cursor: 'pointer', fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D1A', margin: 0 }}>Add Food Manually</h1>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Search box */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch('')}
            placeholder="e.g. nasi lemak, 2 roti canai, large latte..."
            autoFocus
            style={{
              flex: 1, border: '1.5px solid #E0E0E0', borderRadius: 14,
              padding: '14px 16px', fontSize: 15, fontFamily: 'inherit',
              outline: 'none', background: '#fff', color: '#1A1D1A',
            }}
            onFocus={e => (e.target.style.borderColor = '#4CAF50')}
            onBlur={e => (e.target.style.borderColor = '#E0E0E0')}
          />
          <button
            onClick={() => handleSearch('')}
            disabled={!query.trim() || loading}
            className="btn-primary"
            style={{ padding: '0 20px', fontSize: 20, borderRadius: 14, boxShadow: 'none' }}
          >
            {loading ? '...' : '→'}
          </button>
        </div>

        {/* Suggestions */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7168', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Quick picks
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => handleSearch(s)} style={{
                padding: '8px 14px', borderRadius: 999,
                background: '#fff', border: '1px solid #E0E0E0',
                fontSize: 13, fontWeight: 500, color: '#1A1D1A',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D1A', marginBottom: 8 }}>💡 How it works</div>
          {[
            'Type any food, dish, or drink',
            'AI estimates calories & macros',
            'Edit amounts on the next screen',
            'Save to your daily log',
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, alignItems: 'flex-start' }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#E8F5E9', color: '#2E7D32', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontSize: 13, color: '#6B7168' }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
