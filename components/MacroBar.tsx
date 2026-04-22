interface Props {
  protein: number
  carbs: number
  fat: number
}

export function MacroBar({ protein, carbs, fat }: Props) {
  const macros = [
    { label: 'Protein', value: protein, color: '#4CAF50', unit: 'g' },
    { label: 'Carbs', value: carbs, color: '#FFA726', unit: 'g' },
    { label: 'Fat', value: fat, color: '#42A5F5', unit: 'g' },
  ]
  const total = protein + carbs + fat || 1

  return (
    <div style={{ width: '100%' }}>
      {/* Bar */}
      <div style={{
        display: 'flex', borderRadius: 8, overflow: 'hidden', height: 8, marginBottom: 12,
      }}>
        {macros.map((m) => (
          <div key={m.label} style={{
            flex: m.value / total,
            background: m.color,
            transition: 'flex 0.4s ease',
          }}/>
        ))}
      </div>
      {/* Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {macros.map((m) => (
          <div key={m.label} style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: m.color, display: 'inline-block' }}/>
              <span style={{ fontSize: 11, color: '#6B7168', fontWeight: 500 }}>{m.label}</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1D1A', fontVariantNumeric: 'tabular-nums' }}>
              {m.value}{m.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
