'use client'

interface Props {
  eaten: number
  goal: number
  size?: number
}

export function CalorieRing({ eaten, goal, size = 180 }: Props) {
  const pct = Math.min(eaten / goal, 1)
  const r = (size - 24) / 2
  const circ = 2 * Math.PI * r
  const dash = pct * circ
  const over = eaten > goal

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke="#E8F5E9" strokeWidth={12}/>
        {/* Progress */}
        <circle cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={over ? '#F44336' : '#4CAF50'}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}/>
      </svg>
      {/* Center text */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontSize: size * 0.2, fontWeight: 800,
          color: over ? '#F44336' : '#1A1D1A',
          lineHeight: 1, letterSpacing: -1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {eaten.toLocaleString()}
        </span>
        <span style={{ fontSize: size * 0.075, color: '#6B7168', fontWeight: 500, marginTop: 2 }}>
          of {goal.toLocaleString()} kcal
        </span>
        <span style={{
          marginTop: 6, fontSize: size * 0.065, fontWeight: 700,
          color: over ? '#F44336' : '#4CAF50',
          background: over ? '#FFEBEE' : '#E8F5E9',
          padding: '2px 8px', borderRadius: 999,
        }}>
          {over ? `+${(eaten - goal).toLocaleString()} over` : `${(goal - eaten).toLocaleString()} left`}
        </span>
      </div>
    </div>
  )
}
