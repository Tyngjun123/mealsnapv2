export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 100px' }}>
      <div style={{ height: 28, width: 120, borderRadius: 8, background: '#E8E8E8', marginBottom: 20 }} className="skeleton"/>
      {[1,2,3].map(i => (
        <div key={i} style={{ height: 100, borderRadius: 16, background: '#E8E8E8', marginBottom: 12 }} className="skeleton"/>
      ))}
    </div>
  )
}
