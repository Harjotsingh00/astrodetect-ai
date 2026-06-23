import { useState, useEffect } from 'react'

export default function HistoryPage() {
    const [history, setHistory] = useState([])

    useEffect(() => {
        const h = JSON.parse(localStorage.getItem('astro_history') || '[]')
        setHistory(h)
    }, [])

    const colorMap = { green: '#34d399', yellow: '#fbbf24', orange: '#fb923c', red: '#f87171' }

    function clearHistory() {
        localStorage.removeItem('astro_history')
        setHistory([])
    }

    function downloadCSV() {
        const headers = 'Target,Probability,Classification,Period (d),Transits,Timestamp'
        const rows = history.map(h =>
            `${h.target},${(h.probability * 100).toFixed(1)}%,${h.classification},${h.period || 'N/A'},${h.transits},${new Date(h.timestamp).toLocaleString()}`
        )
        const csv = [headers, ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'astrodetect_history.csv'; a.click()
    }

    const glass = { background: 'rgba(15,15,35,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px' }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>Detection History</h1>
                    <p style={{ color: '#475569', fontSize: '14px' }}>{history.length} analyses saved locally</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={downloadCSV} disabled={!history.length} style={{ padding: '9px 18px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                        ⬇️ Export CSV
                    </button>
                    <button onClick={clearHistory} disabled={!history.length} style={{ padding: '9px 18px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                        🗑 Clear
                    </button>
                </div>
            </div>

            {history.length === 0 ? (
                <div style={{ ...glass, padding: '60px', textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.3 }}>🕓</div>
                    <div style={{ color: '#334155', fontSize: '16px' }}>No detections yet — run an analysis from the Detect page</div>
                </div>
            ) : (
                <div style={glass}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'grid', gridTemplateColumns: '1fr 120px 1fr 90px 80px 160px', gap: '12px' }}>
                        {['Target', 'Probability', 'Classification', 'Period', 'Transits', 'Time'].map(h => (
                            <div key={h} style={{ color: '#334155', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
                        ))}
                    </div>
                    {history.map((item, i) => (
                        <div key={item.id} style={{
                            padding: '14px 24px',
                            borderBottom: i < history.length - 1 ? '1px solid rgba(99,102,241,0.07)' : 'none',
                            display: 'grid', gridTemplateColumns: '1fr 120px 1fr 90px 80px 160px', gap: '12px', alignItems: 'center'
                        }}>
                            <div style={{ color: 'white', fontWeight: '600', fontSize: '13px' }}>{item.target}</div>
                            <div style={{ color: colorMap[item.color] || 'white', fontWeight: '700', fontSize: '14px' }}>{(item.probability * 100).toFixed(1)}%</div>
                            <div style={{ color: '#94a3b8', fontSize: '12px' }}>{item.classification}</div>
                            <div style={{ color: '#475569', fontSize: '12px' }}>{item.period ? `${item.period}d` : 'N/A'}</div>
                            <div style={{ color: '#475569', fontSize: '12px' }}>{item.transits}</div>
                            <div style={{ color: '#334155', fontSize: '11px' }}>{new Date(item.timestamp).toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}