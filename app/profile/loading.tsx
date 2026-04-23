export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 16px 100px' }}>
      <div style={{ height: 28, width: 100, borderRadius: 8, background: '#E8E8E8', marginBottom: 20 }} className="skeleton"/>
      <div style={{ height: 90, borderRadius: 16, background: '#E8E8E8', marginBottom: 12 }} className="skeleton"/>
      <div style={{ height: 160, borderRadius: 16, background: '#E8E8E8', marginBottom: 12 }} className="skeleton"/>
      <div style={{ height: 120, borderRadius: 16, background: '#E8E8E8', marginBottom: 12 }} className="skeleton"/>
      <div style={{ height: 52, borderRadius: 14, background: '#E8E8E8', marginBottom: 12 }} className="skeleton"/>
      <div style={{ height: 200, borderRadius: 16, background: '#E8E8E8' }} className="skeleton"/>
    </div>
  )
}
