import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'

const card = { background: 'rgba(15,15,35,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }
const tooltip = { contentStyle: { background: '#0a0a14', border: '1px solid #1e2a4a', borderRadius: '8px', color: 'white', fontSize: '12px' } }

export default function BLSChart({ bls }) {
    if (!bls) return null

    const periodData = bls.periods.map((p, i) => ({ period: parseFloat(p.toFixed(2)), power: parseFloat(bls.power[i].toFixed(3)) }))
    const foldedData = bls.binned_phase.map((p, i) => ({ phase: parseFloat(p.toFixed(3)), flux: parseFloat(bls.binned_flux[i].toFixed(5)) }))

    return (
        <>
            <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                        <div style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>BLS Periodogram</div>
                        <div style={{ color: '#475569', fontSize: '12px', marginTop: '2px' }}>Box Least Squares period search</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#a5b4fc', fontSize: '20px', fontWeight: '800' }}>{bls.best_period}d</div>
                        <div style={{ color: '#475569', fontSize: '11px' }}>Best Period · SNR {bls.snr}</div>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={periodData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#0f1729" />
                        <XAxis dataKey="period" stroke="#1e293b" tick={{ fontSize: 11, fill: '#475569' }} label={{ value: 'Period (days)', fill: '#475569', position: 'insideBottom', offset: -2 }} />
                        <YAxis stroke="#1e293b" tick={{ fontSize: 11, fill: '#475569' }} width={45} />
                        <Tooltip {...tooltip} />
                        <Line type="monotone" dataKey="power" stroke="#a855f7" dot={false} strokeWidth={1.5} />
                    </LineChart>
                </ResponsiveContainer>

                {bls.top_periods.length > 0 && (
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#334155', fontSize: '11px', marginRight: '4px' }}>Top periods:</span>
                        {bls.top_periods.slice(0, 4).map(([p, pw]) => (
                            <span key={p} style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc', fontSize: '11px', padding: '2px 8px', borderRadius: '6px' }}>
                                {p.toFixed(2)}d
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div style={card}>
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>Phase-Folded Light Curve</div>
                    <div style={{ color: '#475569', fontSize: '12px', marginTop: '2px' }}>Folded at best period {bls.best_period}d — transit dip visible near phase 0.5</div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={foldedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#0f1729" />
                        <XAxis dataKey="phase" stroke="#1e293b" tick={{ fontSize: 11, fill: '#475569' }} label={{ value: 'Orbital Phase', fill: '#475569', position: 'insideBottom', offset: -2 }} />
                        <YAxis stroke="#1e293b" tick={{ fontSize: 11, fill: '#475569' }} width={55} />
                        <Tooltip {...tooltip} />
                        <Line type="monotone" dataKey="flux" stroke="#f59e0b" dot={false} strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </>
    )
}