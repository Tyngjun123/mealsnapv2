export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 0 100px' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #E8E8E8', marginBottom: 0 }}>
        {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: 44, background: '#E8E8E8', margin: '8px 8px 0' }} className="skeleton"/>)}
      </div>
      <div style={{ padding: '20px 16px' }}>
        <div style={{ width: 180, height: 180, borderRadius: '50%', background: '#E8E8E8', margin: '0 auto 24px' }} className="skeleton"/>
        <div style={{ height: 140, borderRadius: 16, background: '#E8E8E8' }} className="skeleton"/>
      </div>
    </div>
  )
}
