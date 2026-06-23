export default function StatsPanel() {
  const items = [
    { label: 'Model', value: '1D-CNN', icon: '🧠', sub: 'Deep Learning' },
    { label: 'Architecture', value: 'S & V 2018', icon: '📐', sub: 'Peer-reviewed' },
    { label: 'Missions', value: 'Kepler · TESS', icon: '🛰️', sub: 'NASA Archive' },
    { label: 'Window Size', value: '200 pts', icon: '📊', sub: 'Overlapping' },
    { label: 'Classification', value: 'Binary', icon: '⚡', sub: 'Planet / No planet' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '28px' }}>
      {items.map(item => (
        <div key={item.label} style={{
          background: '#0f0f23',
          border: '1px solid #1e1e3a',
          borderRadius: '12px',
          padding: '16px 18px'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '10px' }}>{item.icon}</div>
          <div style={{ color: '#475569', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>{item.label}</div>
          <div style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '2px' }}>{item.value}</div>
          <div style={{ color: '#334155', fontSize: '11px' }}>{item.sub}</div>
        </div>
      ))}
    </div>
  )
}