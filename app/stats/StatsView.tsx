'use client'


interface DayTotal { date: string; fullDate: string; kcal: number; protein: number; carbs: number; fat: number }
interface Props { goal: number; totals: DayTotal[] }

export function StatsView({ goal, totals }: Props) {
  const last7 = totals.slice(-7)
  const maxKcal = Math.max(...last7.map(d => d.kcal), goal, 1)

  const avgKcal = last7.length ? Math.round(last7.reduce((s, d) => s + d.kcal, 0) / last7.length) : 0
  const daysLogged = totals.filter(d => d.kcal > 0).length
  const daysUnder = totals.filter(d => d.kcal > 0 && d.kcal <= goal).length
  const streak = (() => {
    let s = 0
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      if (totals.find(t => t.fullDate === key && t.kcal > 0)) s++
      else break
    }
    return s
  })()

  return (
    <div className="page-bottom">
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 20px 20px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D1A', margin: 0, letterSpacing: -0.5 }}>Stats</h1>
        <p style={{ fontSize: 13, color: '#6B7168', margin: '4px 0 0' }}>Last 30 days overview</p>
      </div>

      {/* Summary cards */}
      <div style={{ padding: '0 16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: 'Avg. Daily', value: avgKcal.toLocaleString(), unit: 'kcal', emoji: '📊', color: '#4CAF50', bg: '#E8F5E9' },
          { label: 'Day Streak', value: streak.toString(), unit: 'days', emoji: '🔥', color: '#FF7043', bg: '#FBE9E7' },
          { label: 'Days Logged', value: daysLogged.toString(), unit: 'days', emoji: '📅', color: '#1565C0', bg: '#E3F2FD' },
          { label: 'Under Goal', value: daysUnder.toString(), unit: `of ${daysLogged}`, emoji: '✅', color: '#F9A825', bg: '#FFF8E1' },
        ].map(card => (
          <div key={card.label} className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{card.emoji}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: card.color, fontVariantNumeric: 'tabular-nums' }}>
              {card.value}
            </div>
            <div style={{ fontSize: 10, color: '#6B7168', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {card.unit}
            </div>
            <div style={{ fontSize: 11, color: '#6B7168', marginTop: 2 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* 7-day Bar Chart */}
      <div className="card" style={{ margin: '0 16px 16px', padding: '20px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1A', marginBottom: 4 }}>7-Day Calories</div>
        <div style={{ fontSize: 12, color: '#6B7168', marginBottom: 16 }}>vs daily goal ({goal.toLocaleString()} kcal)</div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
          {last7.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7168', fontSize: 13 }}>
              No data yet
            </div>
          ) : last7.map((d, i) => {
            const pct = d.kcal / maxKcal
            const over = d.kcal > goal
            const day = new Date(d.date).toLocaleDateString('en', { weekday: 'short' })

            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: over ? '#F44336' : '#4CAF50', fontVariantNumeric: 'tabular-nums' }}>
                  {d.kcal > 0 ? d.kcal : ''}
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 90 }}>
                  <div style={{
                    width: '100%', borderRadius: '6px 6px 0 0',
                    height: `${Math.max(pct * 90, d.kcal > 0 ? 4 : 0)}px`,
                    background: over
                      ? 'linear-gradient(to top, #F44336, #EF9A9A)'
                      : 'linear-gradient(to top, #4CAF50, #A5D6A7)',
                    transition: 'height 0.4s ease',
                    position: 'relative',
                  }}>
                    {/* Goal line marker */}
                  </div>
                </div>
                {/* Goal line */}
                <div style={{ fontSize: 10, color: '#6B7168', fontWeight: 500 }}>{day}</div>
              </div>
            )
          })}
        </div>

        {/* Goal reference line label */}
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 2, background: '#FF7043', borderRadius: 1 }}/>
          <span style={{ fontSize: 11, color: '#6B7168' }}>Goal: {goal.toLocaleString()} kcal</span>
        </div>
      </div>

      {/* Macros breakdown (avg) */}
      {last7.length > 0 && (
        <div className="card" style={{ margin: '0 16px', padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1A', marginBottom: 16 }}>Avg. Macros (7 days)</div>
          {[
            { label: 'Protein', value: Math.round(last7.reduce((s, d) => s + d.protein, 0) / last7.length), color: '#4CAF50', unit: 'g' },
            { label: 'Carbohydrates', value: Math.round(last7.reduce((s, d) => s + d.carbs, 0) / last7.length), color: '#FFA726', unit: 'g' },
            { label: 'Fat', value: Math.round(last7.reduce((s, d) => s + d.fat, 0) / last7.length), color: '#42A5F5', unit: 'g' },
          ].map(m => {
            const total = last7.reduce((s, d) => s + d.protein + d.carbs + d.fat, 0) / last7.length || 1
            const pct = (m.value / total) * 100

            return (
              <div key={m.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1D1A' }}>{m.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.value}{m.unit} ({Math.round(pct)}%)</span>
                </div>
                <div style={{ height: 6, background: '#F0F0F0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: m.color, borderRadius: 4, transition: 'width 0.5s ease' }}/>
                </div>
              </div>
            )
          })}
        </div>
      )}


    </div>
  )
}
