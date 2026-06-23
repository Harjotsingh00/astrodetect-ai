export default function ResultCard({ result }) {
  if (!result) return null

  const palette = {
    green: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.4)', text: '#34d399', bar: '#10b981' },
    yellow: { bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.4)', text: '#fbbf24', bar: '#eab308' },
    orange: { bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.4)', text: '#fb923c', bar: '#f97316' },
    red: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.4)', text: '#f87171', bar: '#ef4444' },
  }
  const p = palette[result.color] || palette.red

  return (
    <div style={{
      background: p.bg,
      border: `1.5px solid ${p.border}`,
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ color: '#475569', fontSize: '12px', marginBottom: '6px' }}>
            Target: <span style={{ color: '#94a3b8' }}>{result.target_name || 'Unknown'}</span>
          </div>
          <div style={{ color: p.text, fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em' }}>
            {result.classification}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#475569', fontSize: '11px', marginBottom: '4px' }}>Detection Probability</div>
          <div style={{ color: p.text, fontSize: '42px', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {(result.probability * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Bar */}
      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '999px', height: '6px', marginBottom: '20px' }}>
        <div style={{
          height: '6px', borderRadius: '999px',
          background: p.bar,
          width: `${result.probability * 100}%`,
          transition: 'width 0.8s ease'
        }} />
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
        {[
          { label: 'Transits Found', value: result.transits_detected },
          { label: 'Est. Period', value: result.estimated_period_days ? `${result.estimated_period_days}d` : 'N/A' },
          { label: 'Segments', value: result.segments_analyzed },
          { label: 'Confidence', value: `${result.confidence_pct}%` },
        ].map(m => (
          <div key={m.label} style={{
            background: 'rgba(0,0,0,0.25)',
            borderRadius: '10px', padding: '12px',
            textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ color: '#475569', fontSize: '11px', marginBottom: '6px' }}>{m.label}</div>
            <div style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Ground truth (synthetic only) */}
      {result.true_metadata && Object.keys(result.true_metadata).length > 0 && (
        <div style={{
          marginTop: '16px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '10px', padding: '14px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ color: '#475569', fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Ground Truth (Synthetic)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
            {Object.entries(result.true_metadata).map(([k, v]) => (
              <div key={k}>
                <div style={{ color: '#334155', fontSize: '11px' }}>{k.replace(/_/g, ' ')}</div>
                <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
