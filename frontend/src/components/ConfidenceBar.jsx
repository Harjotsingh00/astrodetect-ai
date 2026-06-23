export default function ConfidenceBar({ ci }) {
    if (!ci) return null
    const pct = (v) => (v * 100).toFixed(1)
    const width = ((ci.ci_high - ci.ci_low) * 100)
    const left = (ci.ci_low * 100)

    return (
        <div style={{ background: 'rgba(15,15,35,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                    <div style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>Bootstrap Confidence Interval</div>
                    <div style={{ color: '#475569', fontSize: '11px', marginTop: '2px' }}>{ci.n_bootstrap} bootstrap samples · 90% CI</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#c084fc', fontWeight: '800', fontSize: '18px' }}>{pct(ci.mean)}%</div>
                    <div style={{ color: '#475569', fontSize: '11px' }}>Mean ± {pct(ci.std)}%</div>
                </div>
            </div>
            <div style={{ position: 'relative', height: '8px', background: '#0f1729', borderRadius: '999px' }}>
                <div style={{ position: 'absolute', left: `${left}%`, width: `${width}%`, height: '8px', background: 'rgba(168,85,247,0.4)', border: '1px solid rgba(168,85,247,0.6)', borderRadius: '999px' }} />
                <div style={{ position: 'absolute', left: `${ci.mean * 100}%`, transform: 'translateX(-50%)', width: '3px', height: '8px', background: '#c084fc', borderRadius: '2px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ color: '#334155', fontSize: '11px' }}>CI Low: {pct(ci.ci_low)}%</span>
                <span style={{ color: '#334155', fontSize: '11px' }}>CI High: {pct(ci.ci_high)}%</span>
            </div>
        </div>
    )
}