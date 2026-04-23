export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 100px' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: 80, borderRadius: 16, background: '#E8E8E8' }} className="skeleton"/>)}
      </div>
      <div style={{ height: 200, borderRadius: 16, background: '#E8E8E8', marginBottom: 12 }} className="skeleton"/>
      {[1,2,3].map(i => <div key={i} style={{ height: 60, borderRadius: 12, background: '#E8E8E8', marginBottom: 8 }} className="skeleton"/>)}
    </div>
  )
}
