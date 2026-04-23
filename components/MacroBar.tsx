interface Props {
  protein: number
  carbs: number
  fat: number
  proteinTarget?: number
  carbsTarget?: number
  fatTarget?: number
}

export function MacroBar({ protein, carbs, fat, proteinTarget, carbsTarget, fatTarget }: Props) {
  const macros = [
    { label: 'Protein', value: protein, target: proteinTarget, color: '#4CAF50', unit: 'g' },
    { label: 'Carbs',   value: carbs,   target: carbsTarget,   color: '#FFA726', unit: 'g' },
    { label: 'Fat',     value: fat,     target: fatTarget,     color: '#42A5F5', unit: 'g' },
  ]
  const total = protein + carbs + fat || 1

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 8, marginBottom: 12 }}>
        {macros.map((m) => (
          <div key={m.label} style={{ flex: m.value / total, background: m.color, transition: 'flex 0.4s ease' }}/>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {macros.map((m) => (
          <div key={m.label} style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: m.color, display: 'inline-block' }}/>
              <span style={{ fontSize: 11, color: '#6B7168', fontWeight: 500 }}>{m.label}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1D1A', fontVariantNumeric: 'tabular-nums' }}>
              {m.value}
              {m.target ? (
                <span style={{ fontSize: 11, fontWeight: 500, color: '#9E9E9E' }}>/{m.target}{m.unit}</span>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 500, color: '#9E9E9E' }}>{m.unit}</span>
              )}
            </div>
            {m.target && (
              <div style={{ height: 3, borderRadius: 2, background: '#F0F0EC', marginTop: 3, width: 48, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 2, background: m.color, width: `${Math.min(100, (m.value / m.target) * 100)}%`, transition: 'width 0.4s ease' }}/>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
