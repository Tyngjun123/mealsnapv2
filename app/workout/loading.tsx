export default function WorkoutLoading() {
  return (
    <div style={{ background: '#FAFAF7', minHeight: '100dvh', padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 16px' }}>
      <div style={{ height: 28, width: 160, borderRadius: 8, background: '#E8F5E9', marginBottom: 8 }} className="shimmer" />
      <div style={{ height: 14, width: 120, borderRadius: 6, background: '#F0F0EC' }} className="shimmer" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 24 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ height: 72, borderRadius: 14, background: '#F0F0EC' }} className="shimmer" />
        ))}
      </div>
    </div>
  )
}
