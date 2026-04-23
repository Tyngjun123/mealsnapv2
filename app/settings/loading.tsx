export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 100px' }}>
      <div style={{ height: 28, width: 120, borderRadius: 8, background: '#E8E8E8', marginBottom: 24 }} className="skeleton"/>
      {[1,2,3].map(i => (
        <div key={i} style={{ marginBottom: 20 }}>
          <div style={{ height: 14, width: 80, borderRadius: 6, background: '#E8E8E8', marginBottom: 8 }} className="skeleton"/>
          <div style={{ height: 120, borderRadius: 16, background: '#E8E8E8' }} className="skeleton"/>
        </div>
      ))}
    </div>
  )
}
