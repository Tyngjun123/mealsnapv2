export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 100px' }}>
      <div style={{ height: 28, width: 100, borderRadius: 8, background: '#E8E8E8', marginBottom: 6 }} className="skeleton"/>
      <div style={{ height: 16, width: 80, borderRadius: 6, background: '#E8E8E8', marginBottom: 20 }} className="skeleton"/>
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{ flex: 1, height: 64, borderRadius: 14, background: '#E8E8E8' }} className="skeleton"/>
        ))}
      </div>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ height: 80, borderRadius: 16, background: '#E8E8E8', marginBottom: 10 }} className="skeleton"/>
      ))}
    </div>
  )
}
